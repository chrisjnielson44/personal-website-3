"use client";

import { useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { motion } from "@/components/Motion";
import {
  MODE_COLORS,
  MODE_LABELS,
  frontierMean,
  qwenSweep,
  sizedModels,
  type LegacyMode,
} from "@/data/contextEngine";

/**
 * Headline figure: mean F1 vs model size (log), one line per retrieval mode.
 * Lines draw themselves the first time the chart scrolls into view (driven by a
 * useInView hook — the whileInView prop on SVG children silently no-ops here).
 * The story is the flat `graph_rag` line, glowing, sitting at the frontier ceiling.
 */

const MODES: LegacyMode[] = ["graph", "graph_rag", "vector", "none"];
const W = 720;
const H = 440;
const M = { top: 28, right: 132, bottom: 52, left: 52 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;
const X_MIN = 3;
const X_MAX = 235;
const X_TICKS = [3, 8, 14, 32, 70, 235];

function xScale(p: number) {
  const t = (Math.log(p) - Math.log(X_MIN)) / (Math.log(X_MAX) - Math.log(X_MIN));
  return M.left + t * PLOT_W;
}
function yScale(f1: number) {
  return M.top + (1 - f1) * PLOT_H;
}
function linePath(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
}

interface Focus {
  model: string;
  mode: LegacyMode;
  x: number;
  y: number;
  f1: number;
}

export function GapCollapseChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();
  const show = inView || reduced;
  const [hover, setHover] = useState<LegacyMode | null>(null);
  const [focus, setFocus] = useState<Focus | null>(null);

  const sweep = qwenSweep();
  const sized = sizedModels();
  const control = sized.find((m) => m.model === "llama3.2-3b");
  const frontierGraphRag = frontierMean("graph_rag");
  const dim = (mode: LegacyMode) => (hover && hover !== mode ? 0.12 : 1);

  return (
    <figure ref={ref} className="not-prose my-2">
      <div className="glass-panel relative overflow-hidden p-2 sm:p-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Mean F1 versus model size, one line per retrieval mode. The graph-context line is flat across model size."
          onMouseLeave={() => setFocus(null)}
        >
          <defs>
            <filter id="ce-line-glow" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="3.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* y gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
            <g key={g}>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={yScale(g)}
                y2={yScale(g)}
                stroke="var(--color-border)"
                strokeWidth={1}
                opacity={0.55}
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

          {/* x ticks + axis labels */}
          {X_TICKS.map((t) => (
            <text
              key={t}
              x={xScale(t)}
              y={H - M.bottom + 20}
              textAnchor="middle"
              className="fill-[var(--color-muted-foreground)] font-mono text-[11px]"
            >
              {t}B
            </text>
          ))}
          <text
            x={M.left + PLOT_W / 2}
            y={H - 8}
            textAnchor="middle"
            className="fill-[var(--color-muted)] text-[12px]"
          >
            model size — parameters (log scale)
          </text>
          <text
            transform={`translate(14 ${M.top + PLOT_H / 2}) rotate(-90)`}
            textAnchor="middle"
            className="fill-[var(--color-muted)] text-[12px]"
          >
            mean F1 (graph-oracle scored)
          </text>

          {/* frontier ceiling reference for graph context */}
          {frontierGraphRag != null && (
            <g opacity={dim("graph_rag")}>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={yScale(frontierGraphRag)}
                y2={yScale(frontierGraphRag)}
                stroke={MODE_COLORS.graph_rag}
                strokeWidth={1.5}
                strokeDasharray="2 4"
                opacity={0.7}
              />
              <text
                x={W - M.right + 6}
                y={yScale(frontierGraphRag) + 4}
                className="fill-[var(--color-muted)] text-[10px]"
              >
                frontier
              </text>
            </g>
          )}

          {/* faint markers for non-Qwen sized models */}
          {MODES.map((mode) =>
            sized
              .filter((m) => !/^qwen3-\d/.test(m.model) && m[mode] != null)
              .map((m) => (
                <motion.circle
                  key={`${mode}-${m.model}`}
                  cx={xScale(m.params_b)}
                  cy={yScale(m[mode] as number)}
                  r={3}
                  fill={MODE_COLORS[mode]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: show ? dim(mode) * 0.4 : 0 }}
                  transition={{ duration: 0.4, delay: show ? 0.8 : 0 }}
                  onMouseEnter={() =>
                    setFocus({
                      model: m.model,
                      mode,
                      x: xScale(m.params_b),
                      y: yScale(m[mode] as number),
                      f1: m[mode] as number,
                    })
                  }
                />
              )),
          )}

          {/* Qwen3 controlled sweep — lines draw on scroll, points pop in */}
          {MODES.map((mode, mi) => {
            const pts = sweep
              .filter((m) => m[mode] != null)
              .map((m) => ({ x: xScale(m.params_b), y: yScale(m[mode] as number), m }));
            if (pts.length < 2) return null;
            const isHero = mode === "graph_rag";
            return (
              <g
                key={mode}
                opacity={dim(mode)}
                onMouseEnter={() => setHover(mode)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              >
                <motion.path
                  d={linePath(pts)}
                  fill="none"
                  stroke={MODE_COLORS[mode]}
                  strokeWidth={isHero ? 3.25 : 2.25}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  filter={isHero ? "url(#ce-line-glow)" : undefined}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: show ? 1 : 0 }}
                  transition={{
                    duration: 1.1,
                    ease: [0.22, 1, 0.36, 1],
                    delay: show ? 0.15 + mi * 0.12 : 0,
                  }}
                />
                {pts.map((p) => (
                  <motion.circle
                    key={p.m.model}
                    cx={p.x}
                    cy={p.y}
                    r={isHero ? 5 : 4}
                    fill="var(--color-card)"
                    stroke={MODE_COLORS[mode]}
                    strokeWidth={2.5}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: show ? 1 : 0, opacity: show ? 1 : 0 }}
                    transition={{ duration: 0.3, delay: show ? 0.7 + mi * 0.12 : 0 }}
                    style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                    onMouseEnter={() =>
                      setFocus({ model: p.m.model, mode, x: p.x, y: p.y, f1: p.m[mode] as number })
                    }
                  />
                ))}
              </g>
            );
          })}

          {/* llama-3.2-3b control markers (hollow, dashed) */}
          {control &&
            MODES.map((mode) =>
              control[mode] != null ? (
                <motion.circle
                  key={`ctl-${mode}`}
                  cx={xScale(control.params_b)}
                  cy={yScale(control[mode] as number)}
                  r={4.5}
                  fill="none"
                  stroke={MODE_COLORS[mode]}
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: show ? dim(mode) : 0 }}
                  transition={{ duration: 0.4, delay: show ? 0.9 : 0 }}
                  onMouseEnter={() =>
                    setFocus({
                      model: "llama3.2-3b (control)",
                      mode,
                      x: xScale(control.params_b),
                      y: yScale(control[mode] as number),
                      f1: control[mode] as number,
                    })
                  }
                />
              ) : null,
            )}

          {/* annotation on the flat graph-context line */}
          {sweep.length > 0 && (
            <motion.text
              x={xScale(14)}
              y={yScale((sweep[0].graph_rag as number) ?? 0.7) - 13}
              className="fill-[var(--color-foreground)] text-[11px] font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: show ? 1 : 0 }}
              transition={{ duration: 0.5, delay: show ? 1.3 : 0 }}
            >
              flat across 30× size →
            </motion.text>
          )}

          {/* focus crosshair */}
          {focus && (
            <circle
              cx={focus.x}
              cy={focus.y}
              r={8}
              fill="none"
              stroke={MODE_COLORS[focus.mode]}
              strokeWidth={1.5}
              pointerEvents="none"
            />
          )}

          {/* legend */}
          {MODES.map((mode, i) => (
            <g
              key={`lg-${mode}`}
              transform={`translate(${W - M.right + 6} ${M.top + 8 + i * 20})`}
              opacity={dim(mode)}
              onMouseEnter={() => setHover(mode)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              <rect width={12} height={3} y={-3} rx={1.5} fill={MODE_COLORS[mode]} />
              <text x={18} y={1} className="fill-[var(--color-muted)] text-[11px]">
                {MODE_LABELS[mode]}
              </text>
            </g>
          ))}
        </svg>

        {focus && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-2.5 py-1.5 text-xs shadow-lg backdrop-blur"
            style={{ left: `${(focus.x / W) * 100}%`, top: `calc(${(focus.y / H) * 100}% - 10px)` }}
          >
            <div className="font-medium text-foreground">{focus.model}</div>
            <div className="text-muted-foreground">
              <span style={{ color: MODE_COLORS[focus.mode] }}>{MODE_LABELS[focus.mode]}</span>{" "}
              · F1 {focus.f1.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </figure>
  );
}
