const resultsEl = document.getElementById("results");
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");

const images = new Map(); // filename -> {hash, dataUrl}

function addOutput(text) {
  if (resultsEl) {
    resultsEl.textContent += text + "\n";
  }
  console.log(text);
}

function clearOutput() {
  if (resultsEl) {
    resultsEl.textContent = "";
  }
}

async function processImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const uint8Array = new Uint8Array(arrayBuffer);

      // Call Go function to hash the image
      if (typeof window.hashImage === "function") {
        const hash = window.hashImage(uint8Array);

        if (typeof hash === "string" && hash.startsWith("error")) {
          addOutput(`❌ ${file.name}: ${hash}`);
          reject(hash);
          return;
        }

        // Store image with its hash
        const dataUrl = URL.createObjectURL(file);
        images.set(file.name, { hash, dataUrl });

        addOutput(`✅ ${file.name}: ${hash}`);
        resolve(hash);
      } else {
        addOutput("❌ WASM module not ready");
        reject("WASM not ready");
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function compareAllImages() {
  if (images.size < 2) {
    addOutput("\n⚠️  Upload at least 2 images to compare");
    return;
  }

  addOutput("\n🔍 Comparing images...\n");

  const entries = Array.from(images.entries());

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [name1, img1] = entries[i];
      const [name2, img2] = entries[j];

      const distance = window.compareImageHashes(img1.hash, img2.hash);

      let similarity = "very different";
      if (distance <= 5) similarity = "nearly identical";
      else if (distance <= 10) similarity = "very similar";
      else if (distance <= 20) similarity = "somewhat similar";

      addOutput(
        `${name1} vs ${name2}: ${distance} bits different (${similarity})`,
      );
    }
  }
}

// Drag and drop handlers
dropZone?.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone?.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone?.addEventListener("drop", async (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  clearOutput();
  addOutput("🚀 Processing images...\n");

  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "image/png" || f.type === "image/jpeg",
  );

  if (files.length === 0) {
    addOutput("❌ No PNG or JPEG images found");
    return;
  }

  for (const file of files) {
    try {
      await processImage(file);
    } catch (err) {
      console.error(err);
    }
  }

  if (files.length > 1) {
    compareAllImages();
  }

  addOutput(
    "\n💡 Try uploading the same image at different sizes or qualities!",
  );
});

// Click to upload
dropZone?.addEventListener("click", () => {
  fileInput?.click();
});

fileInput?.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files).filter(
    (f) => f.type === "image/png" || f.type === "image/jpeg",
  );

  if (files.length === 0) return;

  clearOutput();
  addOutput("🚀 Processing images...\n");

  for (const file of files) {
    try {
      await processImage(file);
    } catch (err) {
      console.error(err);
    }
  }

  if (files.length > 1) {
    compareAllImages();
  }

  addOutput(
    "\n💡 Try uploading the same image at different sizes or qualities!",
  );
});

console.log("Demo loaded. Drag and drop images to test!");
