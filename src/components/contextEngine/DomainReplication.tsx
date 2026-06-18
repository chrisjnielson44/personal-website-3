"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { motion } from "@/components/Motion";
import { MODE_COLORS, ce, type DomainRow } from "@/data/contextEngine";

/**
 * Cross-domain replication as a dumbbell chart: per domain, the jump from vector
 * RAG (amber) to graph context (blue). The graph-context dot is always to the
 * right — the lift isn't a sanctions artifact, it holds across five domains. The
 * connecting bar grows on scroll-into-view.
 */

const AXIS_MAX = 0.8;
const pos = (f: number) => (Math.min(f, AXIS_MAX) / AXIS_MAX) * 100;

function Row({ d, i, show }: { d: DomainRow; i: number; show: boolean }) {
  const none = d.byMode.none ?? 0;
  const vec = d.byMode.vector ?? 0;
  const gr = d.byMode.graph_rag ?? 0;
  const lift = gr - vec;
  return (
    <div className="grid grid-cols-[10rem_1fr] items-center gap-4 py-3.5 sm:grid-cols-[13rem_1fr]">
      <div>
        <div className="text-sm font-medium text-foreground">{d.title}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>{d.tag}</span>
          <span className="font-mono text-accent">{d.edge}</span>
        </div>
      </div>
      <div className="relative h-7">
        {/* baseline track */}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        {/* none tick */}
        <div
          className="absolute top-1/2 h-2 w-px -translate-y-1/2"
          style={{ left: `${pos(none)}%`, backgroundColor: MODE_COLORS.none }}
          title={`closed-book ${none.toFixed(2)}`}
        />
        {/* connecting lift bar (vector → graph_rag), grows on view */}
        <motion.div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full"
          style={{
            left: `${pos(vec)}%`,
            width: `${pos(gr) - pos(vec)}%`,
            transformOrigin: "left",
            background: `linear-gradient(to right, ${MODE_COLORS.vector}, ${MODE_COLORS.graph_rag})`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: show ? 1 : 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: show ? 0.1 + i * 0.08 : 0 }}
        />
        {/* vector dot */}
        <motion.div
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[var(--color-card)]"
          style={{ left: `${pos(vec)}%`, backgroundColor: MODE_COLORS.vector }}
          initial={{ scale: 0 }}
          animate={{ scale: show ? 1 : 0 }}
          transition={{ duration: 0.3, delay: show ? 0.1 + i * 0.08 : 0 }}
          title={`vector ${vec.toFixed(2)}`}
        />
        {/* graph_rag dot */}
        <motion.div
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[var(--color-card)]"
          style={{ left: `${pos(gr)}%`, backgroundColor: MODE_COLORS.graph_rag }}
          initial={{ scale: 0 }}
          animate={{ scale: show ? 1 : 0 }}
          transition={{ duration: 0.3, delay: show ? 0.45 + i * 0.08 : 0 }}
          title={`graph context ${gr.toFixed(2)}`}
        />
        {/* lift label */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 pl-2 font-mono text-[11px] tabular-nums text-[var(--cat-projects)]"
          style={{ left: `${pos(gr)}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 0.4, delay: show ? 0.8 + i * 0.08 : 0 }}
        >
          +{lift.toFixed(2)}
        </motion.div>
      </div>
    </div>
  );
}

export function DomainReplication() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduced = useReducedMotion();
  const show = inView || reduced === true;
  const domains = ce.domains;
  if (!domains) return null;

  return (
    <div ref={ref} className="glass-panel p-6">
      {/* legend + axis */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: MODE_COLORS.vector }} />
          Vector RAG
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: MODE_COLORS.graph_rag }} />
          Graph context
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2.5 w-px" style={{ backgroundColor: MODE_COLORS.none }} />
          closed-book
        </span>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          mean F1 · {domains.nQuestionsPerDomain} q/domain · local models · $0
        </span>
      </div>

      <div className="divide-y divide-border/50">
        {domains.datasets.map((d, i) => (
          <Row key={d.key} d={d} i={i} show={show} />
        ))}
      </div>

      {/* x-axis ticks */}
      <div className="mt-2 grid grid-cols-[10rem_1fr] gap-4 sm:grid-cols-[13rem_1fr]">
        <div />
        <div className="relative h-4 text-[10px] text-muted-foreground">
          {[0, 0.2, 0.4, 0.6, 0.8].map((t) => (
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
    </div>
  );
}
