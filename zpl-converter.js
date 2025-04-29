/**
 * ZPL Converter Library
 * A lightweight library for converting images to ZPL format
 * Combined version of both scripts with proper integration
 */

(function (global) {
  // Ensure pako is available for compression
  if (typeof global.pako === "undefined" && typeof require === "function") {
    try {
      global.pako = require("pako");
    } catch (e) {
      console.error("Pako dependency is required. Please include pako.min.js");
    }
  }

  // Main ZPL image conversion module
  const zplImageModule = (function () {
    const zlib =
      typeof process === "object" &&
      typeof process.release === "object" &&
      process.release.name === "node"
        ? require("zlib")
        : null;

    const hexmap = (() => {
      let arr = Array(256);
      for (let i = 0; i < 16; i++) {
        arr[i] = "0" + i.toString(16);
      }
      for (let i = 16; i < 256; i++) {
        arr[i] = i.toString(16);
      }
      return arr;
    })();

    const crcTable = [
      0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7, 0x8108,
      0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210,
      0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6, 0x9339, 0x8318, 0xb37b,
      0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401,
      0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee,
      0xf5cf, 0xc5ac, 0xd58d, 0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6,
      0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d,
      0xc7bc, 0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
      0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b, 0x5af5,
      0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc,
      0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a, 0x6ca6, 0x7c87, 0x4ce4,
      0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd,
      0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13,
      0x2e32, 0x1e51, 0x0e70, 0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a,
      0x9f59, 0x8f78, 0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e,
      0xe16f, 0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
      0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e, 0x02b1,
      0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256, 0xb5ea, 0xa5cb,
      0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d, 0x34e2, 0x24c3, 0x14a0,
      0x0481, 0x7466, 0x6447, 0x5424, 0x4405, 0xa7db, 0xb7fa, 0x8799, 0x97b8,
      0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657,
      0x7676, 0x4615, 0x5634, 0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9,
      0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882,
      0x28a3, 0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
      0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92, 0xfd2e,
      0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07,
      0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1, 0xef1f, 0xff3e, 0xcf5d,
      0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74,
      0x2e93, 0x3eb2, 0x0ed1, 0x1ef0,
    ];

    // Initialize CRC table
    (function () {
      for (let i = 0; i < 256; i++) {
        let crc = i;
        for (let j = 0; j < 8; j++) {
          crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
        }
        crcTable[i] = crc;
      }
    })();

    function u8tob64(arr) {
      let str = "";
      for (let i = 0; i < arr.length; i++) {
        str += String.fromCharCode(arr[i]);
      }
      return btoa(str);
    }

    function crc16(str) {
      let crc = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        if (char > 255) throw new RangeError();
        const j = (char ^ (crc >> 8)) & 0xff;
        crc = crcTable[j] ^ (crc << 8);
      }
      return (crc & 0xffff).toString(16).padStart(4, "0");
    }

    function monochrome(rgba, width, height, black, notrim, enhancements = {}) {
      black = (255 * black) / 100;

      let minx, maxx, miny, maxy;
      if (notrim) {
        minx = miny = 0;
        maxx = width - 1;
        maxy = height - 1;
      } else {
        minx = width;
        miny = height;
        maxx = maxy = 0;
        let x = 0,
          y = 0;

        for (let i = 0; i < rgba.length; i += 4) {
          const a = rgba[i + 3] / 255;
          const gray =
            0.3 * rgba[i] * a +
            255 * (1 - a) +
            0.59 * rgba[i + 1] * a +
            255 * (1 - a) +
            0.11 * rgba[i + 2] * a +
            255 * (1 - a);

          if (gray <= black) {
            if (minx > x) minx = x;
            if (miny > y) miny = y;
            if (maxx < x) maxx = x;
            if (maxy < y) maxy = y;
          }

          if (++x === width) {
            x = 0;
            y++;
          }
        }
      }

      const newWidth = maxx - minx + 1;
      const newHeight = maxy - miny + 1;
      const mono = new Uint8Array(newWidth * newHeight);
      let idx = 0;

      for (let y = miny; y <= maxy; y++) {
        let i = (y * width + minx) * 4;
        for (let x = minx; x <= maxx; x++) {
          const a = rgba[i + 3] / 255;
          const gray =
            0.3 * rgba[i] * a +
            255 * (1 - a) +
            0.59 * rgba[i + 1] * a +
            255 * (1 - a) +
            0.11 * rgba[i + 2] * a +
            255 * (1 - a);

          mono[idx++] = gray <= black ? 1 : 0;
          i += 4;
        }
      }

      mono.width = newWidth;
      mono.height = newHeight;
      return mono;
    }

    function normal(mono) {
      const width = mono.width;
      const height = mono.height;
      const buf = new Uint8Array(Math.ceil(width / 8) * height);
      let idx = 0,
        byte = 0,
        bit = 0;

      for (let i = 0; i < mono.length; i++) {
        byte |= mono[i] << (7 - (bit++ % 8));

        if (bit === width || bit % 8 === 0) {
          buf[idx++] = byte;
          byte = 0;
          if (bit === width) bit = 0;
        }
      }

      buf.width = width;
      buf.height = height;
      return buf;
    }

    function invert(mono) {
      const width = mono.width;
      const height = mono.height;
      const buf = new Uint8Array(Math.ceil(width / 8) * height);
      let idx = 0,
        byte = 0,
        bit = 0;

      for (let i = mono.length - 1; i >= 0; i--) {
        byte |= mono[i] << (7 - (bit++ % 8));

        if (bit === width || bit % 8 === 0) {
          buf[idx++] = byte;
          byte = 0;
          if (bit === width) bit = 0;
        }
      }

      buf.width = width;
      buf.height = height;
      return buf;
    }

    function left(mono) {
      const width = mono.width;
      const height = mono.height;
      const buf = new Uint8Array(Math.ceil(height / 8) * width);
      let idx = 0;

      for (let x = width - 1; x >= 0; x--) {
        let byte = 0,
          bit = 0;
        for (let y = 0; y < height; y++) {
          byte |= mono[y * width + x] << (7 - (bit++ % 8));

          if (y === height - 1 || bit % 8 === 0) {
            buf[idx++] = byte;
            byte = 0;
          }
        }
      }

      buf.width = height;
      buf.height = width;
      return buf;
    }

    function right(mono) {
      const width = mono.width;
      const height = mono.height;
      const buf = new Uint8Array(Math.ceil(height / 8) * width);
      let idx = 0;

      for (let x = 0; x < width; x++) {
        let byte = 0,
          bit = 0;
        for (let y = height - 1; y >= 0; y--) {
          byte |= mono[y * width + x] << (7 - (bit++ % 8));

          if (y === 0 || bit % 8 === 0) {
            buf[idx++] = byte;
            byte = 0;
          }
        }
      }

      buf.width = height;
      buf.height = width;
      return buf;
    }

    function rgbaToZ64(rgba, width, opts = {}) {
      if (!width || width < 0) throw new Error("Invalid width");
      const height = ~~(rgba.length / width / 4);

      const mono = monochrome(
        rgba,
        width,
        height,
        +opts.black || 50,
        opts.notrim,
        {
          contrast: opts.contrast,
          brightness: opts.brightness,
          dithering: opts.dithering,
          sharpen: opts.sharpen,
          padding: opts.padding,
        }
      );

      let buf;
      switch (opts.rotate) {
        case "R":
          buf = right(mono);
          break;
        case "B":
        case "L":
          buf = left(mono);
          break;
        case "I":
          buf = invert(mono);
          break;
        default:
          buf = normal(mono);
          break;
      }

      const imgWidth = buf.width;
      const imgHeight = buf.height;
      const rowLength = ~~((imgWidth + 7) / 8);
      let compressed;

      if (zlib) {
        compressed = zlib.deflateSync(buf).toString("base64");
      } else {
        compressed = u8tob64(global.pako.deflate(buf));
      }

      return {
        length: buf.length,
        rowlen: rowLength,
        width: imgWidth,
        height: imgHeight,
        z64: `:Z64:${compressed}:${crc16(compressed)}`,
      };
    }

    function rgbaToACS(rgba, width, opts = {}) {
      if (!width || width < 0) throw new Error("Invalid width");
      const height = ~~(rgba.length / width / 4);

      const mono = monochrome(
        rgba,
        width,
        height,
        +opts.black || 50,
        opts.notrim,
        {
          contrast: opts.contrast,
          brightness: opts.brightness,
          dithering: opts.dithering,
          sharpen: opts.sharpen,
          padding: opts.padding,
        }
      );

      let buf;
      switch (opts.rotate) {
        case "R":
          buf = right(mono);
          break;
        case "B":
        case "L":
          buf = left(mono);
          break;
        case "I":
          buf = invert(mono);
          break;
        default:
          buf = normal(mono);
          break;
      }

      const imgWidth = buf.width;
      const imgHeight = buf.height;
      const rowLength = ~~((imgWidth + 7) / 8);

      // Convert to hex string
      let hex = "";
      for (let i = 0; i < buf.length; i++) {
        hex += hexmap[buf[i]];
      }

      // Apply ACS compression
      let acs = "";
      const re = /([0-9a-fA-F])\1{2,}/g;
      let match = re.exec(hex);
      let pos = 0;

      while (match) {
        acs += hex.substring(pos, match.index);
        let len = match[0].length;

        // Handle long runs
        while (len >= 400) {
          acs += "z";
          len -= 400;
        }

        if (len >= 20) {
          acs += "_ghijklmnopqrstuvwxy"[~~(len / 20)];
          len %= 20;
        }

        if (len > 0) {
          acs += "_GHIJKLMNOPQRSTUVWXY"[len];
        }

        acs += match[1];
        pos = re.lastIndex;
        match = re.exec(hex);
      }

      acs += hex.substr(pos);

      return {
        length: buf.length,
        rowlen: rowLength,
        width: imgWidth,
        height: imgHeight,
        acs: acs,
      };
    }

    function imageToZ64(img, opts = {}) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = +img.width || img.offsetWidth;
      canvas.height = +img.height || img.offsetHeight;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const enhancedOpts = {
        ...opts,
        contrast: opts.contrast || 15,
        sharpen: opts.sharpen || 2,
        dithering: opts.dithering || "floyd-steinberg",
      };

      return rgbaToZ64(pixels.data, pixels.width, enhancedOpts);
    }

    function imageToACS(img, opts = {}) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = +img.width || img.offsetWidth;
      canvas.height = +img.height || img.offsetHeight;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return rgbaToACS(pixels.data, pixels.width, opts);
    }

    return {
      rgbaToZ64,
      rgbaToACS,
      imageToZ64,
      imageToACS,
    };
  })();

  // Add to global scope
  global.imageToZ64 = zplImageModule.imageToZ64;
  global.imageToACS = zplImageModule.imageToACS;

  /**
   * Convert base64 image to ZPL format
   * @param {string} base64 - Base64 encoded image string
   * @param {Object} options - Conversion options
   * @param {number} options.width - Width in cm
   * @param {number} options.height - Height in cm
   * @param {number} options.blackThreshold - Black threshold (1-99)
   * @param {number} options.darkness - Darkness (%)
   * @param {string} options.rotation - Rotation (N, R, L, I)
   * @param {string} options.format - Format (Z64, ACS)
   * @param {boolean} options.noTrim - No Trim option
   * @returns {Promise<string>} - ZPL output
   */
  function convertToZPL(base64, options = {}) {
    const defaultOptions = {
      width: 8, // Width in cm
      height: 4.5, // Height in cm
      blackThreshold: 50, // Black threshold (1-99)
      darkness: 70, // Darkness (%)
      rotation: "N", // Rotation (N, R, L, I)
      format: "ACS", // Format (Z64, ACS)
      noTrim: true, // No Trim option
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      try {
        const img = new Image();

        img.onload = () => {
          try {
            // Calculate target size in dots (203 dpi = ~80 dpmm)
            const widthDots = Math.round(mergedOptions.width * 80);
            const heightDots = Math.round(mergedOptions.height * 80);

            // Create canvas for resizing
            const canvas = document.createElement("canvas");
            canvas.width = widthDots;
            canvas.height = heightDots;
            const ctx = canvas.getContext("2d");

            // Fill with white background
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, widthDots, heightDots);

            // Draw the image
            ctx.drawImage(img, 0, 0, widthDots, heightDots);

            // Process with ZPL conversion
            let result;
            if (mergedOptions.format === "Z64") {
              result = imageToZ64(canvas, {
                black: mergedOptions.blackThreshold,
                rotate: mergedOptions.rotation,
                notrim: mergedOptions.noTrim,
              });
            } else {
              result = imageToACS(canvas, {
                black: mergedOptions.blackThreshold,
                rotate: mergedOptions.rotation,
                notrim: mergedOptions.noTrim,
              });
            }

            // Generate ZPL code
            const zpl =
              `^XA\n` +
              `^FO0,0` +
              `^FX Image (${result.width}x${result.height}px, ${mergedOptions.rotation}-Rotate, ${mergedOptions.blackThreshold}% Black)^FS\n` +
              `^GFA,${result.length},${result.length},${result.rowlen},` +
              (mergedOptions.format === "Z64" ? result.z64 : result.acs) +
              `\n` +
              `^MD${mergedOptions.darkness}\n` +
              `^XZ`;

            resolve(zpl);
          } catch (err) {
            reject(
              new Error(
                `Failed to convert to ZPL: ${err.message || "Unknown error"}`
              )
            );
          }
        };

        img.onerror = () => {
          reject(new Error("Failed to load image from base64"));
        };

        // Handle base64 string (with or without data URL prefix)
        img.src = base64.startsWith("data:image")
          ? base64
          : `data:image/png;base64,${base64}`;
      } catch (err) {
        reject(
          new Error(`ZPL conversion error: ${err.message || "Unknown error"}`)
        );
      }
    });
  }

  // Export the function
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      convertToZPL,
      imageToZ64: zplImageModule.imageToZ64,
      imageToACS: zplImageModule.imageToACS,
      rgbaToZ64: zplImageModule.rgbaToZ64,
      rgbaToACS: zplImageModule.rgbaToACS,
    };
  } else {
    global.convertToZPL = convertToZPL;
    global.imageToZ64 = zplImageModule.imageToZ64;
    global.imageToACS = zplImageModule.imageToACS;
    global.rgbaToZ64 = zplImageModule.rgbaToZ64;
    global.rgbaToACS = zplImageModule.rgbaToACS;
  }
})(typeof self !== "undefined" ? self : this);
