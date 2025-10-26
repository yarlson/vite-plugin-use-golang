const DIRECTIVE_PATTERN = /^["']use golang["'];?\s*/m;

export function detectGoDirective(code: string): boolean {
  return DIRECTIVE_PATTERN.test(code);
}

export function extractGoCode(code: string): string {
  const match = code.match(DIRECTIVE_PATTERN);
  if (!match) {
    throw new Error('No "use golang" directive found');
  }
  return code.slice(match[0].length).trim();
}
