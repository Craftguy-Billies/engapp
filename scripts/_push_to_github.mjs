// One-shot: push current working tree (git ls-files) to GitHub via REST API.
// No local git push needed.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const TOKEN = process.env.GH_TOKEN;
const REPO = process.env.GH_REPO; // e.g. "Craftguy-Billies/engapp"
const BRANCH = process.env.GH_BRANCH || "main";
const MESSAGE = process.env.GH_MESSAGE || "Sync from Replit workspace";

if (!TOKEN || !REPO) {
  console.error("Set GH_TOKEN and GH_REPO");
  process.exit(1);
}

const API = `https://api.github.com/repos/${REPO}`;
const HDRS = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "replit-sync-script",
};

async function gh(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { ...HDRS, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${txt.slice(0, 300)}`);
  }
  return res.json();
}

const files = execSync("git --no-optional-locks ls-files -z", { encoding: "buffer" })
  .toString("utf8")
  .split("\0")
  .filter(Boolean);
console.log(`Found ${files.length} tracked files.`);

// Detect file mode: 100644 normal, 100755 executable, 120000 symlink
function modeOf(path) {
  const out = execSync(`git --no-optional-locks ls-files -s -- "${path.replace(/"/g, '\\"')}"`, { encoding: "utf8" }).trim();
  // format: "<mode> <sha> <stage>\t<path>"
  const m = out.split(/\s+/)[0];
  return m || "100644";
}

const limit = 8;
let inFlight = 0;
let idx = 0;
const results = new Array(files.length);

async function uploadOne(i) {
  const path = files[i];
  const buf = readFileSync(path);
  const blob = await gh("POST", "/git/blobs", {
    content: buf.toString("base64"),
    encoding: "base64",
  });
  results[i] = { path, mode: modeOf(path), type: "blob", sha: blob.sha };
  if ((i + 1) % 20 === 0 || i === files.length - 1) {
    console.log(`  uploaded ${i + 1}/${files.length}`);
  }
}

async function runPool() {
  await new Promise((resolve, reject) => {
    let active = 0;
    let failed = false;
    function next() {
      if (failed) return;
      while (active < limit && idx < files.length) {
        const i = idx++;
        active++;
        uploadOne(i)
          .then(() => {
            active--;
            if (idx >= files.length && active === 0) resolve();
            else next();
          })
          .catch((e) => {
            if (!failed) {
              failed = true;
              reject(e);
            }
          });
      }
    }
    next();
  });
}

console.log("Uploading blobs...");
await runPool();

console.log("Getting current branch ref...");
let parentSha = null;
try {
  const ref = await gh("GET", `/git/ref/heads/${BRANCH}`);
  parentSha = ref.object.sha;
  console.log(`  parent commit: ${parentSha}`);
} catch (e) {
  console.log(`  no existing ref (${e.message.slice(0, 100)}), creating fresh history`);
}

let baseTreeSha = null;
if (parentSha) {
  const parentCommit = await gh("GET", `/git/commits/${parentSha}`);
  baseTreeSha = parentCommit.tree.sha;
}

console.log("Creating tree...");
// Force a fresh tree (no base_tree) so deletions are honored — represents working set exactly.
const tree = await gh("POST", "/git/trees", {
  tree: results,
});
console.log(`  tree: ${tree.sha}`);

console.log("Creating commit...");
const commit = await gh("POST", "/git/commits", {
  message: MESSAGE,
  tree: tree.sha,
  parents: parentSha ? [parentSha] : [],
});
console.log(`  commit: ${commit.sha}`);

console.log("Updating branch ref (force)...");
try {
  await gh("PATCH", `/git/refs/heads/${BRANCH}`, { sha: commit.sha, force: true });
} catch (e) {
  if (String(e).includes("422") || String(e).includes("404")) {
    console.log("  ref update failed, trying create...");
    await gh("POST", "/git/refs", { ref: `refs/heads/${BRANCH}`, sha: commit.sha });
  } else {
    throw e;
  }
}
console.log(`✓ Pushed ${files.length} files to ${REPO}@${BRANCH} (${commit.sha.slice(0, 7)})`);
