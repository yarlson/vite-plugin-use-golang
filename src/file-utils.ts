import { createHash } from "crypto";

export function generateFileId(filePath: string): string {
  return createHash("md5").update(filePath).digest("hex").slice(0, 8);
}

export function sanitizePath(filePath: string): string {
  return filePath.replace(/^\//, "").replace(/[/.]/g, "_");
}
