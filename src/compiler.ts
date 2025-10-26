import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface CompilerOptions {
  tinygoPath?: string;
  optimization?: "0" | "1" | "2" | "s" | "z";
}

export class TinyGoCompiler {
  private tinygoPath: string;
  private optimization: string;

  constructor(options: CompilerOptions = {}) {
    this.tinygoPath = options.tinygoPath || "tinygo";
    this.optimization = options.optimization || "z";
  }

  async isInstalled(): Promise<boolean> {
    try {
      await execAsync(`${this.tinygoPath} version`);
      return true;
    } catch {
      return false;
    }
  }

  async getVersion(): Promise<string> {
    const { stdout } = await execAsync(`${this.tinygoPath} version`);
    return stdout.trim();
  }

  buildCommand(goFile: string, wasmFile: string): string {
    return `${this.tinygoPath} build -target wasm -opt ${this.optimization} -no-debug -o ${wasmFile} ${goFile}`;
  }

  async compile(goFile: string, wasmFile: string): Promise<void> {
    const command = this.buildCommand(goFile, wasmFile);
    try {
      const { stderr } = await execAsync(command);
      if (stderr) {
        console.warn("[use-golang] TinyGo warnings:", stderr);
      }
    } catch (error: any) {
      throw new Error(
        `TinyGo compilation failed: ${error.stderr || error.message}`,
      );
    }
  }
}
