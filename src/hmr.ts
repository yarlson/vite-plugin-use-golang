import type { HmrContext, ModuleNode } from "vite";
import { detectGoDirective } from "./detector";
import { readFile } from "fs/promises";

export async function handleGoHotUpdate(
  ctx: HmrContext,
  modules: ModuleNode[],
): Promise<ModuleNode[] | void> {
  const { file, server } = ctx;

  // Only handle JS/TS files
  if (!/\.[jt]sx?$/.test(file)) {
    return;
  }

  // Check if file has Go directive
  const content = await readFile(file, "utf-8");
  if (!detectGoDirective(content)) {
    return;
  }

  console.log(`[use-golang] Hot reloading ${file}`);

  // For now, do full page reload (WASM hot reload is complex)
  server.ws.send({
    type: "full-reload",
    path: "*",
  });

  return [];
}
