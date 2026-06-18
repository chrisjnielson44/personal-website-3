"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Play, RotateCcw, Search, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "@/components/Motion";
import {
  ce,
  type Citation,
  type DemoQuestion,
  type GraphBlock,
  type TraceStep,
  type VectorBlock,
} from "@/data/contextEngine";

// ── tone + small atoms ───────────────────────────────────────────────────────
const GOOD = "var(--cat-projects)";
const WARN = "var(--cat-writing)";
const BAD = "var(--cat-personal)";

function tone(f1: number) {
  if (f1 >= 0.999) return GOOD;
  if (f1 >= 0.5) return WARN;
  return BAD;
}

function F1Badge({ f1 }: { f1: number }) {
  const c = tone(f1);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs tabular-nums"
      style={{ borderColor: c, color: c }}
    >
      {f1 >= 0.999 ? <Check className="size-3" /> : <span>●</span>}
      F1 {f1.toFixed(2)}
    </span>
  );
}

/** A "found X / N" scorecard — the visceral contrast between the two engines. */
function FoundChip({ found, total }: { found: number; total: number }) {
  const c = found >= total && total > 0 ? GOOD : found === 0 ? BAD : WARN;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className="font-mono tabular-nums" style={{ color: c }}>
        {found} / {total}
      </span>
      <span className="text-muted-foreground">answers found</span>
    </span>
  );
}

function SourceBadges({ sources }: { sources: string[] }) {
  const map: Record<string, string> = { ofac: "OFAC", uk_ofsi: "UK OFSI", un: "UN" };
  return (
    <span className="ml-1.5 inline-flex flex-wrap gap-1">
      {sources.map((s) => (
        <span
          key={s}
          className="rounded bg-surface px-1 py-px font-mono text-[9px] uppercase tracking-wide text-muted-foreground"
        >
          {map[s] ?? s}
        </span>
      ))}
    </span>
  );
}

function tokens(b: { promptTokens: number; completionTokens: number }) {
  return (b.promptTokens + b.completionTokens).toLocaleString();
}

function fmtArgs(args: Record<string, unknown>) {
  return Object.entries(args)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(", ");
}

function goldCount(q: DemoQuestion) {
  return q.answerType === "scalar" || q.answerType === "boolean"
    ? 1
    : Math.max(q.gold.length, 1);
}

// ── tool-step result chips ──────────────────────────────────────────────────────
function StepResult({ result }: { result: TraceStep["result"] }) {
  if (result.kind === "error")
    return <div className="text-xs text-[var(--cat-personal)]">error: {result.text}</div>;

  if (result.kind === "shared") {
    const r = result.rows[0] as { programs?: string[]; countries?: string[] };
    const bits = [
      ...(r.programs ?? []).map((p) => `program: ${p}`),
      ...(r.countries ?? []).map((c) => `country: ${c}`),
    ];
    return (
      <div className="flex flex-wrap gap-1.5">
        {bits.length ? (
          bits.map((b) => (
            <span key={b} className="rounded bg-surface px-1.5 py-0.5 text-[11px] text-muted">
              {b}
            </span>
          ))
        ) : (
          <span className="text-[11px] text-muted-foreground">no shared attributes</span>
        )}
      </div>
    );
  }

  const rows = result.rows as {
    name?: string;
    entityId?: string;
    relType?: string;
    value?: string;
  }[];
  const total = result.total ?? rows.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {rows.map((r, i) => (
        <span
          key={r.entityId ?? r.name ?? i}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[11px]"
        >
          {r.relType && (
            <span className="font-mono text-[9px] uppercase text-accent">{r.relType}</span>
          )}
          <span className="text-foreground">{r.name ?? r.value ?? r.entityId}</span>
        </span>
      ))}
      {total > rows.length && (
        <span className="self-center px-1 text-[11px] text-muted-foreground">
          +{total - rows.length} more
        </span>
      )}
    </div>
  );
}

// ── column header (shared chrome) ─────────────────────────────────────────────
function ColHead({
  icon,
  title,
  dotColor,
  f1,
  right,
}: {
  icon?: React.ReactNode;
  title: string;
  dotColor?: string;
  f1: number;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon ?? <span className="inline-block size-2 rounded-full" style={{ backgroundColor: dotColor }} />}
        {title}
      </div>
      <div className="flex items-center gap-2">
        {right}
        <F1Badge f1={f1} />
      </div>
    </div>
  );
}

// ── vector column ──────────────────────────────────────────────────────────────
function VectorColumn({ block, total }: { block: VectorBlock; total: number }) {
  const found = Math.round((block.recall ?? 0) * total);
  const maxScore = Math.max(...block.retrieved.map((h) => h.score), 0.01);
  return (
    <div className="glass-panel flex flex-col self-start">
      <ColHead
        icon={<Search className="size-4 text-[var(--cat-writing)]" />}
        title="Vector RAG"
        f1={block.f1}
      />
      <div className="space-y-3 p-4">
        <p className="text-xs text-muted-foreground">
          Pulls the nearest entity records by embedding similarity, then reads the text and
          guesses — no structure, no traversal.
        </p>
        <div className="space-y-1.5">
          {block.retrieved.slice(0, 6).map((h, i) => (
            <div key={i} className="rounded-lg border border-border bg-background/50 px-2.5 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-foreground">{h.name}</span>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {h.score.toFixed(2)}
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(h.score / maxScore) * 100}%`, backgroundColor: WARN }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-3">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Answer
          </div>
          {block.predicted.length ? (
            <div className="flex flex-wrap gap-1.5">
              {block.predicted.map((p) => (
                <span key={p} className="rounded bg-surface px-1.5 py-0.5 text-xs text-foreground">
                  {p}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-xs italic text-muted-foreground">no answer returned</div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <FoundChip found={found} total={total} />
            <span className="font-mono text-[10px] text-muted-foreground">
              {tokens(block)} tokens
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--cat-personal)]">
              <X className="size-3" /> no provenance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── graph column (animated timeline) ──────────────────────────────────────────
function GraphColumn({
  block,
  qid,
  total,
}: {
  block: GraphBlock;
  qid: string;
  total: number;
}) {
  const reduced = useReducedMotion();
  const steps = block.steps;
  const found = Math.round((block.recall ?? 0) * total);
  const [revealed, setRevealed] = useState(reduced ? steps.length : 0);
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.35 });
  const autoStarted = useRef(false);

  useEffect(() => {
    setRevealed(reduced ? steps.length : 0);
    setPlaying(false);
    autoStarted.current = false;
  }, [qid, steps.length, reduced]);

  useEffect(() => {
    if (inView && !autoStarted.current && !reduced && revealed === 0) {
      autoStarted.current = true;
      setPlaying(true);
    }
  }, [inView, reduced, revealed]);

  useEffect(() => {
    if (!playing || revealed >= steps.length) {
      if (revealed >= steps.length) setPlaying(false);
      return;
    }
    const t = setTimeout(() => setRevealed((r) => r + 1), 850);
    return () => clearTimeout(t);
  }, [playing, revealed, steps.length]);

  const done = revealed >= steps.length;
  const started = revealed > 0;

  return (
    <div ref={rootRef} className="glass-panel flex flex-col self-start">
      <ColHead
        dotColor={GOOD}
        title="Agentic graph"
        f1={block.f1}
        right={
          started ? (
            <button
              onClick={() => {
                setRevealed(0);
                setPlaying(false);
                autoStarted.current = true;
              }}
              className="rounded-full border border-border p-1.5 text-muted transition-colors hover:text-accent"
              aria-label="Replay traversal"
            >
              <RotateCcw className="size-3" />
            </button>
          ) : null
        }
      />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Drives the graph's tools itself — resolve, then walk the edges.
          </p>
          {!done && (
            <button
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <Play className="size-3" />
              {started ? "Resume" : "Run"}
            </button>
          )}
        </div>

        {/* traversal timeline */}
        <ol className="relative space-y-2.5 pl-7">
          <span
            aria-hidden
            className="absolute bottom-2 left-[10px] top-2 w-px bg-border"
          />
          <AnimatePresence initial={false}>
            {steps.slice(0, revealed).map((s, i) => (
              <motion.li
                key={i}
                className="relative"
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <span
                  className="absolute -left-[1.55rem] top-1.5 size-3 rounded-full ring-4 ring-[var(--color-card)]"
                  style={{ backgroundColor: GOOD }}
                />
                <div className="rounded-lg border border-border bg-background/50 p-2.5">
                  <div className="mb-1.5 flex items-center gap-2 font-mono text-[11px]">
                    <span className="rounded bg-accent/10 px-1.5 py-0.5 text-accent">{s.tool}</span>
                    <span className="truncate text-muted-foreground">{fmtArgs(s.args)}</span>
                  </div>
                  <StepResult result={s.result} />
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>

        {!started && (
          <div className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            {steps.length} tool calls recorded — press <span className="text-foreground">Run</span>.
          </div>
        )}

        {/* cited answer */}
        {done && (
          <motion.div
            className="border-t border-border pt-3"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Sparkles className="size-3 text-[var(--cat-projects)]" />
              Answer · cited
            </div>
            <div className="space-y-1">
              {(block.citations.length
                ? block.citations
                : block.predicted.map(
                    (p) => ({ entityId: p, name: p, type: "", sources: [] } as Citation),
                  )
              ).map((c) => (
                <div key={c.entityId} className="text-xs">
                  <Check className="mr-1 inline size-3 text-[var(--cat-projects)]" />
                  <span className="text-foreground">{c.name}</span>
                  {c.sources.length > 0 && <SourceBadges sources={c.sources} />}
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
              <FoundChip found={found} total={total} />
              <span className="font-mono text-[10px] text-muted-foreground">
                {tokens(block)} tokens
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--cat-projects)]">
                <Check className="size-3" /> provenance
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── the demo shell ────────────────────────────────────────────────────────────
export function TraceDemo() {
  const questions = ce.demo.questions;
  const model = ce.demo.model;
  const [active, setActive] = useState(0);
  const q: DemoQuestion | undefined = questions[active];
  const total = useMemo(() => (q ? goldCount(q) : 0), [q]);

  if (!q || !model) return null;

  return (
    <div className="not-prose">
      {/* question selector */}
      <div className="mb-4 flex flex-wrap gap-2">
        {questions.map((qq, i) => (
          <button
            key={qq.qid}
            onClick={() => setActive(i)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              i === active
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {qq.hops}-hop · {qq.template.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* the question */}
      <div className="glass-panel mb-4 px-4 py-3.5">
        <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>{q.hops}-hop question</span>
          <span>·</span>
          <span>
            answered live by <span className="text-foreground">{model.name}</span>
            {model.backend === "ollama" && " (on-device)"}
          </span>
          <span>·</span>
          <span>
            target: <span className="text-foreground">{total}</span>{" "}
            {total === 1 ? "answer" : "answers"}
          </span>
        </div>
        <p className="text-sm leading-6 text-foreground">{q.question}</p>
      </div>

      {/* the two engines — cards size to their own content (no forced stretch) */}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <VectorColumn block={q.modes.vector} total={total} />
        <GraphColumn block={q.modes.graph} qid={q.qid} total={total} />
      </div>

      {/* verdict */}
      <div className="glass-panel mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
        <span className="text-muted">
          Same question, same model. Vector RAG{" "}
          <span className="font-mono" style={{ color: tone(q.modes.vector.f1) }}>
            F1 {q.modes.vector.f1.toFixed(2)}
          </span>
          , uncited.
        </span>
        <ArrowRight className="size-4 text-muted-foreground" />
        <span className="text-foreground">
          Graph traversal{" "}
          <span className="font-mono" style={{ color: tone(q.modes.graph.f1) }}>
            F1 {q.modes.graph.f1.toFixed(2)}
          </span>
          , every claim cited to a source list.
        </span>
      </div>
    </div>
  );
}
