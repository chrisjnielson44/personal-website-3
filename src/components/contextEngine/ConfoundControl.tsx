"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { motion } from "@/components/Motion";
import { MODE_COLORS, MODE_LABELS, metaqaMean, type Mode } from "@/data/contextEngine";

/**
 * The confound-control panel — the most important NEW visual. It answers "is the
 * graph_rag win about VOLUME, CONTENT, the relation heuristic, or RETRIEVAL?" by
 * lining graph_rag up against four controls, each isolating one alternative
 * explanation. A labeled ladder of pooled MetaQA mean F1 (external gold).
 */

interface Rung {
  mode: Mode;
  isolates: string;
}

// Ordered as a narrative ladder, ending at the oracle ceiling.
const RUNGS: Rung[] = [
  { mode: "triple_rag", isolates: "the SAME facts, flattened — no structure" },
  { mode: "vector_matched", isolates: "the vector baseline given the graph's token budget — volume, not structure" },
  { mode: "graph_rag_blind", isolates: "the subgraph with relation guidance OFF" },
  { mode: "graph_rag", isolates: "the relation-guided subgraph (headline)" },
  { mode: "oracle", isolates: "answer-bearing facts only — the passive-context ceiling" },
];

export function ConfoundControl() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduced = useReducedMotion();
  const show = inView || reduced === true;

  const data = RUNGS.map((r) => ({ ...r, f1: metaqaMean(r.mode) ?? 0 }));
  const gr = metaqaMean("graph_rag") ?? 0;
  const max = Math.max(...data.map((d) => d.f1), 0.0001);

  return (
    <div ref={ref} className="glass-panel p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-medium text-foreground">
          Structure, not volume or content — and retrieval is near-ceiling
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          pooled mean F1 · external gold · 10 models
        </span>
      </div>

      <div className="space-y-3">
        {data.map((d, i) => {
          const isHead = d.mode === "graph_rag";
          const isCeiling = d.mode === "oracle";
          // delta vs graph_rag, shown on the controls
          const delta = d.f1 - gr;
          return (
            <div
              key={d.mode}
              className="grid grid-cols-[10.5rem_1fr_3rem] items-center gap-3 sm:grid-cols-[12rem_1fr_3.5rem]"
            >
              <div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: MODE_COLORS[d.mode] }}
                >
                  {MODE_LABELS[d.mode]}
                </div>
                <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                  {d.isolates}
                </div>
              </div>
              <div className="relative h-6 w-full overflow-hidden rounded bg-border/50">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded"
                  style={{
                    backgroundColor: MODE_COLORS[d.mode],
                    boxShadow: isHead ? `0 0 0 1.5px ${MODE_COLORS.graph_rag}` : undefined,
                    opacity: isHead || isCeiling ? 1 : 0.82,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: show ? `${(d.f1 / max) * 100}%` : 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: show ? i * 0.09 : 0 }}
                />
                {/* graph_rag reference line on the control rows */}
                {!isHead && !isCeiling && (
                  <div
                    className="absolute inset-y-0 w-px bg-[var(--color-foreground)] opacity-40"
                    style={{ left: `${(gr / max) * 100}%` }}
                    title={`graph_rag ${gr.toFixed(2)}`}
                  />
                )}
              </div>
              <div className="text-right">
                <div className="font-mono text-sm tabular-nums text-foreground">
                  {d.f1.toFixed(2)}
                </div>
                {!isHead && (
                  <div
                    className="font-mono text-[10px] tabular-nums"
                    style={{ color: delta >= 0 ? "var(--cat-projects)" : "var(--color-muted-foreground)" }}
                  >
                    {delta >= 0 ? "+" : ""}
                    {delta.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-5 text-muted">
        The vertical tick on each control row marks the <strong className="text-foreground">graph
        context</strong> score. Flat triples carry the same facts but collapse to closed-book level;
        the budget-matched vector arm controls for context volume and still trails; the blind subgraph
        nearly matches the guided one (the relation heuristic adds little — the win is{" "}
        <em>delivering a subgraph at all</em>); and the oracle barely beats graph context, so the
        retriever is already near its ceiling and the residual error is <em>reading</em>, not retrieval.
      </p>
    </div>
  );
}
