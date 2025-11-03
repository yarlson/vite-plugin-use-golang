import { describe, expect, it } from "vitest";
import { generateFileId, sanitizePath } from "./file-utils";

describe("generateFileId", () => {
	it("should generate stable 8-character hash", () => {
		const id = generateFileId("/src/foo.js");
		expect(id).toHaveLength(8);
		expect(id).toMatch(/^[a-f0-9]{8}$/);
	});

	it("should generate same hash for same input", () => {
		const id1 = generateFileId("/src/foo.js");
		const id2 = generateFileId("/src/foo.js");
		expect(id1).toBe(id2);
	});

	it("should generate different hashes for different inputs", () => {
		const id1 = generateFileId("/src/foo.js");
		const id2 = generateFileId("/src/bar.js");
		expect(id1).not.toBe(id2);
	});
});

describe("sanitizePath", () => {
	it("should replace slashes with underscores", () => {
		expect(sanitizePath("/src/foo/bar.js")).toBe("src_foo_bar_js");
	});

	it("should remove leading slash", () => {
		expect(sanitizePath("/src/foo.js")).toBe("src_foo_js");
	});

	it("should replace dots with underscores", () => {
		expect(sanitizePath("foo.bar.js")).toBe("foo_bar_js");
	});
});
