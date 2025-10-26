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

//export add
func add(this js.Value, args []js.Value) interface{} {
  return args[0].Int() + args[1].Int()
}

func main() {
  fmt.Println("Go WASM initialized!")
  js.Global().Set("goAdd", js.FuncOf(add))
  select {} // Keep running
}
```

### 3. Use in Your App

The plugin automatically compiles the Go code to WASM and provides a JavaScript wrapper.

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
- **Virtual Modules**: `/@vite-golang/*` paths serve WASM and runtime files
- **HMR Support**: Changes to Go code trigger full page reload
- **Type Generation**: Parses `//export` comments to generate TypeScript types

## CLI Commands

```bash
vite golang:clean    # Delete .vite-golang/ directory
vite golang:inspect  # Show compiled output for a file
vite golang:doctor   # Check TinyGo installation
```

## Examples

See the `example/` directory for a complete working demo.

## Limitations

- Full page reload on HMR (fine-grained WASM HMR is complex)
- TinyGo required (standard Go WASM is much larger)
- Go ↔ JS interop requires `syscall/js` boilerplate

## License

MIT

## Why?

Because we can. This is proof-of-concept "feature-complete chaos" — it actually works, but you probably shouldn't use it in production.
