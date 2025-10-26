"use golang"

import (
  "fmt"
  "syscall/js"
)

//export add
func add(this js.Value, args []js.Value) interface{} {
  a := args[0].Int()
  b := args[1].Int()
  result := a + b
  fmt.Printf("Go: %d + %d = %d\n", a, b, result)
  return result
}

//export greet
func greet(this js.Value, args []js.Value) interface{} {
  name := args[0].String()
  greeting := fmt.Sprintf("Hello from Go, %s!", name)
  fmt.Println(greeting)
  return greeting
}

func main() {
  fmt.Println("Go WASM module initialized!")

  // Export functions to JavaScript
  js.Global().Set("goAdd", js.FuncOf(add))
  js.Global().Set("goGreet", js.FuncOf(greet))

  // Keep the program running
  select {}
}
