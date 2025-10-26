import { describe, it, expect } from "vitest";
import { wrapGoCode, parseImports } from "./go-wrapper";

describe("parseImports", () => {
  it("should extract import statements", () => {
    const code = `
import "fmt"
import "syscall/js"

func main() {}
    `.trim();
    const imports = parseImports(code);
    expect(imports).toContain("fmt");
    expect(imports).toContain("syscall/js");
  });

  it("should handle multi-line imports", () => {
    const code = `
import (
  "fmt"
  "syscall/js"
)
    `.trim();
    const imports = parseImports(code);
    expect(imports).toContain("fmt");
    expect(imports).toContain("syscall/js");
  });
});

describe("wrapGoCode", () => {
  it("should wrap code with package main", () => {
    const code = "func main() {}";
    const wrapped = wrapGoCode(code);
    expect(wrapped).toContain("package main");
    expect(wrapped).toContain("func main() {}");
  });

  it("should not duplicate package declaration", () => {
    const code = "package main\n\nfunc main() {}";
    const wrapped = wrapGoCode(code);
    const matches = wrapped.match(/package main/g);
    expect(matches?.length).toBe(1);
  });

  it("should preserve imports", () => {
    const code = 'import "fmt"\n\nfunc main() {}';
    const wrapped = wrapGoCode(code);
    expect(wrapped).toContain('import "fmt"');
  });
});
