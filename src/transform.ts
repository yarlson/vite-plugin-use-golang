import { join } from "path";
import { writeFile } from "fs/promises";
import { detectGoDirective, extractGoCode } from "./detector";
import { generateFileId, sanitizePath } from "./file-utils";
import { BuildManager } from "./build-manager";
import { TinyGoCompiler } from "./compiler";
import { wrapGoCode } from "./go-wrapper";
import { generateJsWrapper } from "./js-wrapper";

export interface TransformContext {
  buildManager: BuildManager;
  compiler: TinyGoCompiler;
  projectRoot: string;
  generateTypes?: boolean;
}

export async function transformGoDirective(
  code: string,
  id: string,
  context: TransformContext,
): Promise<{ code: string; map?: null } | null> {
  // Check for directive
  if (!detectGoDirective(code)) {
    return null;
  }

  console.log(`[use-golang] Processing ${id}`);

  try {
    // Extract Go code
    const goCode = extractGoCode(code);

    // Generate file ID
    const fileId = generateFileId(id);
    const sanitized = sanitizePath(id);
    const subdirName = `${sanitized}_${fileId}`;

    // Get subdirectory
    const subdir = await context.buildManager.getSubdirectory(subdirName);

    // Wrap Go code
    const wrappedGo = wrapGoCode(goCode);

    // Write Go file
    const goFile = await context.buildManager.writeGoFile(subdir, wrappedGo);

    // Compile to WASM
    const wasmFile = join(subdir, "main.wasm");
    await context.compiler.compile(goFile, wasmFile);

    // Generate TypeScript types if enabled
    if (context.generateTypes) {
      const { parseGoFunctions, generateDts } = await import(
        "./type-generator"
      );
      const functions = parseGoFunctions(wrappedGo);
      const dts = generateDts(functions);

      const dtsFile = join(subdir, "types.d.ts");
      await writeFile(dtsFile, dts, "utf-8");
    }

    // Generate JS wrapper
    const jsWrapper = generateJsWrapper(subdirName, context.projectRoot);

    return {
      code: jsWrapper,
      map: null,
    };
  } catch (error: any) {
    throw new Error(`[use-golang] Failed to process ${id}: ${error.message}`);
  }
}
