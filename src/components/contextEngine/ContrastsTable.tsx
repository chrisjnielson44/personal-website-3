"use client";

import { useState } from "react";
import { ce, shortModel, type MetaqaContrast } from "@/data/contextEngine";

/**
 * Per model × contrast-pair: paired delta with bootstrap 95% CI, paired effect
 * size (d_z), and the Holm–Bonferroni-corrected significance marker. The full
 * statistical backbone behind every claim on the page.
 */

const PAIRS: { pair: string; label: string }[] = [
  { pair: "graph_rag-vector", label: "graph_rag − vector" },
  { pair: "graph_rag-vector_matched", label: "graph_rag − vector_matched" },
  { pair: "graph_rag-triple_rag", label: "graph_rag − triple_rag" },
  { pair: "graph_rag-graph_rag_blind", label: "graph_rag − graph_rag_blind" },
  { pair: "graph_rag-graph", label: "graph_rag − graph" },
  { pair: "graph-vector", label: "graph − vector" },
  { pair: "oracle-graph_rag", label: "oracle − graph_rag" },
];

function sigMark(c: MetaqaContrast) {
  if (c.sig) return { mark: "✓", title: "Holm-corrected significant", cls: "text-[var(--cat-projects)]" };
  if (c.sigRaw)
    return { mark: "·", title: "significant before correction only", cls: "text-amber-500" };
  return { mark: "—", title: "not significant", cls: "text-muted-foreground" };
}

export function ContrastsTable() {
  const mq = ce.metaqa;
  const [pair, setPair] = useState(PAIRS[0].pair);
  if (!mq) return null;

  const rows = mq.contrasts
    .filter((c) => c.pair === pair)
    .sort((a, b) => b.delta - a.delta);
  const sigN = rows.filter((c) => c.sig).length;

  return (
    <div className="glass-panel p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {PAIRS.map((p) => (
            <button
              key={p.pair}
              onClick={() => setPair(p.pair)}
              className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors ${
                pair === p.pair
                  ? "bg-accent text-white"
                  : "border border-border bg-background/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 text-xs text-muted">
        <strong className="text-foreground">{sigN}/{rows.length}</strong> models Holm-significant for{" "}
        <span className="font-mono">{PAIRS.find((p) => p.pair === pair)?.label}</span>.
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-2 font-semibold">Model</th>
              <th className="px-2 py-2 text-right font-semibold">Δ F1</th>
              <th className="px-2 py-2 text-right font-semibold">95% CI</th>
              <th className="px-2 py-2 text-right font-semibold">d_z</th>
              <th className="px-2 py-2 text-center font-semibold">Holm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((c) => {
              const s = sigMark(c);
              const pos = c.delta >= 0;
              return (
                <tr key={c.model}>
                  <td className="px-2 py-2 text-sm text-foreground">{shortModel(c.model)}</td>
                  <td
                    className="px-2 py-2 text-right font-mono text-sm tabular-nums"
                    style={{ color: pos ? "var(--cat-projects)" : "var(--cat-personal)" }}
                  >
                    {pos ? "+" : ""}
                    {c.delta.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                    [{c.lo.toFixed(2)}, {c.hi.toFixed(2)}]
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-xs tabular-nums text-muted">
                    {c.dz.toFixed(2)}
                  </td>
                  <td className={`px-2 py-2 text-center font-semibold ${s.cls}`} title={s.title}>
                    {s.mark}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Δ is the paired mean F1 difference over the shared question set; CI is a paired bootstrap;
        d_z is the paired Cohen's effect size. <span className="text-[var(--cat-projects)]">✓</span>{" "}
        survives Holm–Bonferroni correction across the pair family;{" "}
        <span className="text-amber-500">·</span> significant only before correction.
      </p>
    </div>
  );
}
