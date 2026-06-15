// Generates the site favicon — a small knowledge-graph glyph (one bright accent
// "hub" node wired to muted satellites) on a dark rounded tile, echoing the
// career-graph hero and OG image. Single source of truth: the SVG below is
// written to public/favicon.svg AND rasterized into a multi-size public/favicon.ico.
//
// Run with: node scripts/generate-favicon.mjs

import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// 64x64 viewBox. Hub at (29,32); four satellites around it; a hub→satellite
// star plus one satellite→satellite edge so it reads as a graph, not a snowflake.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Christopher Nielson">
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1b1f23" />
      <stop offset="1" stop-color="#101316" />
    </linearGradient>
    <linearGradient id="hub" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6aa6ff" />
      <stop offset="1" stop-color="#2362d2" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#tile)" />
  <g stroke="#46525f" stroke-width="4" stroke-linecap="round">
    <line x1="29" y1="32" x2="48" y2="15" />
    <line x1="29" y1="32" x2="51" y2="40" />
    <line x1="29" y1="32" x2="27" y2="52" />
    <line x1="29" y1="32" x2="13" y2="24" />
    <line x1="48" y1="15" x2="51" y2="40" />
  </g>
  <g fill="#9aa6b2">
    <circle cx="48" cy="15" r="5" />
    <circle cx="51" cy="40" r="5" />
    <circle cx="27" cy="52" r="4.5" />
    <circle cx="13" cy="24" r="4.5" />
  </g>
  <circle cx="29" cy="32" r="8.5" fill="url(#hub)" stroke="#bcd6ff" stroke-opacity="0.55" stroke-width="1.4" />
</svg>`;

// --- write the SVG favicon (modern browsers prefer this) ---
const svgOut = resolve(root, "public/favicon.svg");
writeFileSync(svgOut, svg + "\n");
console.log(`Wrote ${svgOut} (${svg.length} bytes)`);

// --- rasterize PNGs and assemble a PNG-based .ico (Vista+ format) ---
const SIZES = [16, 32, 48];

const pngs = SIZES.map((size) => {
  const png = new Resvg(svg, { fitTo: { mode: "width", value: size } })
    .render()
    .asPng();
  return { size, data: Buffer.from(png) };
});

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

// Optional larger preview to eyeball the design: node scripts/generate-favicon.mjs --preview
if (process.argv.includes("--preview")) {
  const preview = new Resvg(svg, { fitTo: { mode: "width", value: 256 } })
    .render()
    .asPng();
  const previewOut = resolve(root, "public/favicon-preview.png");
  writeFileSync(previewOut, preview);
  console.log(`Wrote ${previewOut} (preview, 256x256)`);
}
