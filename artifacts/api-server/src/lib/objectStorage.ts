import { Storage, File } from "@google-cloud/storage";
import { Readable } from "stream";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export function getPrivateObjectDir(): string {
  const dir = process.env.PRIVATE_OBJECT_DIR || "";
  if (!dir) {
    throw new Error("PRIVATE_OBJECT_DIR is not set. Provision object storage.");
  }
  return dir;
}

export function parseObjectPath(path: string): { bucketName: string; objectName: string } {
  const p = path.startsWith("/") ? path : `/${path}`;
  const parts = p.split("/").filter(Boolean);
  if (parts.length < 2) throw new Error(`Invalid object path: ${path}`);
  return { bucketName: parts[0], objectName: parts.slice(1).join("/") };
}

export async function streamObjectToResponse(
  file: File,
  res: import("express").Response,
  cacheTtlSec = 86400,
) {
  const [exists] = await file.exists();
  if (!exists) throw new ObjectNotFoundError();
  const [metadata] = await file.getMetadata();

  res.setHeader("Content-Type", (metadata.contentType as string) || "application/octet-stream");
  res.setHeader("Cache-Control", `public, max-age=${cacheTtlSec}, immutable`);
  if (metadata.size) res.setHeader("Content-Length", String(metadata.size));

  const nodeStream = file.createReadStream();
  return new Promise<void>((resolve, reject) => {
    nodeStream.on("error", reject);
    nodeStream.on("end", resolve);
    nodeStream.pipe(res);
  });
}

/**
 * Upload a buffer to GCS at <PRIVATE_OBJECT_DIR>/<key>. Returns the key (relative path).
 */
export async function uploadBufferToObjectStore(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const fullPath = `${getPrivateObjectDir().replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
  const { bucketName, objectName } = parseObjectPath(fullPath);
  const file = objectStorageClient.bucket(bucketName).file(objectName);
  await file.save(buffer, {
    contentType,
    resumable: false,
    metadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
  });
  return key;
}

/**
 * Resolve a key (e.g. "images/12_3.png") to a GCS File handle under PRIVATE_OBJECT_DIR.
 */
export function getStoredFile(key: string): File {
  const fullPath = `${getPrivateObjectDir().replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
  const { bucketName, objectName } = parseObjectPath(fullPath);
  return objectStorageClient.bucket(bucketName).file(objectName);
}

export { Readable };
