// Generates the social-preview (Open Graph) image at public/og-image.png.
// Run with: node scripts/generate-og.mjs
//
// 1200x630 is the canonical OG/Twitter card size. Social platforms only
// render raster images (PNG/JPG), so we author an SVG and rasterize it with
// resvg, loading the Space Grotesk variable font used for the site wordmark.

import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const fontPath = resolve(
  root,
  "node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
);

const W = 1200;
const H = 630;
const ACCENT = "#3b82f6";

// A small constellation of graph nodes on the right, echoing the career-graph
// hero. Deterministic positions so the image is stable across regenerations.
const nodes = [
  { x: 980, y: 150, r: 26, o: 1 },
  { x: 1080, y: 250, r: 12, o: 0.85 },
  { x: 900, y: 280, r: 9, o: 0.7 },
  { x: 1020, y: 380, r: 16, o: 0.9 },
  { x: 870, y: 420, r: 8, o: 0.6 },
  { x: 1110, y: 470, r: 10, o: 0.75 },
  { x: 950, y: 510, r: 7, o: 0.55 },
];
const edges = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [3, 4],
  [3, 5],
  [4, 6],
  [5, 6],
];

const edgeMarkup = edges
  .map(([a, b]) => {
    const s = nodes[a];
    const t = nodes[b];
    return `<line x1="${s.x}" y1="${s.y}" x2="${t.x}" y2="${t.y}" stroke="${ACCENT}" stroke-opacity="0.28" stroke-width="1.5" />`;
  })
  .join("");

const nodeMarkup = nodes
  .map(
    (n) =>
      `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${ACCENT}" fill-opacity="${0.12 + n.o * 0.18}" stroke="${ACCENT}" stroke-opacity="${n.o}" stroke-width="2" />`,
  )
  .join("");

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0c0e10" />
      <stop offset="1" stop-color="#14181c" />
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.32" r="0.6">
      <stop offset="0" stop-color="${ACCENT}" stop-opacity="0.16" />
      <stop offset="1" stop-color="${ACCENT}" stop-opacity="0" />
    </radialGradient>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.4" fill="#ffffff" fill-opacity="0.045" />
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <rect width="${W}" height="${H}" fill="url(#dots)" />
  <rect width="${W}" height="${H}" fill="url(#glow)" />

  <g>${edgeMarkup}${nodeMarkup}</g>

  <!-- accent rule + eyebrow -->
  <rect x="80" y="232" width="46" height="4" rx="2" fill="${ACCENT}" />
  <text x="140" y="240" font-family="Space Grotesk Variable" font-size="22" font-weight="600" letter-spacing="6" fill="#8b93a1">CAREER GRAPH</text>

  <!-- name -->
  <text x="78" y="350" font-family="Space Grotesk Variable" font-size="92" font-weight="600" letter-spacing="-2" fill="#f4f6f8">Christopher Nielson</text>

  <!-- role -->
  <text x="80" y="412" font-family="Space Grotesk Variable" font-size="34" font-weight="500" fill="#c2c8d0">Software Engineer · Production AI &amp; Financial Risk</text>

  <!-- credentials row -->
  <text x="80" y="468" font-family="Space Grotesk Variable" font-size="24" font-weight="500" fill="#7e8694">BNY  ·  Carnegie Mellon  ·  Florida State</text>

  <!-- url -->
  <text x="80" y="556" font-family="Space Grotesk Variable" font-size="24" font-weight="600" letter-spacing="1" fill="${ACCENT}">cjnielson.com</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: W },
  font: {
    fontFiles: [fontPath],
    loadSystemFonts: true,
    defaultFontFamily: "Space Grotesk Variable",
  },
});

const png = resvg.render().asPng();
const out = resolve(root, "public/og-image.png");
writeFileSync(out, png);

// Report the font actually used so we catch a silent fallback.
console.log(`Wrote ${out} (${png.length} bytes, ${W}x${H})`);
void readFileSync; // keep import tree-shake-safe across node versions
