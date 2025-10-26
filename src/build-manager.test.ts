import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { BuildManager } from "./build-manager";

describe("BuildManager", () => {
  let tmpDir: string;
  let manager: BuildManager;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "vite-golang-test-"));
    manager = new BuildManager(tmpDir);
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("should initialize build directory", async () => {
    await manager.init();
    const exists = await manager.exists();
    expect(exists).toBe(true);
  });

  it("should create subdirectory for file", async () => {
    await manager.init();
    const subdir = await manager.getSubdirectory("test123");
    expect(subdir).toContain("test123");
  });

  it("should write Go file", async () => {
    await manager.init();
    const subdir = await manager.getSubdirectory("test123");
    const goFile = await manager.writeGoFile(subdir, "package main");
    expect(goFile).toContain("main.go");
  });
});
