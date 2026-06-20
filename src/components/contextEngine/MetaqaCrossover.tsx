"use client";

import { useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { motion } from "@/components/Motion";
import {
  MODE_COLORS,
  MODE_LABELS,
  MODE_SHORT,
  ce,
  contrastsFor,
  metaqaRows,
  shortModel,
  type Hop,
  type MetaqaContrast,
  type MetaqaModeStat,
  type MetaqaRow,
  type Mode,
} from "@/data/contextEngine";

/**
 * MetaQA — the external-gold validity arm. Questions + gold come from MetaQA's
 * held-out test set (not our graph), so a "graph wins" result can't be circular.
 *
 * Three exports:
 *   • MetaqaCrossover  — the HERO: mean F1 vs model size (log x), one line per
 *                        key mode (none / vector / graph_rag / graph) with CI
 *                        bands; annotates the context-substitutes-for-capacity
 *                        crossover (1.7B graph_rag beats 30B vector).
 *   • MetaqaTable      — per-model × all-nine-modes F1 [95% CI], hop-toggled.
 *   • MetaqaContrasts  — per-model × pair Δ [95% CI], d_z, Holm-significance.
 */

// ── shared layout ────────────────────────────────────────────────────────────
const HERO_MODES: Mode[] = ["none", "vector", "graph_rag", "graph"];
const W = 720;
const H = 440;
const M = { top: 28, right: 142, bottom: 54, left: 50 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;
const X_MIN = 1.5;
const X_MAX = 34;
const X_TICKS = [1.7, 3, 4, 8, 14, 30];

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
function bandPath(pts: { x: number; lo: number; hi: number }[]) {
  if (pts.length < 2) return "";
  const top = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${yScale(p.hi)}`).join(" ");
  const bot = [...pts]
    .reverse()
    .map((p) => `L${p.x},${yScale(p.lo)}`)
    .join(" ");
  return `${top} ${bot} Z`;
}

interface Focus {
  model: string;
  mode: Mode;
  x: number;
  y: number;
  f1: number;
}

// ── HERO: the crossover line chart ───────────────────────────────────────────
export function MetaqaCrossover() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();
  const show = inView || reduced;
  const [hover, setHover] = useState<Mode | null>(null);
  const [focus, setFocus] = useState<Focus | null>(null);

  const mq = ce.metaqa;
  if (!mq) return null;
  // Single-family Qwen3 ladder for the lines; everything else shown as faint dots.
  const rows = metaqaRows("pooled");
  const qwen = rows.filter((r) => /^qwen3-\d/.test(r.model));
  const others = rows.filter((r) => !/^qwen3-\d/.test(r.model));
  const dim = (mode: Mode) => (hover && hover !== mode ? 0.1 : 1);

  // Substitution markers: smallest graph_rag vs largest vector.
  const small = [...rows].sort((a, b) => a.params_b - b.params_b)[0];
  const big = [...rows].sort((a, b) => b.params_b - a.params_b)[0];

  return (
    <figure ref={ref} className="not-prose my-2">
      <div className="glass-panel relative overflow-hidden p-2 sm:p-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full"
          role="img"
          aria-label="MetaQA mean F1 versus model size on a log axis, one line per retrieval mode. Passive graph context sits far above vector RAG and agentic graph access across the whole size ladder."
          onMouseLeave={() => setFocus(null)}
        >
          <defs>
            <filter id="ce-mq-glow" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

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
            mean F1 — MetaQA external gold
          </text>

          {/* CI bands (Qwen3 ladder) */}
          {HERO_MODES.map((mode) => {
            const pts = qwen
              .filter((r) => r[mode] != null)
              .map((r) => ({ x: xScale(r.params_b), lo: r[mode]!.lo, hi: r[mode]!.hi }));
            if (pts.length < 2) return null;
            return (
              <motion.path
                key={`band-${mode}`}
                d={bandPath(pts)}
                fill={MODE_COLORS[mode]}
                initial={{ opacity: 0 }}
                animate={{ opacity: show ? dim(mode) * 0.1 : 0 }}
                transition={{ duration: 0.5, delay: show ? 0.5 : 0 }}
                pointerEvents="none"
              />
            );
          })}

          {/* faint dots for the cross-family models */}
          {HERO_MODES.map((mode) =>
            others
              .filter((r) => r[mode] != null)
              .map((r) => (
                <motion.circle
                  key={`o-${mode}-${r.model}`}
                  cx={xScale(r.params_b)}
                  cy={yScale(r[mode]!.f1)}
                  r={3}
                  fill={MODE_COLORS[mode]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: show ? dim(mode) * 0.42 : 0 }}
                  transition={{ duration: 0.4, delay: show ? 0.8 : 0 }}
                  onMouseEnter={() =>
                    setFocus({
                      model: shortModel(r.model),
                      mode,
                      x: xScale(r.params_b),
                      y: yScale(r[mode]!.f1),
                      f1: r[mode]!.f1,
                    })
                  }
                />
              )),
          )}

          {/* Qwen3 lines */}
          {HERO_MODES.map((mode, mi) => {
            const pts = qwen
              .filter((r) => r[mode] != null)
              .map((r) => ({ x: xScale(r.params_b), y: yScale(r[mode]!.f1), r }));
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
                  filter={isHero ? "url(#ce-mq-glow)" : undefined}
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
                    key={p.r.model}
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
                      setFocus({
                        model: shortModel(p.r.model),
                        mode,
                        x: p.x,
                        y: p.y,
                        f1: p.r[mode]!.f1,
                      })
                    }
                  />
                ))}
              </g>
            );
          })}

          {/* substitution annotation: 1.7B graph_rag ≳ 30B vector */}
          {small?.graph_rag && big?.vector && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: show ? 1 : 0 }}
              transition={{ duration: 0.5, delay: show ? 1.4 : 0 }}
              pointerEvents="none"
            >
              <line
                x1={xScale(small.params_b)}
                y1={yScale(small.graph_rag.f1)}
                x2={xScale(big.params_b)}
                y2={yScale(big.vector.f1)}
                stroke="var(--color-foreground)"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.4}
              />
              <text
                x={M.left + PLOT_W / 2}
                y={yScale(0.46)}
                textAnchor="middle"
                className="fill-[var(--color-foreground)] text-[11px] font-medium"
              >
                a 1.7B reading a subgraph ≳ a 30B doing vector RAG
              </text>
            </motion.g>
          )}

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
          {HERO_MODES.map((mode, i) => (
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
                {MODE_SHORT[mode]}
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
              <span style={{ color: MODE_COLORS[focus.mode] }}>{MODE_LABELS[focus.mode]}</span> · F1{" "}
              {focus.f1.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </figure>
  );
}

// ── per-model × all-modes table ──────────────────────────────────────────────
const TABLE_MODES: Mode[] = [
  "none",
  "vector",
  "vector_matched",
  "triple_rag",
  "graph_rag_blind",
  "graph_rag",
  "graph",
  "oracle",
];

function Cell({ stat, accent }: { stat: MetaqaModeStat | null; accent?: boolean }) {
  if (!stat) return <td className="px-2 py-2 text-center text-muted-foreground">—</td>;
  return (
    <td className="px-2 py-2 align-middle">
      <div
        className={`font-mono text-sm tabular-nums ${accent ? "font-semibold" : ""} text-foreground`}
      >
        {stat.f1.toFixed(2)}
      </div>
      <div className="font-mono text-[10px] tabular-nums text-muted-foreground">
        [{stat.lo.toFixed(2)}–{stat.hi.toFixed(2)}]
      </div>
    </td>
  );
}

export function MetaqaTable() {
  const mq = ce.metaqa;
  const [hop, setHop] = useState<Hop>("pooled");
  if (!mq) return null;
  const rows: MetaqaRow[] = metaqaRows(hop);

  return (
    <div className="glass-panel p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-border bg-background/50 p-0.5">
          {(["2", "3", "pooled"] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHop(h)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                hop === h ? "bg-accent text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {h === "pooled" ? "2+3 hop" : `${h}-hop`}
            </button>
          ))}
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          external gold · {mq.meta.nQuestions} q · F1 [95% CI, paired bootstrap]
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-2 font-semibold">Model</th>
              <th className="px-2 py-2 text-right font-semibold">Size</th>
              {TABLE_MODES.map((m) => (
                <th key={m} className="px-2 py-2 font-semibold" style={{ color: MODE_COLORS[m] }}>
                  {MODE_SHORT[m]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((r) => (
              <tr key={r.model}>
                <td className="px-2 py-2">
                  <span className="text-sm text-foreground">{shortModel(r.model)}</span>
                  {r.control && (
                    <span className="ml-1.5 rounded bg-border/60 px-1 py-0.5 text-[9px] uppercase text-muted-foreground">
                      control
                    </span>
                  )}
                  {r.incomplete && (
                    <span className="ml-1.5 rounded bg-amber-500/20 px-1 py-0.5 text-[9px] uppercase text-amber-500">
                      partial
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {r.params_b}B
                </td>
                {TABLE_MODES.map((m) => (
                  <Cell key={m} stat={r[m]} accent={m === "graph_rag"} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-5 text-muted">{mq.meta.note}</p>
    </div>
  );
}

// ── headline contrast call-outs ──────────────────────────────────────────────
function sigPos(xs: MetaqaContrast[]) {
  return xs.filter((c) => c.sig && c.delta > 0).length;
}
function sigNeg(xs: MetaqaContrast[]) {
  return xs.filter((c) => c.sig && c.delta < 0).length;
}

export function MetaqaContrasts() {
  const mq = ce.metaqa;
  if (!mq) return null;
  const grVsVector = contrastsFor("graph_rag-vector");
  const grVsAgentic = contrastsFor("graph_rag-graph");
  const grVsTriple = contrastsFor("graph_rag-triple_rag");
  const oracleVsGr = contrastsFor("oracle-graph_rag");

  const cards = [
    {
      title: "Graph context vs. Vector RAG",
      stat: `${sigPos(grVsVector)}/${grVsVector.length}`,
      blurb:
        "models where passive graph context significantly beats the tuned bge-m3 + rerank baseline (Holm-corrected).",
    },
    {
      title: "Passive vs. Agentic — the crossover",
      stat: `${sigPos(grVsAgentic)}/${grVsAgentic.length}`,
      blurb:
        "models that do significantly better READING a subgraph than DRIVING graph tools — every model, on-device.",
    },
    {
      title: "Structure vs. the same facts flat",
      stat: `${sigPos(grVsTriple)}/${grVsTriple.length}`,
      blurb:
        "models where the structured subgraph beats the identical triples flattened (triple_rag) — it is structure, not content.",
    },
    {
      title: "Oracle ≈ graph context",
      stat: `${sigNeg(oracleVsGr)}/${oracleVsGr.length}`,
      blurb:
        "models where the answer-bearing oracle significantly tops graph_rag — retrieval is near-ceiling; residual error is reading.",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.title} className="glass-panel p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {c.title}
          </div>
          <div className="mt-1 text-2xl font-semibold text-foreground">{c.stat}</div>
          <p className="mt-1 text-xs text-muted">{c.blurb}</p>
        </div>
      ))}
    </div>
  );
}
