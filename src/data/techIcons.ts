// Brand icons for technology / tool / resource nodes, sourced from
// simple-icons (authentic glyphs + official brand colors). Rendered as a
// brand-colored tile in the node inspector. The glyph color is chosen from
// the brand's luminance so it stays legible on the tile in both light and
// dark site themes (the tile is the brand color regardless of page theme).
//
// Note: OpenAI and LinkedIn brand marks were removed from simple-icons for
// trademark reasons, so those nodes simply fall back to no emblem.

import {
  siClaude,
  siD3,
  siDocker,
  siFastapi,
  siGithub,
  siGithubactions,
  siKubernetes,
  siLangchain,
  siLinux,
  siMongodb,
  siNeo4j,
  siNextdotjs,
  siPostgresql,
  siPython,
  siReact,
  siScikitlearn,
  siSnowflake,
  siTypescript,
} from "simple-icons";

interface RawIcon {
  title: string;
  hex: string;
  path: string;
}

export interface TechIcon {
  title: string;
  /** Tile background — the official brand color. */
  bg: string;
  /** Glyph color, contrast-picked against the tile. */
  fg: string;
  /** SVG path data (24x24 viewBox). */
  path: string;
}

function toEmblem(icon: RawIcon): TechIcon {
  const channel = (start: number) => {
    const value = parseInt(icon.hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  };
  const luminance =
    0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);

  return {
    title: icon.title,
    bg: `#${icon.hex}`,
    fg: luminance > 0.55 ? "#0f1216" : "#ffffff",
    path: icon.path,
  };
}

/** Keyed by knowledge-graph node id. */
export const techIcons: Record<string, TechIcon> = {
  python: toEmblem(siPython),
  typescript: toEmblem(siTypescript),
  react: toEmblem(siReact),
  nextjs: toEmblem(siNextdotjs),
  fastapi: toEmblem(siFastapi),
  scikit: toEmblem(siScikitlearn),
  docker: toEmblem(siDocker),
  kubernetes: toEmblem(siKubernetes),
  postgres: toEmblem(siPostgresql),
  snowflake: toEmblem(siSnowflake),
  mongodb: toEmblem(siMongodb),
  d3: toEmblem(siD3),
  neo4j: toEmblem(siNeo4j),
  linux: toEmblem(siLinux),
  langgraph: toEmblem(siLangchain),
  "claude-sdk": toEmblem(siClaude),
  cicd: toEmblem(siGithubactions),
  github: toEmblem(siGithub),
};

export function getTechIcon(id: string): TechIcon | undefined {
  return techIcons[id];
}
