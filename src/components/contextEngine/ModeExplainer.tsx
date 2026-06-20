"use client";

import {
  Boxes,
  FileQuestion,
  Layers,
  Network,
  Repeat,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";
import { MODE_BLURB, MODE_COLORS, MODE_LABELS, metaqaMean, type Mode } from "@/data/contextEngine";
import { SpotlightCard } from "./primitives";

/**
 * The one independent variable in the whole study: how the model is given
 * context. Nine modes, grouped from no-retrieval → text RAG → structured graph →
 * agentic → oracle, each annotated with its pooled MetaQA mean F1 and a one-line
 * note on exactly what it isolates. The new modes (vector_matched, triple_rag,
 * graph_rag_blind, oracle) are the confound controls.
 */

const ICONS: Record<Mode, React.ComponentType<{ className?: string }>> = {
  none: FileQuestion,
  vector: Boxes,
  vector_matched: Layers,
  rag_iter: Repeat,
  triple_rag: Layers,
  graph_rag: Network,
  graph_rag_blind: Network,
  graph: Workflow,
  oracle: Target,
};

interface Group {
  title: string;
  modes: Mode[];
}

const GROUPS: Group[] = [
  { title: "Baselines", modes: ["none", "vector", "vector_matched", "rag_iter"] },
  { title: "Same facts, varying structure", modes: ["triple_rag", "graph_rag_blind", "graph_rag"] },
  { title: "Agentic & upper bound", modes: ["graph", "oracle"] },
];

function ModeCard({ mode }: { mode: Mode }) {
  const Icon = ICONS[mode] ?? Sparkles;
  const f1 = metaqaMean(mode);
  return (
    <SpotlightCard className="p-5">
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
              {mode}
            </div>
            <div className="text-sm font-semibold" style={{ color: MODE_COLORS[mode] }}>
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
}

export function ModeExplainer() {
  return (
    <div className="space-y-5">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {g.title}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {g.modes.map((mode) => (
              <ModeCard key={mode} mode={mode} />
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs leading-5 text-muted-foreground">
        Mean F1 is pooled across the 10-model MetaQA roster (external gold, 2+3-hop). All
        fact-bearing modes draw from the <em>same</em> underlying triples — only the packaging
        changes.
      </p>
    </div>
  );
}
