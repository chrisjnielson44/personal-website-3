"use client";

import { useState } from "react";
import {
  MODE_COLORS,
  MODE_LABELS,
  ce,
  type MetaqaModeStat,
  type MetaqaRow,
  type Mode,
} from "@/data/contextEngine";

/**
 * MetaQA — the external-gold validity arm. Questions + gold come from MetaQA's
 * held-out test set (not our graph), so "graph wins" can't be circular. A
 * hop-toggle table of mean F1 (with bootstrap 95% CIs) per model × retrieval
 * mode, plus the passive-vs-agentic contrast callouts — the Angle-B result.
 */

const MODES: Mode[] = ["none", "vector", "graph_rag", "graph"];

function shortModel(m: string) {
  return m.replace(/-mlx$/, "").replace(/-local$/, "");
}

function Cell({ stat }: { stat: MetaqaModeStat | null }) {
  if (!stat) return <td className="px-2 py-2 text-center text-muted-foreground">—</td>;
  return (
    <td className="px-2 py-2 align-middle">
      <div className="font-mono text-sm tabular-nums text-foreground">
        {stat.f1.toFixed(2)}
      </div>
      <div className="font-mono text-[10px] tabular-nums text-muted-foreground">
        [{stat.lo.toFixed(2)}–{stat.hi.toFixed(2)}]
      </div>
    </td>
  );
}

function Bar({ stat, color }: { stat: MetaqaModeStat | null; color: string }) {
  const f = stat?.f1 ?? 0;
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-border/60">
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ width: `${Math.min(f, 1) * 100}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function MetaqaCrossover() {
  const mq = ce.metaqa;
  const [hop, setHop] = useState<"2" | "3" | "pooled">("pooled");
  if (!mq) return null;

  const rows: MetaqaRow[] = [...mq.byHop[hop]].sort((a, b) => a.params_b - b.params_b);

  return (
    <div className="glass-panel p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-border bg-background/50 p-0.5">
          {(["2", "3", "pooled"] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHop(h)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                hop === h
                  ? "bg-accent text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {h === "pooled" ? "2+3 hop" : `${h}-hop`}
            </button>
          ))}
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          external gold · {mq.meta.nQuestions} q · 95% CI (paired bootstrap)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-2 font-semibold">Model</th>
              <th className="px-2 py-2 text-right font-semibold">Size</th>
              {MODES.map((m) => (
                <th key={m} className="px-2 py-2 font-semibold" style={{ color: MODE_COLORS[m] }}>
                  {MODE_LABELS[m]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((r) => (
              <tr key={r.model} className="group">
                <td className="px-2 py-2">
                  <span className="text-sm text-foreground">{shortModel(r.model)}</span>
                  {r.control && (
                    <span className="ml-1.5 rounded bg-border/60 px-1 py-0.5 text-[9px] uppercase text-muted-foreground">
                      control
                    </span>
                  )}
                  <div className="mt-1 w-28">
                    <Bar stat={r.graph_rag} color={MODE_COLORS.graph_rag} />
                  </div>
                </td>
                <td className="px-2 py-2 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {r.params_b}B
                </td>
                {MODES.map((m) => (
                  <Cell key={m} stat={r[m]} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-5 text-muted">
        {mq.meta.note}
      </p>
    </div>
  );
}

/**
 * Compact callouts: per model, the passive-context arm vs the two baselines —
 * Graph context − Vector RAG, and Graph context − Agentic graph (the crossover).
 * A starred (significant) positive graph_rag−graph is the headline: small/
 * quantized models do better READING a subgraph than DRIVING tools.
 */
export function MetaqaContrasts() {
  const mq = ce.metaqa;
  if (!mq) return null;
  const grVsAgentic = mq.contrasts.filter((c) => c.pair === "graph_rag-graph");
  const grVsVector = mq.contrasts.filter((c) => c.pair === "graph_rag-vector");

  const sig = (xs: typeof grVsAgentic) => xs.filter((c) => c.sig && c.delta > 0).length;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="glass-panel p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Graph context vs. Vector RAG
        </div>
        <div className="mt-1 text-2xl font-semibold text-foreground">
          {sig(grVsVector)}/{grVsVector.length}
        </div>
        <p className="mt-1 text-xs text-muted">
          models where passive graph context significantly beats a reranked vector
          baseline (paired bootstrap, CI excludes 0).
        </p>
      </div>
      <div className="glass-panel p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Passive context vs. Agentic tools
        </div>
        <div className="mt-1 text-2xl font-semibold text-foreground">
          {sig(grVsAgentic)}/{grVsAgentic.length}
        </div>
        <p className="mt-1 text-xs text-muted">
          models that do significantly better READING a pre-retrieved subgraph than
          DRIVING graph tools — the on-device crossover.
        </p>
      </div>
    </div>
  );
}
