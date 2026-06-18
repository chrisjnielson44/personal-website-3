"use client";

import { ce } from "@/data/contextEngine";

/**
 * The context-technique ladder: pooled mean F1 (MetaQA external gold) for each
 * way of delivering context, ordered by increasing structure — closed-book →
 * iterative RAG → vector → flat triples → blind graph → agentic → guided graph →
 * oracle upper bound. Renders nothing until the techniques sweep has populated
 * `ce.techniques` (so the page builds before the data lands).
 */

// Highlight the structured-graph rungs and the oracle bound.
const ACCENT: Record<string, string> = {
  graph_rag: "#3a5cc9",
  oracle: "#7c5cc9",
  graph: "#2f8f63",
};

export function MetaqaTechniques() {
  const t = ce.techniques;
  if (!t || !t.ladder?.length) return null;
  const max = Math.max(...t.ladder.map((r) => r.f1), 0.0001);

  return (
    <div className="glass-panel p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-foreground">
          Context-technique ladder
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          mean F1 · external gold · {t.nModels} models
        </span>
      </div>

      <div className="space-y-2.5">
        {t.ladder.map((r) => {
          const color = ACCENT[r.mode] ?? "#94a3b8";
          return (
            <div key={r.mode} className="grid grid-cols-[11rem_1fr_3rem] items-center gap-3">
              <div className="text-xs text-muted-foreground">{r.label}</div>
              <div className="relative h-4 w-full overflow-hidden rounded bg-border/50">
                <div
                  className="absolute inset-y-0 left-0 rounded"
                  style={{ width: `${(r.f1 / max) * 100}%`, backgroundColor: color }}
                />
              </div>
              <div className="text-right font-mono text-xs tabular-nums text-foreground">
                {r.f1.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-5 text-muted">{t.note}</p>
    </div>
  );
}
