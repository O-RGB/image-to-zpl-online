# 🖼️ Image to ZPL Converter

Convert images (PNG, JPG, etc.) to ZPL code for Zebra label printers directly in your browser.

🧪 **Live Demo**: [image-to-zpl-online.vercel.app](https://image-to-zpl-online.vercel.app/)

---

## ✨ Features

- Convert images to **Z64** or **ACS** formats
- Set label size, rotation, threshold, and darkness
- Trim whitespace automatically (or keep full image)
- Runs fully in-browser, no backend required
- Export raw ZPL code for your Zebra printer

---

## 🚀 Usage Example

```html
<!-- Import pako for Z64 compression -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>
<script src="./zpl-converter.js"></script>

<script>
  async function convertImageToZPL() {
    // Assuming base64Image is the base64 string of your image
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."; // Replace with your base64 string

    const imageData = base64Image.split(",")[1]; // Strip the base64 header

    const zplCode = await convertToZPL(imageData, {
      width: 8, // cm
      height: 4.5, // cm
      format: "ACS", // or 'Z64'
      rotation: "N", // N, R, L, or I
      blackThreshold: 50,
      darkness: 70,
      noTrim: true,
    });

    console.log(zplCode); // Output ZPL string
  }
</script>

<button onclick="convertImageToZPL()">Convert Base64 Image to ZPL</button>
```

---

## 📝 Acknowledgements

This project is inspired by and uses parts of code from: https://github.com/metafloor/zpl-image
