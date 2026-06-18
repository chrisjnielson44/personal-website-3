/**
 * Typed access to the context-engine benchmark bundle.
 *
 * The JSON is produced by `scripts/export_web.py` in the context-engine repo:
 *   - `charts`  — per-(model, mode) mean F1 / tokens / faithfulness aggregated
 *                 from the de-errored sweep (results/bench/clean.jsonl).
 *   - `er`      — entity-resolution metrics + the documented false-merge cases.
 *   - `demo`    — full-fidelity recorded traces for a handful of multi-hop
 *                 questions: one local model running the real engine, scored by
 *                 the same graph-oracle grader used in the benchmark.
 *
 * Everything here is measured, not synthetic. See the page for caveats.
 */
import bundle from "./contextEngine.json";

export type Mode = "none" | "vector" | "graph_rag" | "graph";

export const MODE_LABELS: Record<Mode, string> = {
  none: "Closed-book",
  vector: "Vector RAG",
  graph_rag: "Graph context",
  graph: "Agentic graph",
};

export const MODE_BLURB: Record<Mode, string> = {
  none: "No retrieval — the model answers from its own weights.",
  vector: "Top-k entity docs by embedding similarity, stuffed into the prompt.",
  graph_rag: "The relevant subgraph, resolved and handed over as passive facts.",
  graph: "The model drives graph-traversal tools itself, in a loop.",
};

// Brand-ish colors for the four modes (kept in sync with the chart palette).
export const MODE_COLORS: Record<Mode, string> = {
  none: "#94a3b8",
  vector: "#d8a65a",
  graph_rag: "#3a5cc9",
  graph: "#2f8f63",
};

export interface PerModel {
  model: string;
  params_b: number;
  tier: string;
  family: string;
  backend: string;
  role: string;
  n: number;
  none: number | null;
  vector: number | null;
  graph_rag: number | null;
  graph: number | null;
  none_n: number;
  vector_n: number;
  graph_rag_n: number;
  graph_n: number;
  none_tokens: number | null;
  vector_tokens: number | null;
  graph_rag_tokens: number | null;
  graph_tokens: number | null;
}

export interface ScatterPoint {
  model: string;
  mode: Mode;
  tokens: number;
  f1: number;
  tier: string;
  backend: string;
  params_b: number;
}

export interface ByMode {
  mode: Mode;
  f1_mean: number | null;
  tokens_mean: number | null;
  faithful_mean: number | null;
  hallucination_rate: number | null;
  n: number;
}

export interface Charts {
  modes: Mode[];
  perModel: PerModel[];
  byMode: ByMode[];
  nCells: number;
  nModels: number;
}

export interface ErSection {
  baseline: { precision: number; recall: number; f1: number };
  learned: { precision: number; recall: number; f1: number };
  winner: string;
  threshold: number;
  records: number;
  entities: number;
  multiSource: number;
  maxCluster: number;
  seconds: number;
  guards: { conflictVeto: number; numberedVeto: number; uncorroborated: number };
  falseMerges: { a: string; b: string; why: string; trigger: string }[];
}

export interface Citation {
  entityId: string;
  name: string;
  type: string;
  sources: string[];
}

export interface ModeBlockBase {
  answerText: string;
  predicted: string[];
  f1: number;
  precision: number;
  recall: number;
  faithful: number | null;
  promptTokens: number;
  completionTokens: number;
  latencyS: number;
  nToolCalls: number;
}

export interface VectorBlock extends ModeBlockBase {
  retrieved: { name: string; doc: string; score: number }[];
}

export interface GraphRagBlock extends ModeBlockBase {
  factsHeader: string;
  facts: string[];
  factsTotal: number;
}

export interface ToolResult {
  kind: string;
  rows: Record<string, unknown>[];
  total?: number;
  text?: string;
}

export interface TraceStep {
  round: number;
  tool: string;
  args: Record<string, unknown>;
  result: ToolResult;
}

export interface GraphBlock extends ModeBlockBase {
  steps: TraceStep[];
  citations: Citation[];
}

export interface DemoQuestion {
  qid: string;
  question: string;
  hops: number;
  template: string;
  answerType: string;
  gold: string[];
  goldCitations: Citation[];
  modes: { vector: VectorBlock; graph_rag: GraphRagBlock; graph: GraphBlock };
}

export interface DemoModel {
  name: string;
  modelId: string;
  backend: string;
  paramsB: number;
  tier: string;
}

export interface DomainRow {
  key: string;
  title: string;
  tag: string;
  edge: string;
  byMode: Record<Mode, number | null>;
  n: Record<Mode, number>;
}

export interface BySizeRow {
  model: string;
  label: string;
  params_b: number;
  control: boolean;
  none: number | null;
  vector: number | null;
  graph_rag: number | null;
}

export interface DomainsSection {
  datasets: DomainRow[];
  bySize: BySizeRow[];
  nDomains: number;
  nQuestionsPerDomain: number;
  models: string[];
  note: string;
}

// ── MetaQA external-gold arm (the validity headline) ─────────────────────────
export interface MetaqaModeStat {
  f1: number;
  lo: number; // bootstrap 95% CI lower
  hi: number; // bootstrap 95% CI upper
  hits1: number;
  tokens: number;
  latency: number;
  toolCalls: number;
  n: number;
}

export interface MetaqaRow {
  model: string;
  params_b: number;
  control: boolean;
  none: MetaqaModeStat | null;
  vector: MetaqaModeStat | null;
  graph_rag: MetaqaModeStat | null;
  graph: MetaqaModeStat | null;
}

export interface MetaqaContrast {
  model: string;
  pair: string; // e.g. "graph_rag-vector"
  delta: number;
  lo: number;
  hi: number;
  sig: boolean;
}

export interface MetaqaSection {
  meta: {
    gold: string;
    nQuestions: number;
    nCells: number;
    models: string[];
    note: string;
  };
  byHop: { "2": MetaqaRow[]; "3": MetaqaRow[]; pooled: MetaqaRow[] };
  contrasts: MetaqaContrast[];
}

export interface TechniqueRung {
  mode: string;
  label: string;
  f1: number;
  n: number;
}

export interface TechniquesSection {
  ladder: TechniqueRung[];
  models: string[];
  nModels: number;
  note: string;
}

export interface Bundle {
  meta: { dataset: string; sources: string[]; costUsd: number; note: string };
  charts: Charts;
  metaqa: MetaqaSection | null;
  techniques: TechniquesSection | null;
  domains: DomainsSection | null;
  er: ErSection;
  demo: { model: DemoModel | null; questions: DemoQuestion[] };
}

export const ce = bundle as unknown as Bundle;

// ── derived selectors ────────────────────────────────────────────────────────

/** Models with a real size on the axis AND graph_rag coverage (for the figure). */
export function sizedModels(): PerModel[] {
  return ce.charts.perModel
    .filter((m) => m.params_b > 0 && m.graph_rag != null)
    .sort((a, b) => a.params_b - b.params_b);
}

/** The clean single-family controlled sweep (Qwen3), ascending by size. */
export function qwenSweep(): PerModel[] {
  return sizedModels()
    .filter((m) => /^qwen3-\d/.test(m.model))
    .sort((a, b) => a.params_b - b.params_b);
}

export function frontierModels(): PerModel[] {
  return ce.charts.perModel.filter((m) => m.tier === "frontier" && m.graph_rag != null);
}

export function localModels(): PerModel[] {
  return ce.charts.perModel.filter((m) => m.backend === "ollama");
}

/** Mean over frontier models for one mode (the "ceiling" reference). */
export function frontierMean(mode: Mode): number | null {
  const xs = frontierModels()
    .map((m) => m[mode])
    .filter((v): v is number => v != null);
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export function byMode(mode: Mode): ByMode | undefined {
  return ce.charts.byMode.find((b) => b.mode === mode);
}

/** Points for the cost/accuracy scatter: one per (model, mode) with tokens + F1. */
export function scatterPoints(modes: Mode[] = ["graph_rag", "graph"]): ScatterPoint[] {
  const pts: ScatterPoint[] = [];
  for (const m of ce.charts.perModel) {
    for (const mode of modes) {
      const f1 = m[mode];
      const tokens = m[`${mode}_tokens` as const];
      if (f1 != null && tokens != null && tokens > 0) {
        pts.push({
          model: m.model,
          mode,
          tokens,
          f1,
          tier: m.tier,
          backend: m.backend,
          params_b: m.params_b,
        });
      }
    }
  }
  return pts;
}

/** Leaderboard: every model, sorted by agentic-graph F1 desc (nulls last). */
export function leaderboard(): PerModel[] {
  return [...ce.charts.perModel]
    .filter((m) => m.graph != null || m.graph_rag != null)
    .sort((a, b) => (b.graph ?? -1) - (a.graph ?? -1));
}
