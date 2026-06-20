"use client";

import {
  MODE_COLORS,
  MODE_LABELS,
  MODE_SHORT,
  byMode,
  ce,
  type Mode,
} from "@/data/contextEngine";
import { AnimatedBar, CountUp, SpotlightCard } from "./primitives";

// ── hero stat grid ─────────────────────────────────────────────────────────────
function Stat({
  value,
  label,
  sub,
}: {
  value: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <SpotlightCard className="p-5">
      <div className="font-display text-[2.4rem] font-medium leading-none text-foreground">
        {value}
      </div>
      <div className="mt-2.5 text-sm font-medium text-foreground">{label}</div>
      {sub && <div className="mt-1 text-xs leading-5 text-muted-foreground">{sub}</div>}
    </SpotlightCard>
  );
}

// Scale of the study (neutral facts) — for the opening chapter.
export function SetupStats() {
  const { er, charts, domains } = ce;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Stat value={<CountUp to={er.records} locale />} label="Source records" sub="OFAC SDN · UK OFSI · UN consolidated" />
      <Stat value={<CountUp to={er.entities} locale />} label="Resolved entities" sub={`after entity resolution (F1 ${er.baseline.f1.toFixed(2)})`} />
      <Stat value={<CountUp to={domains?.nDomains ?? 1} />} label="Public domains" sub="sanctions, finance, health, research, ownership" />
      <Stat value={<CountUp to={charts.nModels} />} label="Models swept" sub="3B → 235B, on-device to frontier" />
      <Stat value={<CountUp to={charts.nCells} locale />} label="Graded answers" sub="model × mode × question, oracle-scored" />
      <Stat value={<CountUp to={ce.meta.costUsd} prefix="$" />} label="Total cloud spend" sub="local models cost $0" />
    </div>
  );
}

export function StatGrid() {
  const { er } = ce;
  const none = byMode("none");
  const graphRag = byMode("graph_rag");
  const graph = byMode("graph");
  const vector = byMode("vector");
  const ratio =
    graph && graphRag ? Math.round((graph.tokens_mean ?? 0) / (graphRag.tokens_mean ?? 1)) : 0;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Stat
        value={<CountUp to={er.baseline.f1} decimals={2} />}
        label="Entity-resolution F1"
        sub={`${er.records.toLocaleString()} records → ${er.entities.toLocaleString()} entities`}
      />
      <Stat
        value={<CountUp to={er.multiSource} locale />}
        label="Cross-source entities"
        sub="fused across ≥2 sanctions bodies — links no single list has"
      />
      <Stat
        value={<CountUp to={ce.meta.costUsd} prefix="$" />}
        label="Total cloud spend"
        sub="full model sweep; local models cost $0"
      />
      <Stat
        value={<CountUp to={graphRag?.f1_mean ?? 0} decimals={2} />}
        label="Graph context, mean F1"
        sub={`vs ${vector?.f1_mean?.toFixed(2)} vector · ${none?.f1_mean?.toFixed(2)} closed-book`}
      />
      <Stat
        value={<CountUp to={(none?.hallucination_rate ?? 0) * 100} decimals={0} suffix="%" />}
        label="Closed-book hallucination"
        sub={`falls to ${graphRag ? ((graphRag.hallucination_rate ?? 0) * 100).toFixed(1) : "—"}% with graph context`}
      />
      <Stat
        value={<CountUp to={ratio} suffix="×" />}
        label="Token cost, agentic vs context"
        sub={`${graph?.tokens_mean?.toLocaleString()} vs ${graphRag?.tokens_mean?.toLocaleString()} tokens/query`}
      />
    </div>
  );
}

// ── mode economics: faithfulness + tokens bars ──────────────────────────────────
function pct(x: number) {
  return `${(x * 100).toFixed(1)}%`;
}

function BarRow({
  label,
  color,
  value,
  display,
  max,
  delay,
}: {
  label: string;
  color: string;
  value: number;
  display: string;
  max: number;
  delay: number;
}) {
  const w = Math.max(2, (value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 shrink-0 text-right text-xs text-muted">{label}</div>
      <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-surface/60">
        <AnimatedBar pct={w} color={color} delay={delay} rounded="rounded-md" />
        <span className="absolute inset-y-0 right-2.5 flex items-center font-mono text-[11px] tabular-nums text-foreground">
          {display}
        </span>
      </div>
    </div>
  );
}

// ── §7 economics: built from ce.economics (local, $0, MetaQA-pooled) ─────────────

/** Tokens per query by mode — a lollipop over all nine modes (sorted ascending). */
export function EconomicsTokens() {
  const rows = [...ce.economics.byMode].sort((a, b) => a.tokens - b.tokens);
  const maxTok = Math.max(...rows.map((r) => r.tokens));
  return (
    <SpotlightCard className="p-6">
      <h3 className="text-sm font-semibold text-foreground">Tokens per query by mode</h3>
      <p className="mb-5 mt-1 text-xs leading-5 text-muted-foreground">
        Pooled over the 10 MetaQA models. The token-heavy modes are the <em>k</em>-hop ones —
        the blind subgraph and the agentic loop — while passive graph context, and especially
        the oracle, stay lean.
      </p>
      <div className="space-y-2.5">
        {rows.map((r, i) => (
          <BarRow
            key={r.mode}
            label={MODE_LABELS[r.mode]}
            color={MODE_COLORS[r.mode]}
            value={r.tokens}
            display={r.tokens.toLocaleString()}
            max={maxTok}
            delay={i * 0.06}
          />
        ))}
      </div>
    </SpotlightCard>
  );
}

/** Hallucination by mode — bar over the four graph-oracle-scored retrieval modes. */
export function EconomicsHallucination() {
  const rows = ce.economics.hallucination;
  const maxHall = Math.max(...rows.map((r) => r.hallucination));
  return (
    <SpotlightCard className="p-6">
      <h3 className="text-sm font-semibold text-foreground">Hallucination rate by mode</h3>
      <p className="mb-5 mt-1 text-xs leading-5 text-muted-foreground">
        Share of named answers that resolve to no real graph node, measured on the five
        graph-oracle domains (MetaQA external gold has no faithfulness). Graph context is the
        most faithful retrieval mode.
      </p>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <BarRow
            key={r.mode}
            label={MODE_LABELS[r.mode]}
            color={MODE_COLORS[r.mode]}
            value={r.hallucination}
            display={pct(r.hallucination)}
            max={maxHall}
            delay={i * 0.08}
          />
        ))}
      </div>
    </SpotlightCard>
  );
}

/**
 * Cost vs. accuracy — tokens per query (log x) against mean F1 (y), ONE dot per
 * mode (nine points), local-only. Up-and-to-the-left is better; graph_rag and
 * oracle sit up-left.
 */
const SC_W = 720;
const SC_H = 420;
const SC_M = { top: 24, right: 24, bottom: 50, left: 50 };
const SC_PLOT_W = SC_W - SC_M.left - SC_M.right;
const SC_PLOT_H = SC_H - SC_M.top - SC_M.bottom;

export function EconomicsScatter() {
  const pts = ce.economics.byMode;
  const xs = pts.map((p) => p.tokens);
  const xMin = Math.min(...xs) * 0.85;
  const xMax = Math.max(...xs) * 1.15;

  const xScale = (t: number) =>
    SC_M.left +
    ((Math.log(t) - Math.log(xMin)) / (Math.log(xMax) - Math.log(xMin))) * SC_PLOT_W;
  const yScale = (f: number) => SC_M.top + (1 - f) * SC_PLOT_H;

  const xTicks = [250, 500, 1000, 2000, 5000];
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0];
  // Modes whose labels should sit below-left of the dot to avoid the top edge.
  const labelBelow = new Set<Mode>(["graph_rag", "oracle"]);

  return (
    <figure className="not-prose my-2">
      <div className="glass-panel relative overflow-hidden p-2 sm:p-3">
        <svg
          viewBox={`0 0 ${SC_W} ${SC_H}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Tokens per query versus mean F1, one point per mode, local only."
        >
          <defs>
            <linearGradient id="ce-econ-corner" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={MODE_COLORS.graph_rag} stopOpacity="0.16" />
              <stop offset="55%" stopColor={MODE_COLORS.graph_rag} stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect
            x={SC_M.left}
            y={SC_M.top}
            width={SC_PLOT_W}
            height={SC_PLOT_H}
            fill="url(#ce-econ-corner)"
          />
          {yTicks.map((g) => (
            <g key={g}>
              <line
                x1={SC_M.left}
                x2={SC_W - SC_M.right}
                y1={yScale(g)}
                y2={yScale(g)}
                stroke="var(--color-border)"
                strokeWidth={1}
                opacity={0.5}
              />
              <text
                x={SC_M.left - 10}
                y={yScale(g) + 4}
                textAnchor="end"
                className="fill-[var(--color-muted-foreground)] font-mono text-[11px]"
              >
                {g.toFixed(2)}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text
              key={t}
              x={xScale(t)}
              y={SC_H - SC_M.bottom + 20}
              textAnchor="middle"
              className="fill-[var(--color-muted-foreground)] font-mono text-[11px]"
            >
              {t >= 1000 ? `${(t / 1000).toLocaleString()}k` : t}
            </text>
          ))}
          <text
            x={SC_M.left + SC_PLOT_W / 2}
            y={SC_H - 8}
            textAnchor="middle"
            className="fill-[var(--color-muted)] text-[12px]"
          >
            tokens per query (log scale) — cost →
          </text>
          <text
            transform={`translate(14 ${SC_M.top + SC_PLOT_H / 2}) rotate(-90)`}
            textAnchor="middle"
            className="fill-[var(--color-muted)] text-[12px]"
          >
            mean F1 — accuracy ↑
          </text>
          <text
            x={SC_M.left + 8}
            y={SC_M.top + 16}
            className="fill-[var(--color-muted-foreground)] text-[10px] uppercase tracking-wide"
          >
            ◤ cheaper · more accurate
          </text>

          {pts.map((p) => {
            const px = xScale(p.tokens);
            const py = yScale(p.f1);
            const emph = p.mode === "graph_rag" || p.mode === "oracle";
            const below = labelBelow.has(p.mode);
            return (
              <g key={p.mode}>
                <circle
                  cx={px}
                  cy={py}
                  r={emph ? 7 : 5}
                  fill={MODE_COLORS[p.mode]}
                  stroke={emph ? "var(--color-foreground)" : "none"}
                  strokeWidth={emph ? 1.5 : 0}
                />
                <text
                  x={px}
                  y={below ? py + 16 : py - 10}
                  textAnchor="middle"
                  className="fill-[var(--color-muted)] text-[10px]"
                  style={{ fontWeight: emph ? 600 : 400 }}
                >
                  {MODE_SHORT[p.mode]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}

// ── entity-resolution + the honesty exhibit ─────────────────────────────────────
export function ErPanel() {
  const { er } = ce;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <SpotlightCard className="p-6">
        <h3 className="text-sm font-semibold text-foreground">
          Entity resolution — precision-first
        </h3>
        <p className="mb-5 mt-1 text-xs leading-5 text-muted-foreground">
          A false merge (fusing distinct designated parties) is the dangerous failure in
          sanctions, so the resolver trades a little recall for precision.
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 font-medium">Matcher</th>
              <th className="pb-2 text-right font-medium">P</th>
              <th className="pb-2 text-right font-medium">R</th>
              <th className="pb-2 text-right font-medium">F1</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            <tr className="border-t border-border">
              <td className="py-2 font-sans">
                Fuzzy + rules{" "}
                <span className="text-[10px] uppercase text-accent">winner</span>
              </td>
              <td className="py-2 text-right">{er.baseline.precision.toFixed(2)}</td>
              <td className="py-2 text-right">{er.baseline.recall.toFixed(2)}</td>
              <td className="py-2 text-right font-medium">{er.baseline.f1.toFixed(2)}</td>
            </tr>
            <tr className="border-t border-border text-muted">
              <td className="py-2 font-sans">Learned cross-encoder</td>
              <td className="py-2 text-right">{er.learned.precision.toFixed(2)}</td>
              <td className="py-2 text-right">{er.learned.recall.toFixed(2)}</td>
              <td className="py-2 text-right">{er.learned.f1.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          The fine-tuned matcher <em>lost</em> to the fuzzy baseline and was kept as an
          honest negative result. Guards rejected {er.guards.conflictVeto} DOB-conflict,{" "}
          {er.guards.numberedVeto} numbered-token, and {er.guards.uncorroborated}{" "}
          uncorroborated merges.
        </p>
      </SpotlightCard>

      <SpotlightCard className="p-6">
        <h3 className="text-sm font-semibold text-foreground">
          The residual false merges, documented
        </h3>
        <p className="mb-5 mt-1 text-xs leading-5 text-muted-foreground">
          ~3 known false merges in {er.entities.toLocaleString()} entities. A precision-first
          design accepts a small, <em>characterized</em> long tail — knowing where the
          boundary sits beats claiming zero.
        </p>
        <ul className="space-y-3">
          {er.falseMerges.map((fm) => (
            <li
              key={fm.a}
              className="rounded-lg border border-border/70 bg-background/40 px-3 py-2 text-xs leading-5"
            >
              <span className="font-mono text-foreground">{fm.a}</span>
              <span className="text-muted-foreground"> ⟂ </span>
              <span className="font-mono text-foreground">{fm.b}</span>
              <div className="text-muted-foreground">
                {fm.why} — merged on {fm.trigger}
              </div>
            </li>
          ))}
        </ul>
      </SpotlightCard>
    </div>
  );
}
