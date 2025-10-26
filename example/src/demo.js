// Demo script to test Go WASM functions

const resultsEl = document.getElementById('results');

function addOutput(text) {
  if (resultsEl) {
    resultsEl.textContent += text + '\n';
  }
  console.log(text);
}

document.getElementById('run')?.addEventListener('click', () => {
  if (resultsEl) resultsEl.textContent = '';

  addOutput('🚀 Testing Go WASM functions...\n');

  // Test the Go functions
  if (typeof window.goAdd === 'function') {
    const result = window.goAdd(5, 3);
    addOutput(`✅ goAdd(5, 3) = ${result}`);
  } else {
    addOutput('❌ goAdd function not found');
  }

  if (typeof window.goGreet === 'function') {
    const greeting = window.goGreet('Vite Plugin');
    addOutput(`✅ goGreet("Vite Plugin") = "${greeting}"`);
  } else {
    addOutput('❌ goGreet function not found');
  }

  addOutput('\n🎉 Check the browser console for Go output!');
});

console.log('Demo script loaded');
console.log('Available Go functions:', {
  goAdd: typeof window.goAdd,
  goGreet: typeof window.goGreet
});
