export function parseImports(code: string): string[] {
	const imports: string[] = [];

	// Match single import statements
	const singleImportRegex = /import\s+"([^"]+)"/g;
	let match;
	while ((match = singleImportRegex.exec(code)) !== null) {
		imports.push(match[1]);
	}

	// Match multi-line import blocks
	const blockImportRegex = /import\s+\(([\s\S]*?)\)/g;
	while ((match = blockImportRegex.exec(code)) !== null) {
		const block = match[1];
		const lines = block.split("\n");
		for (const line of lines) {
			const lineMatch = line.match(/"([^"]+)"/);
			if (lineMatch) {
				imports.push(lineMatch[1]);
			}
		}
	}

	return [...new Set(imports)];
}

export function wrapGoCode(code: string): string {
	const hasPackage = /^\s*package\s+main/m.test(code);

	if (hasPackage) {
		return code;
	}

	return `package main

${code}`;
}
