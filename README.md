# vite-plugin-use-golang

Write Go code in JavaScript files. It compiles to WebAssembly. Actually works.

You drop `"use golang"` at the top of a JS file, write Go code, and Vite compiles it to WASM at build time. The compiled functions show up on `window` like any other JavaScript function. It's absurd, but it's real.

## Requirements

This plugin shells out to the TinyGo CLI. Install [TinyGo](https://tinygo.org/getting-started/install/) on your system and ensure `tinygo` is available on your `PATH` (or set the `tinygoPath` option). You can confirm with `tinygo version`. Regular Go won't work here—the WASM output is far too large.

## Why would you do this?

Let's say you want to do image perceptual hashing in the browser. You could wrestle with Canvas APIs and write 200 lines of JavaScript. Or you could use Go's image standard library and let it handle the heavy lifting:

```javascript
"use golang"

import (
  "bytes"
  "image"
  _ "image/jpeg"
  _ "image/png"
  "syscall/js"
)

func hashImage(this js.Value, args []js.Value) interface{} {
  imgData := make([]byte, args[0].Length())
  js.CopyBytesToGo(imgData, args[0])

  img, _, _ := image.Decode(bytes.NewReader(imgData))

  // Do perceptual hashing with Go's image processing...
  // (see example/ for full implementation)

  return hash
}

func main() {
  js.Global().Set("hashImage", js.FuncOf(hashImage))
  select {}
}
```

Now you've got `window.hashImage()` in your JavaScript. Pass it a `Uint8Array` of image data, get back a perceptual hash. The example in this repo does exactly that: drag and drop images, watch it detect duplicates even if they're different sizes or compressed differently.

That's the point. Go has great libraries for things like image processing, cryptography, and data manipulation. Sometimes you want those in the browser without rewriting everything in JavaScript.

## Installation

```bash
npm install -D vite-plugin-use-golang
```

## Usage

Add it to your Vite config:

```javascript
// vite.config.js
import { defineConfig } from "vite";
import golangPlugin from "vite-plugin-use-golang";

export default defineConfig({
  plugins: [golangPlugin()],
});
```

Write Go in a JS file:

```javascript
"use golang"

import (
  "fmt"
  "syscall/js"
)

func greet(this js.Value, args []js.Value) interface{} {
  return fmt.Sprintf("Hello from Go, %s!", args[0].String())
}

func main() {
  js.Global().Set("greet", js.FuncOf(greet))
  select {}
}
```

Use it in JavaScript:

```javascript
console.log(window.greet("world")); // "Hello from Go, world!"
```

The plugin handles the compilation automatically. Change the Go code, Vite rebuilds it. It works in dev mode and production builds.

## How it works

When you add `"use golang"` to a file, the plugin:

1. Extracts the Go code that follows
2. Writes it to `.vite-golang/` as a temp `.go` file
3. Runs `tinygo build -target wasm` to compile it
4. Returns a JavaScript module that loads the WASM and makes your functions available

The WASM file gets bundled with your app. Functions you expose via `js.Global().Set()` show up on `window`. That's it.

## Configuration

The plugin takes some options if you need them:

```typescript
golangPlugin({
  tinygoPath: "tinygo", // Path to TinyGo binary
  buildDir: ".vite-golang", // Where to put compiled files
  optimization: "z", // TinyGo -opt flag (z = smallest size)
  generateTypes: true, // Generate .d.ts files for TypeScript
  cleanupDays: 7, // Auto-cleanup old builds after N days
});
```

Most of the time you can just use the defaults.

## Things to know

**Don't use `//export` comments.** Those are for CGO, not WASM. Use `js.Global().Set()` to expose functions to JavaScript.

**Go functions need a specific signature.** They have to match what `js.FuncOf()` expects: `func(this js.Value, args []js.Value) interface{}`. Check the [syscall/js docs](https://pkg.go.dev/syscall/js) if you get stuck.

**HMR does a full page reload.** Hot module replacement with WASM is complicated. When you change Go code, the page reloads. It's not ideal but it's fine for development.

**You need TinyGo, not regular Go.** Standard Go WASM binaries are massive (multiple MB minimum). TinyGo produces much smaller files. Install it from [tinygo.org](https://tinygo.org/getting-started/install/).

## Example

There's a working demo in the `example/` directory. It implements image perceptual hashing: upload images, it computes hashes, compares them, and tells you if they're similar.

```bash
cd example
npm install
npm run dev
```

Open http://localhost:5173 and drag some images onto the page. Try uploading the same photo at different sizes. Watch it detect they're similar even though the bytes are different.

## Is this a good idea?

Probably not for most projects. JavaScript is fast enough for most things, and adding a WASM build step adds complexity. But if you're doing something compute-heavy or you really want to use a specific Go library, it works.

The real use cases are things like:

- Image/video processing (Go has good libraries for this)
- Cryptography (when you want battle-tested implementations)
- Data parsing for unusual formats
- Scientific computing where you already have Go code

It's not a replacement for JavaScript. It's a tool for when you specifically need what Go provides.

## License

[MIT](./LICENSE)
