// Merges all downloaded vocabulary datasets into one deduped "word universe" CSV.
// Output columns: word, source_lists, cefr_level, frequency_rank, pos, en_definition, ja_translation
// Run: node data/merge-word-universe.mjs

import { readFileSync, writeFileSync } from "node:fs";

const RAW = "data/raw";
const OUT = "data/processed/word-universe.csv";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuote) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQuote = false;
      else cell += c;
    } else {
      if (c === '"') inQuote = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (cell !== "" || row.length > 0) { row.push(cell); rows.push(row); row = []; cell = ""; }
        if (c === "\r" && text[i + 1] === "\n") i++;
      } else cell += c;
    }
  }
  if (cell !== "" || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

const universe = new Map(); // lemma(lowercase) -> { word, sources:Set, cefr, rank, pos, defn, ja }

function add(rawWord, source, opts = {}) {
  if (!rawWord) return;
  const word = rawWord.trim().toLowerCase().replace(/^"|"$/g, "");
  // skip multi-word entries with weird chars; keep simple lemmas
  if (!/^[a-z][a-z\-' ]{0,30}$/.test(word)) return;
  if (word.length < 2) return;
  let entry = universe.get(word);
  if (!entry) {
    entry = { word, sources: new Set(), cefr: null, rank: null, pos: null, defn: null, ja: null };
    universe.set(word, entry);
  }
  entry.sources.add(source);
  if (opts.cefr && !entry.cefr) entry.cefr = opts.cefr;
  if (opts.rank != null && (entry.rank == null || opts.rank < entry.rank)) entry.rank = opts.rank;
  if (opts.pos && !entry.pos) entry.pos = opts.pos;
  if (opts.defn && !entry.defn) entry.defn = opts.defn;
  if (opts.ja && !entry.ja) entry.ja = opts.ja;
}

// 1. NGSL EN-JA (Rank, Lemma, POS, Definition, Japanese)
{
  const rows = parseCsv(readFileSync(`${RAW}/NGSL-1.01_en_ja.csv`, "utf8"));
  for (let i = 1; i < rows.length; i++) {
    const [rank, lemma, pos, defn, ja] = rows[i];
    add(lemma, "NGSL", { rank: Number(rank) || null, pos, defn, ja });
  }
}
// 2. NGSL Supplemental
{
  const rows = parseCsv(readFileSync(`${RAW}/NGSL-1.01_Supplemental.csv`, "utf8"));
  for (const row of rows) add(row[0], "NGSL");
}
// 3. NAWL EN-JA (Meanings, English Definition, POS, J Translation)
{
  const rows = parseCsv(readFileSync(`${RAW}/NAWL-1.0_en_ja.csv`, "utf8"));
  for (let i = 1; i < rows.length; i++) {
    const [lemma, defn, pos, ja] = rows[i];
    add(lemma, "NAWL", { pos, defn, ja });
  }
}
// 4. TSL (TSL Word, TSL Definition) — TOEIC
{
  const rows = parseCsv(readFileSync(`${RAW}/TSL-1.1_en.csv`, "utf8"));
  for (let i = 1; i < rows.length; i++) {
    const [lemma, defn] = rows[i];
    add(lemma, "TSL", { defn });
  }
}
// 5. BSL — Business (one word per line)
{
  const lines = readFileSync(`${RAW}/BSL-1.01.txt`, "utf8").split(/\r?\n/);
  for (const line of lines) add(line, "BSL");
}
// 6. NGSL-Spoken
{
  const rows = parseCsv(readFileSync(`${RAW}/NGSL-Spoken_1.2_en.csv`, "utf8"));
  for (let i = 1; i < rows.length; i++) add(rows[i][0], "NGSL-Spoken");
}
// 7. CEFR-J (headword, pos, CEFR, ...)
{
  const rows = parseCsv(readFileSync(`${RAW}/cefrj-vocabulary-profile-1.5.csv`, "utf8"));
  for (let i = 1; i < rows.length; i++) {
    const [headword, pos, cefr] = rows[i];
    if (!headword) continue;
    // headword may have multiple slash variants; take first
    const lemma = headword.split("/")[0];
    add(lemma, "CEFR-J", { pos, cefr });
  }
}

// Output sorted by frequency rank (NGSL rank when available, else by source priority)
const sourcePriority = ["NGSL", "TSL", "NAWL", "BSL", "CEFR-J", "NGSL-Spoken"];
const arr = [...universe.values()].sort((a, b) => {
  if (a.rank != null && b.rank != null) return a.rank - b.rank;
  if (a.rank != null) return -1;
  if (b.rank != null) return 1;
  return a.word.localeCompare(b.word);
});

// Stats by source
const stats = {};
for (const v of arr) for (const s of v.sources) stats[s] = (stats[s] || 0) + 1;
const cefrStats = {};
for (const v of arr) {
  const k = v.cefr || "(unleveled)";
  cefrStats[k] = (cefrStats[k] || 0) + 1;
}

console.log(`Total unique words: ${arr.length}`);
console.log("By source:", stats);
console.log("By CEFR level:", cefrStats);
console.log("With JP translation:", arr.filter((v) => v.ja).length);
console.log("With EN definition:", arr.filter((v) => v.defn).length);

// Write CSV
function csvEscape(s) {
  if (s == null) return "";
  const str = String(s);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}
const header = "word,source_lists,cefr_level,frequency_rank,pos,en_definition,ja_translation";
const lines = [header];
for (const v of arr) {
  lines.push(
    [
      v.word,
      [...v.sources].join("|"),
      v.cefr || "",
      v.rank ?? "",
      v.pos || "",
      v.defn || "",
      v.ja || "",
    ].map(csvEscape).join(","),
  );
}
writeFileSync(OUT, lines.join("\n"));
console.log(`Wrote ${OUT} (${lines.length - 1} rows)`);
