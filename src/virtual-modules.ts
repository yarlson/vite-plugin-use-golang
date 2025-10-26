import { readFile } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

const VIRTUAL_PREFIX = "/@vite-golang/";

export function isVirtualModule(id: string): boolean {
  return id.startsWith(VIRTUAL_PREFIX);
}

export function resolveVirtualModule(
  id: string,
  buildDir: string,
): string | null {
  if (!isVirtualModule(id)) {
    return null;
  }

  const path = id.slice(VIRTUAL_PREFIX.length);

  if (path === "wasm_exec.js") {
    // Return path to wasm_exec.js from TinyGo
    return "wasm_exec.js";
  }

  // WASM files in subdirectories
  if (path.endsWith(".wasm")) {
    return join(buildDir, path);
  }

  return null;
}

export async function loadVirtualModule(
  id: string,
  buildDir: string,
): Promise<string | null> {
  if (id === "wasm_exec.js") {
    // Try to find wasm_exec.js from TinyGo installation
    try {
      const tinygoRoot = execSync("tinygo env TINYGOROOT", {
        encoding: "utf-8",
      }).trim();
      const wasmExecPath = join(tinygoRoot, "targets", "wasm_exec.js");
      return await readFile(wasmExecPath, "utf-8");
    } catch (error) {
      throw new Error(
        "[use-golang] Could not find wasm_exec.js from TinyGo installation",
      );
    }
  }

  const resolved = resolveVirtualModule(id, buildDir);
  if (resolved && resolved.endsWith(".wasm")) {
    // Return as binary
    const buffer = await readFile(resolved);
    return buffer.toString("base64");
  }

  return null;
}
