// Generates the site favicon — the initials "CN" set in Source Serif 4 (the same
// editorial serif as the career-graph hero masthead) on a dark slate rounded
// tile with a faint slate-blue edge. Single source of truth: the SVG below is
// written to public/favicon.svg AND rasterized into public/favicon.ico plus the
// PWA icons (logo192/logo512).
//
// The .ico/PNGs are rasterized with the real Source Serif via resvg; the
// on-disk favicon.svg uses a serif font stack so it stays tiny (no 50KB embed)
// while still reading as the same elegant serif.
//
// Run with: node scripts/generate-favicon.mjs   (add --preview for a 256px PNG)

import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// resvg can't decode woff2 in this environment, so we ship a static TTF
// (Source Serif 4 instanced at wght=600) decompressed from the fontsource woff2.
const serifFont = resolve(root, "scripts/fonts/source-serif-4.ttf");

// 64x64 viewBox. Initials centred; baseline nudged so the caps sit optically
// centred in the tile. `fontFamily` is swapped between the on-disk SVG (serif
// stack) and the resvg raster pass (exact Source Serif).
const tile = (fontFamily) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Christopher Nielson">
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#151b25" />
      <stop offset="1" stop-color="#0a0e14" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#tile)" />
  <rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke="#88a8ff" stroke-opacity="0.20" stroke-width="1.5" />
  <text x="32" y="45.5" text-anchor="middle" font-family="${fontFamily}" font-size="40" font-weight="600" letter-spacing="-2" fill="#eef2f7">CN</text>
</svg>`;

const svgFile = tile(
  "'Source Serif 4 Variable', Georgia, 'Times New Roman', serif",
);
const svgRaster = tile("Source Serif 4");

// --- write the SVG favicon (modern browsers prefer this) ---
const svgOut = resolve(root, "public/favicon.svg");
writeFileSync(svgOut, svgFile + "\n");
console.log(`Wrote ${svgOut} (${svgFile.length} bytes)`);

const renderPng = (size) =>
  Buffer.from(
    new Resvg(svgRaster, {
      fitTo: { mode: "width", value: size },
      font: {
        fontFiles: [serifFont],
        loadSystemFonts: false,
        defaultFontFamily: "Source Serif 4",
      },
    })
      .render()
      .asPng(),
  );

// --- rasterize PNGs and assemble a PNG-based .ico (Vista+ format) ---
const SIZES = [16, 32, 48];
const pngs = SIZES.map((size) => ({ size, data: renderPng(size) }));

function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(images.length, 4); // image count

  const dir = Buffer.alloc(16 * images.length);
  let offset = header.length + dir.length;

  images.forEach((img, i) => {
    const e = i * 16;
    // 0 means 256; our sizes are <256 so write them directly.
    dir.writeUInt8(img.size >= 256 ? 0 : img.size, e + 0); // width
    dir.writeUInt8(img.size >= 256 ? 0 : img.size, e + 1); // height
    dir.writeUInt8(0, e + 2); // palette colors
    dir.writeUInt8(0, e + 3); // reserved
    dir.writeUInt16LE(1, e + 4); // color planes
    dir.writeUInt16LE(32, e + 6); // bits per pixel
    dir.writeUInt32LE(img.data.length, e + 8); // image byte size
    dir.writeUInt32LE(offset, e + 12); // image offset
    offset += img.data.length;
  });

  return Buffer.concat([header, dir, ...images.map((i) => i.data)]);
}

const icoOut = resolve(root, "public/favicon.ico");
const ico = buildIco(pngs);
writeFileSync(icoOut, ico);
console.log(`Wrote ${icoOut} (${ico.length} bytes, sizes: ${SIZES.join(", ")})`);

// --- PWA icons referenced by manifest.json ---
for (const size of [192, 512]) {
  const out = resolve(root, `public/logo${size}.png`);
  writeFileSync(out, renderPng(size));
  console.log(`Wrote ${out} (${size}x${size})`);
}

// Optional larger preview to eyeball the design.
if (process.argv.includes("--preview")) {
  const previewOut = resolve(root, "public/favicon-preview.png");
  writeFileSync(previewOut, renderPng(256));
  console.log(`Wrote ${previewOut} (preview, 256x256)`);
}
