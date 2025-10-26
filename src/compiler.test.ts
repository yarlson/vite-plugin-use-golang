import { describe, it, expect, beforeEach } from "vitest";
import { TinyGoCompiler } from "./compiler";

describe("TinyGoCompiler", () => {
  let compiler: TinyGoCompiler;

  beforeEach(() => {
    compiler = new TinyGoCompiler({
      tinygoPath: "tinygo",
      optimization: "z",
    });
  });

  it("should check if TinyGo is installed", async () => {
    const installed = await compiler.isInstalled();
    expect(typeof installed).toBe("boolean");
  });

  it("should get TinyGo version", async () => {
    const installed = await compiler.isInstalled();
    if (installed) {
      const version = await compiler.getVersion();
      expect(version).toMatch(/tinygo version/i);
    }
  });

  it("should build command correctly", () => {
    const cmd = compiler.buildCommand("/tmp/main.go", "/tmp/main.wasm");
    expect(cmd).toContain("tinygo");
    expect(cmd).toContain("build");
    expect(cmd).toContain("-target wasm");
    expect(cmd).toContain("-opt z");
    expect(cmd).toContain("-o /tmp/main.wasm");
    expect(cmd).toContain("/tmp/main.go");
  });
});
