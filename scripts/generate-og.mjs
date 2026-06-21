// Generates the social-preview (Open Graph) image at public/og-image.png.
// Run with: node scripts/generate-og.mjs
//
// 1200x630 is the canonical OG/Twitter card size. Social platforms only render
// raster images (PNG/JPG), so we author an SVG and rasterize it with resvg.
// The name is set in Source Serif 4 to mirror the career-graph hero masthead;
// the meta lines use Space Grotesk (the site wordmark). resvg can't decode
// woff2 here, so we load static TTFs from scripts/fonts (instanced from the
// fontsource woff2: Source Serif @600, Space Grotesk @500).

import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const serifFont = resolve(root, "scripts/fonts/source-serif-4.ttf");
const groteskFont = resolve(root, "scripts/fonts/space-grotesk.ttf");
const SERIF = "Source Serif 4";
const SANS = "Space Grotesk Light";

const W = 1200;
const H = 630;
const ACCENT = "#88a8ff"; // slate-blue accent (dark-mode token)

// A small constellation of graph nodes on the right, echoing the career-graph
// hero. Deterministic positions so the image is stable across regenerations.
const nodes = [
  { x: 1004, y: 150, r: 26, o: 1 },
  { x: 1104, y: 250, r: 12, o: 0.85 },
  { x: 924, y: 286, r: 9, o: 0.7 },
  { x: 1044, y: 384, r: 16, o: 0.9 },
  { x: 900, y: 430, r: 8, o: 0.6 },
  { x: 1124, y: 474, r: 10, o: 0.75 },
  { x: 974, y: 516, r: 7, o: 0.55 },
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
    return `<line x1="${s.x}" y1="${s.y}" x2="${t.x}" y2="${t.y}" stroke="${ACCENT}" stroke-opacity="0.26" stroke-width="1.5" />`;
  })
  .join("");

const nodeMarkup = nodes
  .map(
    (n) =>
      `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${ACCENT}" fill-opacity="${0.1 + n.o * 0.16}" stroke="${ACCENT}" stroke-opacity="${n.o}" stroke-width="2" />`,
  )
  .join("");

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0e14" />
      <stop offset="1" stop-color="#141a23" />
    </linearGradient>
    <radialGradient id="glow" cx="0.84" cy="0.30" r="0.62">
      <stop offset="0" stop-color="${ACCENT}" stop-opacity="0.18" />
      <stop offset="1" stop-color="${ACCENT}" stop-opacity="0" />
    </radialGradient>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.4" fill="#ffffff" fill-opacity="0.04" />
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <rect width="${W}" height="${H}" fill="url(#dots)" />
  <rect width="${W}" height="${H}" fill="url(#glow)" />

  <g>${edgeMarkup}${nodeMarkup}</g>

  <!-- accent rule + eyebrow -->
  <rect x="80" y="214" width="44" height="4" rx="2" fill="${ACCENT}" />
  <text x="138" y="222" font-family="${SANS}" font-size="21" font-weight="500" letter-spacing="6" fill="#8b93a1">CAREER · KNOWLEDGE GRAPH</text>

  <!-- name (Source Serif, mirrors the hero masthead) -->
  <text x="76" y="338" font-family="${SERIF}" font-size="104" font-weight="600" letter-spacing="-3" fill="#eef2f7">Christopher Nielson</text>

  <!-- role -->
  <text x="80" y="404" font-family="${SANS}" font-size="33" font-weight="500" fill="#c4cad3">Full Stack SWE · Risk Engineering at BNY</text>

  <!-- focus line -->
  <text x="80" y="456" font-family="${SANS}" font-size="24" font-weight="500" fill="#8b93a1">Production AI agent infrastructure · context engineering</text>

  <!-- credentials row -->
  <text x="80" y="520" font-family="${SANS}" font-size="23" font-weight="500" fill="#6b7686">BNY  ·  Carnegie Mellon  ·  Florida State</text>

  <!-- url -->
  <text x="80" y="566" font-family="${SANS}" font-size="23" font-weight="500" letter-spacing="1" fill="${ACCENT}">cjnielson.com</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: W },
  font: {
    fontFiles: [serifFont, groteskFont],
    loadSystemFonts: false,
    defaultFontFamily: SANS,
  },
});

const png = resvg.render().asPng();
const out = resolve(root, "public/og-image.png");
writeFileSync(out, png);

console.log(`Wrote ${out} (${png.length} bytes, ${W}x${H})`);
