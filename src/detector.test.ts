import { describe, expect, it } from "vitest";
import { detectGoDirective, extractGoCode } from "./detector";

describe("detectGoDirective", () => {
	it('should detect "use golang" with double quotes', () => {
		const code = '"use golang"\npackage main';
		expect(detectGoDirective(code)).toBe(true);
	});

	it('should detect "use golang" with single quotes', () => {
		const code = "'use golang'\npackage main";
		expect(detectGoDirective(code)).toBe(true);
	});

	it("should not detect regular comments", () => {
		const code = "// use golang\nconst x = 1;";
		expect(detectGoDirective(code)).toBe(false);
	});
});

describe("extractGoCode", () => {
	it("should extract Go code after directive", () => {
		const code = '"use golang";\n\npackage main\n\nfunc main() {}';
		const result = extractGoCode(code);
		expect(result).toBe("package main\n\nfunc main() {}");
	});

	it("should handle directive without semicolon", () => {
		const code = '"use golang"\npackage main';
		const result = extractGoCode(code);
		expect(result).toBe("package main");
	});
});
