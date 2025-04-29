ZPL Converter
=============

ZPL Converter is a web-based tool for converting images to ZPL (Zebra Programming Language) for use with Zebra label printers.

🌐 Demo
-------
Try it here: https://image-to-zpl-online.vercel.app/

✨ Features
----------
- Upload an image and convert it to ZPL format
- Choose between ACS or Z64 encoding
- Set label size (width and height in cm)
- Adjust black threshold and darkness
- Rotate image (0°, 90°, 180°, 270°)
- Optional edge trimming
- Live ZPL preview with Labelary API
- Copy ZPL output to clipboard or download it

🛠️ Technologies Used
---------------------
- HTML, CSS, JavaScript
- Pako (for compression)
- Labelary API (for rendering preview)

📁 Project Structure
---------------------
- `index.html` – main UI page
- `zpl-converter.js` – handles image processing and ZPL generation

📄 License
----------
MIT License

Developed by O-RGB
GitHub: https://github.com/O-RGB/image-to-zpl-online
