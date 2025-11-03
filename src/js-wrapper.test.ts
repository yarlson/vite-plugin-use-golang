import { describe, expect, it } from "vitest";
import { generateJsWrapper } from "./js-wrapper";

describe("generateJsWrapper", () => {
	it("should generate wrapper with WASM URL", () => {
		const wrapper = generateJsWrapper("test123", "/project");
		expect(wrapper).toContain("/@vite-golang/test123/main.wasm");
	});

	it("should import wasm_exec.js", () => {
		const wrapper = generateJsWrapper("test123", "/project");
		expect(wrapper).toContain("/@vite-golang/wasm_exec.js");
	});

	it("should include Go runtime instantiation", () => {
		const wrapper = generateJsWrapper("test123", "/project");
		expect(wrapper).toContain("new Go()");
		expect(wrapper).toContain("WebAssembly.instantiateStreaming");
	});

	it("should export default", () => {
		const wrapper = generateJsWrapper("test123", "/project");
		expect(wrapper).toContain("export default");
	});
});
