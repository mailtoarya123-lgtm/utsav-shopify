const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Flood-fill BFS to remove checkerboard background from corners
function removeCheckerboard(data, width, height, channels) {
  // We want to create an RGBA buffer where checkerboard pixels connected to outer edges become transparent
  const out = Buffer.alloc(width * height * 4);
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isCheckerboard(r, g, b) {
    // Checkerboard is white (255,255,255) and light grey (225-235)
    const isWhite = r >= 245 && g >= 245 && b >= 245;
    const isGrey = r >= 220 && r <= 240 && g >= 220 && g <= 240 && b >= 220 && b <= 240 && Math.abs(r - g) <= 5 && Math.abs(g - b) <= 5;
    return isWhite || isGrey;
  }

  // Enqueue borders
  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    queue.push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
  }

  // Pre-fill output with original pixels (converted to RGBA)
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const dstIdx = i * 4;
    out[dstIdx] = data[srcIdx];
    out[dstIdx + 1] = data[srcIdx + 1];
    out[dstIdx + 2] = data[srcIdx + 2];
    out[dstIdx + 3] = channels === 4 ? data[srcIdx + 3] : 255;
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const srcIdx = idx * channels;
    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];

    if (isCheckerboard(r, g, b)) {
      out[idx * 4 + 3] = 0; // Transparent!

      if (x > 0 && !visited[idx - 1]) { queue.push(x - 1, y); }
      if (x < width - 1 && !visited[idx + 1]) { queue.push(x + 1, y); }
      if (y > 0 && !visited[idx - width]) { queue.push(x, y - 1); }
      if (y < height - 1 && !visited[idx + width]) { queue.push(x, y + 1); }
    }
  }

  return out;
}

async function processAll() {
  const sources = {
    royal_brass: '/Users/Bharath/Downloads/illuminated-golden-diya-a-symbol-of-hope-and-light-in-festive-celebrations-free-png.webp',
    terracotta_clay: '/Users/Bharath/Downloads/diwali-diya-png-transparent-background-free-download_208P.webp',
    marigold_urli: '/Users/Bharath/Downloads/diwali-diya-oil-lamp-with-marigold-flowers-indian-festival-of-lights-illustration-png.webp',
    antique_copper: '/Users/Bharath/Downloads/lit_diya_png_transparent_background_diwali.webp',
    rangoli_diya: '/Users/Bharath/Downloads/pngtree-diwali-diya-png-image_14115958.png',
    royal_crimson: '/Users/Bharath/Downloads/png-transparent-diwali-lamp-decorative-diya-with-flame-for-diwali.png',
  };

  const results = {};

  for (const [key, srcPath] of Object.entries(sources)) {
    console.log(`Processing ${key}: ${srcPath}...`);
    let pipeline = sharp(srcPath);
    const meta = await pipeline.metadata();

    let cleanBuffer;
    if (!meta.hasAlpha) {
      console.log(`Removing checkerboard for ${key}...`);
      const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
      const transparentData = removeCheckerboard(data, info.width, info.height, info.channels);
      cleanBuffer = await sharp(transparentData, {
        raw: { width: info.width, height: info.height, channels: 4 }
      }).trim().png().toBuffer();
    } else {
      cleanBuffer = await pipeline.trim().png().toBuffer();
    }

    // Save full-res master
    const masterPath = path.join(__dirname, `../app/assets/diyas/real_${key}.png`);
    await sharp(cleanBuffer).toFile(masterPath);

    // Save optimized 96px version for web embedding (small footprint ~2-3 KB)
    const optBuffer = await sharp(cleanBuffer)
      .resize(96, 96, { fit: 'inside' })
      .webp({ quality: 85, alphaQuality: 85 })
      .toBuffer();

    const optPngBuffer = await sharp(cleanBuffer)
      .resize(96, 96, { fit: 'inside' })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();

    // Use smaller of png or webp, or png for universal SVG <image> compatibility
    console.log(`${key} - master: ${cleanBuffer.length} bytes, 96px PNG: ${optPngBuffer.length} bytes, 96px WebP: ${optBuffer.length} bytes`);

    results[key] = `data:image/png;base64,${optPngBuffer.toString('base64')}`;
  }

  // If antique_copper or royal_brass, let's verify choice
  // We can write to leaf_data/diya_data.json and realDiyas.js
  const outJson = path.join(__dirname, '../app/assets/diyas/diya_data.json');
  fs.writeFileSync(outJson, JSON.stringify(results, null, 2));

  const jsContent = `// Auto-generated Real Diya Base64 Assets\nexport const REAL_DIYAS = ${JSON.stringify(results, null, 2)};\n`;
  fs.writeFileSync(path.join(__dirname, '../app/assets/diyas/realDiyas.js'), jsContent);

  console.log('Done processing real diyas!');
}

processAll().catch(console.error);
