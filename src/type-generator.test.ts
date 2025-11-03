import { describe, expect, it } from "vitest";
import { generateDts, parseGoFunctions } from "./type-generator";

describe("parseGoFunctions", () => {
	it("should parse exported function", () => {
		const code = `
//export add
func add(a, b int) int {
  return a + b
}
    `.trim();

		const funcs = parseGoFunctions(code);
		expect(funcs).toHaveLength(1);
		expect(funcs[0].name).toBe("add");
	});

	it("should parse multiple functions", () => {
		const code = `
//export add
func add(a, b int) int { return a + b }

//export multiply
func multiply(a, b int) int { return a * b }
    `.trim();

		const funcs = parseGoFunctions(code);
		expect(funcs).toHaveLength(2);
		expect(funcs[0].name).toBe("add");
		expect(funcs[1].name).toBe("multiply");
	});
});

describe("generateDts", () => {
	it("should generate basic type definition", () => {
		const functions = [
			{ name: "add", params: ["a: number", "b: number"], returnType: "number" },
		];

		const dts = generateDts(functions);
		expect(dts).toContain("export function add(a: number, b: number): number;");
	});

	it("should handle no exports", () => {
		const dts = generateDts([]);
		expect(dts).toContain("export default any");
	});
});
