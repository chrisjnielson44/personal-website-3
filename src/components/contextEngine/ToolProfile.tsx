"use client";

import { MODE_COLORS, ce, type MetaqaToolBucket } from "@/data/contextEngine";

/**
 * Tool-profile panel (H3) — does function-call training narrow the passive-vs-
 * agentic gap? Three buckets in the 6–9B band: tool-tuned / agentic models, a
 * function-calling model, and a non-tool-tuned model. For each we show passive
 * graph_rag vs agentic graph and the gap. CLEARLY labelled DIRECTIONAL: the lean
 * roster leaves 3 / 1 / 1 models per bucket, far too few to test the hypothesis.
 */

const BUCKETS: { key: keyof NonNullable<typeof ce.metaqa>["toolProfile"]; label: string; note: string }[] = [
  { key: "agentic", label: "Tool-tuned / agentic", note: "trained for tool use" },
  { key: "fc", label: "Function-calling", note: "FC-capable" },
  { key: "none", label: "Not tool-tuned", note: "no FC training" },
];

const AXIS_MAX = 0.7;
const pos = (f: number) => (Math.min(f, AXIS_MAX) / AXIS_MAX) * 100;

function BucketRow({ b }: { b: MetaqaToolBucket & { label: string; note: string } }) {
  const gr = b.graph_rag;
  const g = b.graph;
  return (
    <div className="py-3.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <span className="text-sm font-medium text-foreground">{b.label}</span>
          <span className="ml-2 text-[11px] text-muted-foreground">{b.note}</span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          n={b.n_models} {b.n_models === 1 ? "model" : "models"}
        </span>
      </div>
      <div className="relative h-7">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        {/* gap bar from agentic → passive */}
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full opacity-70"
          style={{
            left: `${pos(Math.min(gr, g))}%`,
            width: `${Math.abs(pos(gr) - pos(g))}%`,
            background: `linear-gradient(to right, ${MODE_COLORS.graph}, ${MODE_COLORS.graph_rag})`,
          }}
        />
        {/* agentic dot */}
        <div
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[var(--color-card)]"
          style={{ left: `${pos(g)}%`, backgroundColor: MODE_COLORS.graph }}
          title={`agentic graph ${g.toFixed(2)}`}
        />
        {/* passive dot */}
        <div
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[var(--color-card)]"
          style={{ left: `${pos(gr)}%`, backgroundColor: MODE_COLORS.graph_rag }}
          title={`graph context ${gr.toFixed(2)}`}
        />
        {/* gap label */}
        <div
          className="absolute top-1/2 -translate-y-1/2 pl-2 font-mono text-[11px] tabular-nums text-[var(--cat-projects)]"
          style={{ left: `${pos(gr)}%` }}
        >
          +{(gr - g).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export function ToolProfile() {
  const mq = ce.metaqa;
  if (!mq?.toolProfile) return null;
  const rows = BUCKETS.map((b) => ({ ...mq.toolProfile[b.key], label: b.label, note: b.note }));

  return (
    <div className="glass-panel p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-medium text-foreground">
          Does tool-training rescue the agentic arm?
        </div>
        <span className="rounded bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400">
          directional · underpowered
        </span>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: MODE_COLORS.graph }} />
          Agentic graph
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: MODE_COLORS.graph_rag }} />
          Graph context (passive)
        </span>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          mean F1 · 6–9B band
        </span>
      </div>

      <div className="divide-y divide-border/50">
        {rows.map((b) => (
          <BucketRow key={b.label} b={b} />
        ))}
      </div>

      <div className="mt-2 grid grid-cols-[0_1fr] gap-0">
        <div />
        <div className="relative h-4 text-[10px] text-muted-foreground">
          {[0, 0.2, 0.4, 0.6].map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2 font-mono"
              style={{ left: `${pos(t)}%` }}
            >
              {t.toFixed(1)}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted">
        Passive context beats agentic graph access in <em>every</em> bucket — even the tool-tuned one.
        But the lean 10-model roster leaves only{" "}
        <strong className="text-foreground">3 / 1 / 1</strong> models per bucket, so this is{" "}
        <strong className="text-foreground">directional, not a test</strong> of whether function-call
        training closes the gap. Read it as: tool-tuning did not reverse the ordering at these sizes,
        nothing stronger.
      </p>
    </div>
  );
}
