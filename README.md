# vite-plugin-use-golang

> Write Go code directly in JavaScript files and compile to WebAssembly at build time

A Vite plugin that enables the `"use golang"` directive, allowing you to write Go code that gets compiled to WASM and seamlessly integrated into your JavaScript/TypeScript project.

## Installation

```bash
npm install -D vite-plugin-use-golang
```

**Prerequisites:**

- [TinyGo](https://tinygo.org/getting-started/install/) must be installed

## Usage

### 1. Add to Vite Config

```javascript
// vite.config.js
import { defineConfig } from "vite";
import golangPlugin from "vite-plugin-use-golang";

export default defineConfig({
  plugins: [
    golangPlugin({
      optimization: "z", // TinyGo optimization level
      generateTypes: true, // Generate TypeScript definitions
    }),
  ],
});
```

### 2. Write Go Code in JavaScript Files

```javascript
"use golang"

import (
  "fmt"
  "syscall/js"
)

func add(this js.Value, args []js.Value) interface{} {
  a := args[0].Int()
  b := args[1].Int()
  result := a + b
  fmt.Printf("Go: %d + %d = %d\n", a, b, result)
  return result
}

func main() {
  fmt.Println("Go WASM module initialized!")

  // Export functions to JavaScript
  js.Global().Set("goAdd", js.FuncOf(add))

  // Keep the program running
  select {}
}
```

**Note:** Do NOT use `//export` comments - those are for CGO/C FFI, not WASM JavaScript interop. Use `js.Global().Set()` to expose functions.

### 3. Use the Go Functions in JavaScript

```javascript
// The Go functions are available on window after WASM loads
console.log(window.goAdd(5, 3)); // Outputs: 8
// Check browser console for Go's fmt.Printf output
```

The plugin automatically compiles the Go code to WASM and loads it in the browser.

## How It Works

1. **Detection**: Plugin scans for `"use golang"` directive in JS/TS files
2. **Extraction**: Extracts Go code following the directive
3. **Compilation**: Compiles Go → WASM using TinyGo in `.vite-golang/` directory
4. **Integration**: Returns JavaScript wrapper that loads and runs the WASM module

## Configuration

```typescript
interface GolangPluginOptions {
  tinygoPath?: string; // Path to TinyGo binary (default: 'tinygo')
  buildDir?: string; // Build directory (default: '.vite-golang')
  optimization?: "0" | "1" | "2" | "s" | "z"; // TinyGo -opt flag (default: 'z')
  generateTypes?: boolean; // Generate .d.ts files (default: true)
  cleanupDays?: number; // Auto-cleanup threshold (default: 7)
}
```

## Architecture

- **Build Directory**: `.vite-golang/` contains compiled Go files and WASM
- **Virtual Modules**: `/@vite-golang/*` paths serve WASM and `wasm_exec.js`
- **Dev Mode**: WASM files served via middleware with `application/wasm` MIME type
- **Build Mode**: WASM files emitted as assets for bundling
- **HMR Support**: Changes to Go code trigger full page reload
- **Dependency Scanning**: Custom ESBuild plugin skips Go files during pre-bundling

## CLI Commands

The plugin provides HTTP endpoints for commands (access via dev server):

```bash
# These are accessed via the dev server, not as CLI commands:
# http://localhost:5173/__vite_plugin_golang_clean
# http://localhost:5173/__vite_plugin_golang_doctor
```

Alternatively, manually clean the build directory:

```bash
rm -rf .vite-golang/
```

## Examples

See the `example/` directory for a complete working demo.

To run the example:

```bash
cd example
npm install
npm run dev
```

Visit `http://localhost:5173/` and click "Run Go Function" to test the WASM integration.

## Limitations

- Full page reload on HMR (fine-grained WASM HMR is complex)
- TinyGo required (standard Go WASM is much larger)
- Go ↔ JS interop requires `syscall/js` boilerplate
- `//export` comments don't work (use `js.Global().Set()` instead)
- Go functions must match `js.FuncOf` signature: `func(js.Value, []js.Value) interface{}`
- WASM files must be served with correct MIME type (handled automatically in dev/build)

## Known Issues & Solutions

**Issue:** Dependency scanning error with Go code
**Solution:** Plugin automatically skips Go files during ESBuild pre-bundling

**Issue:** `//export` directives cause compilation errors
**Solution:** Remove them - they're for CGO, not WASM. Use `js.Global().Set()` instead

**Issue:** WASM MIME type errors
**Solution:** Plugin serves WASM with `application/wasm` in dev mode

## License

[MIT](./LICENSE)

## Why?

Because we can. This is proof-of-concept "feature-complete chaos" — it actually works, and it's actually pretty cool! Use at your own risk. 🤖
