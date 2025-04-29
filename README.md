🖼️ Image to ZPL Converter

Convert images (PNG, JPG, etc.) to ZPL code for Zebra label printers directly in your browser.

🧪 Live Demo: image-to-zpl-online.vercel.app

---

✨ Features

- Convert images to **Z64** or **ACS** formats
- Set label size, rotation, threshold, and darkness
- Trim whitespace automatically (or keep full image)
- Runs fully in-browser, no backend required
- Export raw ZPL code for your Zebra printer

---

🚀 Usage Example

```html
<!-- Import pako for Z64 compression -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>

<script>
  const zplCode = await convertToZPL(imageData, {
    width: 8,
    height: 4.5,
    format: 'ACS',
    rotation: 'N',
    blackThreshold: 50,
    darkness: 70,
    noTrim: true
  });
  console.log(zplCode);
</script>

---

🙏 Acknowledgements

This project is inspired by and uses parts of code from:

- metafloor/zpl-image (https://github.com/metafloor/zpl-image) – ZPL image converter in JavaScript
