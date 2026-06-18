"use client";

import { FileQuestion, Boxes, Network, Workflow } from "lucide-react";
import { MODE_BLURB, MODE_COLORS, MODE_LABELS, byMode, type Mode } from "@/data/contextEngine";
import { SpotlightCard } from "./primitives";

/**
 * Introduces the one independent variable in the whole study: how the model is
 * given context. Four modes, escalating from no retrieval to agentic traversal,
 * each with its measured mean F1 across the sanctions sweep.
 */

const ORDER: Mode[] = ["none", "vector", "graph_rag", "graph"];
const ICONS: Record<Mode, React.ComponentType<{ className?: string }>> = {
  none: FileQuestion,
  vector: Boxes,
  graph_rag: Network,
  graph: Workflow,
};

export function ModeExplainer() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ORDER.map((mode, i) => {
        const Icon = ICONS[mode];
        const f1 = byMode(mode)?.f1_mean;
        return (
          <SpotlightCard key={mode} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex size-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `color-mix(in srgb, ${MODE_COLORS[mode]} 18%, transparent)` }}
                >
                  <Icon className="size-4" />
                </span>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                    mode {i + 1}
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: MODE_COLORS[mode] }}
                  >
                    {MODE_LABELS[mode]}
                  </div>
                </div>
              </div>
              {f1 != null && (
                <div className="text-right">
                  <div className="font-mono text-lg font-medium tabular-nums text-foreground">
                    {f1.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">mean F1</div>
                </div>
              )}
            </div>
            <p className="mt-3 text-xs leading-5 text-muted">{MODE_BLURB[mode]}</p>
          </SpotlightCard>
        );
      })}
    </div>
  );
}
