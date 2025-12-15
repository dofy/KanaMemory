// scripts/convert-images.js
// Usage: pnpm add -D sharp && node scripts/convert-images.js
// This script reads all .svg files in public/images and writes PNG and WebP versions.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const imagesDir = path.join(__dirname, "..", "public", "images");

async function convertFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext !== ".svg") return;
  const basename = path.basename(file, ext);
  const input = path.join(imagesDir, file);
  const pngOut = path.join(imagesDir, basename + ".png");
  const webpOut = path.join(imagesDir, basename + ".webp");

  try {
    const data = fs.readFileSync(input);
    const img = sharp(data).resize({ width: 1200 });
    await img.png({ quality: 90 }).toFile(pngOut);
    await img.webp({ quality: 80 }).toFile(webpOut);
    console.log(
      "Converted",
      file,
      "->",
      basename + ".png,",
      basename + ".webp"
    );
  } catch (err) {
    console.error("Failed to convert", file, err);
  }
}

async function run() {
  if (!fs.existsSync(imagesDir)) {
    console.error("images directory not found:", imagesDir);
    process.exit(1);
  }
  const files = fs.readdirSync(imagesDir);
  for (const f of files) {
    // skip our generated pngs/webps
    if (f.endsWith(".png") || f.endsWith(".webp")) continue;
    await convertFile(f);
  }
}

run();
