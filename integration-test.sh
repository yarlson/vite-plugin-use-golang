#!/bin/bash
set -e

echo "=== Integration Test: vite-plugin-use-golang ==="

# Build the plugin
echo "Building plugin..."
npm run build

# Check if TinyGo is installed
if ! command -v tinygo &> /dev/null; then
    echo "⚠️  TinyGo not installed. Skipping integration test."
    echo "Install from: https://tinygo.org/getting-started/install/"
    exit 0
fi

# Setup example
cd example
echo "Installing example dependencies..."
npm install

# Build example
echo "Building example..."
npm run build

# Check if build succeeded
if [ -d "dist" ]; then
    echo "✓ Build succeeded"
else
    echo "✗ Build failed"
    exit 1
fi

# Check if .vite-golang directory was created
if [ -d ".vite-golang" ]; then
    echo "✓ Build directory created"
else
    echo "✗ Build directory not found"
    exit 1
fi

# Check if WASM files were generated
WASM_COUNT=$(find .vite-golang -name "*.wasm" | wc -l)
if [ "$WASM_COUNT" -gt 0 ]; then
    echo "✓ WASM files generated ($WASM_COUNT found)"
else
    echo "✗ No WASM files found"
    exit 1
fi

echo ""
echo "=== ✓ All integration tests passed ==="
echo ""
echo "To run the example:"
echo "  cd example"
echo "  npm run dev"
