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

<input type="file" id="imageInput" accept="image/*" /><br><br>
<textarea id="zplOutput" placeholder="ZPL output will appear here..."></textarea>

<script>
  document.getElementById("imageInput").addEventListener("change", async function () {
    const file = this.files[0];
    const output = document.getElementById("zplOutput");
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
      const base64 = e.target.result.split(",")[1];
      const zplCode = await convertToZPL(base64, {
        width: 8, // cm
        height: 4.5, // cm
        format: "ACS", // or 'Z64'
        rotation: "N", // N, R, L, or I
        blackThreshold: 50,
        darkness: 70,
        noTrim: true,
      });
      output.value = zplCode;
    };
    reader.readAsDataURL(file);
  });
</script>

```

---

## 📝 Acknowledgements

This project is inspired by and uses parts of code from: https://github.com/metafloor/zpl-image
