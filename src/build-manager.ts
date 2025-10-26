import { mkdir, writeFile, access } from "fs/promises";
import { join } from "path";

export class BuildManager {
  constructor(private buildDir: string) {}

  async init(): Promise<void> {
    await mkdir(this.buildDir, { recursive: true });
  }

  async exists(): Promise<boolean> {
    try {
      await access(this.buildDir);
      return true;
    } catch {
      return false;
    }
  }

  async getSubdirectory(id: string): Promise<string> {
    const subdir = join(this.buildDir, id);
    await mkdir(subdir, { recursive: true });
    return subdir;
  }

  async writeGoFile(subdir: string, goCode: string): Promise<string> {
    const goFile = join(subdir, "main.go");
    await writeFile(goFile, goCode, "utf-8");
    return goFile;
  }

  getBuildDir(): string {
    return this.buildDir;
  }
}
