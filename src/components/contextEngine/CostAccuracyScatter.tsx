"use client";

import { useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { motion } from "@/components/Motion";
import {
  MODE_COLORS,
  MODE_LABELS,
  scatterPoints,
  type Mode,
  type ScatterPoint,
} from "@/data/contextEngine";

/**
 * Cost vs. accuracy — tokens per query (log x) against mean F1 (y), one dot per
 * (model, mode). Graph-context dots sit up-and-to-the-left (frontier accuracy,
 * a fraction of the tokens); agentic-graph dots buy a little more for a lot more
 * tokens. Dots pop in when the chart scrolls into view (useInView hook).
 */

const W = 720;
const H = 420;
const M = { top: 24, right: 24, bottom: 50, left: 50 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;
const MODES: Mode[] = ["graph_rag", "graph"];
const Y_MIN = 0;
const Y_MAX = 1;

export function CostAccuracyScatter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();
  const show = inView || reduced;
  const pts = useMemo(() => scatterPoints(MODES), []);
  const [hover, setHover] = useState<Mode | null>(null);
  const [focus, setFocus] = useState<(ScatterPoint & { px: number; py: number }) | null>(null);

  const xs = pts.map((p) => p.tokens);
  const xMin = Math.min(...xs) * 0.85;
  const xMax = Math.max(...xs) * 1.15;

  const xScale = (t: number) =>
    M.left + ((Math.log(t) - Math.log(xMin)) / (Math.log(xMax) - Math.log(xMin))) * PLOT_W;
  const yScale = (f: number) => M.top + (1 - (f - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_H;

  const xTicks = [1000, 2000, 5000, 10000];
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0];
  const dim = (mode: Mode) => (hover && hover !== mode ? 0.1 : 1);

  return (
    <figure ref={ref} className="not-prose my-2">
      <div className="glass-panel relative overflow-hidden p-2 sm:p-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Tokens per query versus mean F1, per model and mode."
          onMouseLeave={() => setFocus(null)}
        >
          <defs>
            <linearGradient id="ce-good-corner" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={MODE_COLORS.graph_rag} stopOpacity="0.16" />
              <stop offset="55%" stopColor={MODE_COLORS.graph_rag} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* "better" corner wash */}
          <rect
            x={M.left}
            y={M.top}
            width={PLOT_W}
            height={PLOT_H}
            fill="url(#ce-good-corner)"
          />

          {yTicks.map((g) => (
            <g key={g}>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={yScale(g)}
                y2={yScale(g)}
                stroke="var(--color-border)"
                strokeWidth={1}
                opacity={0.5}
              />
              <text
                x={M.left - 10}
                y={yScale(g) + 4}
                textAnchor="end"
                className="fill-[var(--color-muted-foreground)] font-mono text-[11px]"
              >
                {g.toFixed(2)}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text
              key={t}
              x={xScale(t)}
              y={H - M.bottom + 20}
              textAnchor="middle"
              className="fill-[var(--color-muted-foreground)] font-mono text-[11px]"
            >
              {(t / 1000).toLocaleString()}k
            </text>
          ))}
          <text
            x={M.left + PLOT_W / 2}
            y={H - 8}
            textAnchor="middle"
            className="fill-[var(--color-muted)] text-[12px]"
          >
            tokens per query (log scale) — cost →
          </text>
          <text
            transform={`translate(14 ${M.top + PLOT_H / 2}) rotate(-90)`}
            textAnchor="middle"
            className="fill-[var(--color-muted)] text-[12px]"
          >
            mean F1 — accuracy ↑
          </text>
          <text
            x={M.left + 8}
            y={M.top + 16}
            className="fill-[var(--color-muted-foreground)] text-[10px] uppercase tracking-wide"
          >
            ◤ cheaper · more accurate
          </text>

          {pts.map((p, i) => {
            const px = xScale(p.tokens);
            const py = yScale(p.f1);
            const isLocal = p.backend === "ollama";
            const target = dim(p.mode) * (p.tier === "frontier" ? 0.5 : 0.92);
            return (
              <motion.circle
                key={`${p.model}-${p.mode}`}
                cx={px}
                cy={py}
                r={isLocal ? 6 : 4.5}
                fill={MODE_COLORS[p.mode]}
                stroke={isLocal ? "var(--color-foreground)" : "none"}
                strokeWidth={isLocal ? 1.5 : 0}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: show ? 1 : 0, opacity: show ? target : 0 }}
                transition={{ duration: 0.35, delay: show ? 0.1 + (i % 14) * 0.03 : 0 }}
                style={{ transformOrigin: `${px}px ${py}px`, cursor: "pointer" }}
                onMouseEnter={() => {
                  setHover(p.mode);
                  setFocus({ ...p, px, py });
                }}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}

          {focus && (
            <circle
              cx={focus.px}
              cy={focus.py}
              r={focus.backend === "ollama" ? 9 : 7.5}
              fill="none"
              stroke={MODE_COLORS[focus.mode]}
              strokeWidth={1.5}
              pointerEvents="none"
            />
          )}

          {/* legend */}
          {MODES.map((mode, i) => (
            <g
              key={mode}
              transform={`translate(${W - M.right - 150} ${H - M.bottom - 36 + i * 18})`}
              opacity={dim(mode)}
              onMouseEnter={() => setHover(mode)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              <circle cx={5} cy={-3} r={4.5} fill={MODE_COLORS[mode]} />
              <text x={16} y={1} className="fill-[var(--color-muted)] text-[11px]">
                {MODE_LABELS[mode]}
              </text>
            </g>
          ))}
        </svg>

        {focus && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-2.5 py-1.5 text-xs shadow-lg backdrop-blur"
            style={{ left: `${(focus.px / W) * 100}%`, top: `calc(${(focus.py / H) * 100}% - 10px)` }}
          >
            <div className="font-medium text-foreground">
              {focus.model}
              {focus.backend === "ollama" && (
                <span className="ml-1 text-[10px] text-[var(--cat-projects)]">on-device</span>
              )}
            </div>
            <div className="text-muted-foreground">
              <span style={{ color: MODE_COLORS[focus.mode] }}>{MODE_LABELS[focus.mode]}</span> ·
              F1 {focus.f1.toFixed(2)} · {focus.tokens.toLocaleString()} tok
            </div>
          </div>
        )}
      </div>
    </figure>
  );
}
