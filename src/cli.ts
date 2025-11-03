import { rm } from "fs/promises";

export interface CliContext {
  buildDir: string;
  tinygoPath: string;
}

export async function handleCleanCommand(context: CliContext): Promise<void> {
  console.log(`[use-golang] Cleaning ${context.buildDir}...`);
  try {
    await rm(context.buildDir, { recursive: true, force: true });
    console.log("[use-golang] Clean complete");
  } catch (error: any) {
    console.error("[use-golang] Clean failed:", error.message);
  }
}

export async function handleDoctorCommand(context: CliContext): Promise<void> {
  console.log("[use-golang] Running diagnostics...\n");

  const { TinyGoCompiler } = await import("./compiler.js");
  const compiler = new TinyGoCompiler({ tinygoPath: context.tinygoPath });

  const installed = await compiler.isInstalled();

  if (installed) {
    const version = await compiler.getVersion();
    console.log("✓ TinyGo found:", version);
  } else {
    console.log("✗ TinyGo not found");
    console.log("\nInstall from: https://tinygo.org/getting-started/install/");
  }

  console.log("\nBuild directory:", context.buildDir);
  console.log("[use-golang] Diagnostics complete");
}
