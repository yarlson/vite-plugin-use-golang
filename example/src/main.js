"use golang"

import (
  "bytes"
  "fmt"
  "image"
  _ "image/jpeg"
  _ "image/png"
  "syscall/js"
)

// averageHash computes a simple perceptual hash of an image
// Returns a 16-character hex string that's similar for similar images
func averageHash(this js.Value, args []js.Value) interface{} {
  if len(args) < 1 {
    return "error: no image data provided"
  }

  // Get image bytes from JavaScript Uint8Array
  imgData := make([]byte, args[0].Length())
  js.CopyBytesToGo(imgData, args[0])

  // Decode image (supports PNG, JPEG)
  img, format, err := image.Decode(bytes.NewReader(imgData))
  if err != nil {
    return fmt.Sprintf("error decoding image: %v", err)
  }

  fmt.Printf("Decoded %s image: %dx%d\n", format, img.Bounds().Dx(), img.Bounds().Dy())

  // Scale down to 8x8 and convert to grayscale
  const size = 8
  var pixels [size * size]uint8
  bounds := img.Bounds()

  for y := 0; y < size; y++ {
    for x := 0; x < size; x++ {
      // Sample the image at this grid position
      srcX := bounds.Min.X + (x * bounds.Dx() / size)
      srcY := bounds.Min.Y + (y * bounds.Dy() / size)

      // Convert to grayscale
      r, g, b, _ := img.At(srcX, srcY).RGBA()
      gray := uint8((r + g + b) / 3 / 256)
      pixels[y*size+x] = gray
    }
  }

  // Compute average
  var sum uint32
  for _, p := range pixels {
    sum += uint32(p)
  }
  avg := uint8(sum / uint32(len(pixels)))

  // Build hash: 1 if pixel > average, 0 otherwise
  var hash uint64
  for i, p := range pixels {
    if p > avg {
      hash |= 1 << uint(i)
    }
  }

  // Return as hex string
  return fmt.Sprintf("%016x", hash)
}

// compareHashes returns the Hamming distance between two hex hash strings
// Lower numbers mean more similar images (0 = identical, 64 = completely different)
func compareHashes(this js.Value, args []js.Value) interface{} {
  if len(args) < 2 {
    return -1
  }

  hash1 := args[0].String()
  hash2 := args[1].String()

  if len(hash1) != 16 || len(hash2) != 16 {
    return -1
  }

  // Count differing bits
  var distance int
  for i := 0; i < 16; i++ {
    b1 := hash1[i]
    b2 := hash2[i]
    if b1 != b2 {
      // Count bit differences in this hex digit
      var val1, val2 byte
      if b1 >= '0' && b1 <= '9' {
        val1 = b1 - '0'
      } else {
        val1 = b1 - 'a' + 10
      }
      if b2 >= '0' && b2 <= '9' {
        val2 = b2 - '0'
      } else {
        val2 = b2 - 'a' + 10
      }

      xor := val1 ^ val2
      for xor != 0 {
        distance++
        xor &= xor - 1
      }
    }
  }

  return distance
}

func main() {
  fmt.Println("Image hashing WASM module initialized")

  // Export functions to JavaScript
  js.Global().Set("hashImage", js.FuncOf(averageHash))
  js.Global().Set("compareImageHashes", js.FuncOf(compareHashes))

  // Keep the program running
  select {}
}
