/**
 * Typed access to the context-engine benchmark bundle.
 *
 * The JSON is produced by the context-engine repo's web exporter:
 *   - `metaqa`  — the HEADLINE arm. External MetaQA gold (independent of any
 *                 graph we build), 100 questions × 10 lean MLX models × 9 context
 *                 modes, with paired-bootstrap 95% CIs, Holm–Bonferroni-corrected
 *                 contrasts and paired effect sizes (d_z).
 *   - `domains` — cross-domain replication of graph_rag vs. vector across 5
 *                 public-data graphs (graph-oracle scored).
 *   - `charts`  — the LEGACY sanctions sweep (4 modes); kept only for the
 *                 cost/economics panels. Not the headline.
 *   - `er`      — entity-resolution metrics + documented false-merge cases.
 *   - `demo`    — full-fidelity recorded traces for a handful of multi-hop
 *                 questions: one local model running the real engine.
 *
 * Everything here is measured, not synthetic. See the page for caveats.
 */
import bundle from "./contextEngine.json";

// ── the nine context modes ──────────────────────────────────────────────────
export type Mode =
  | "none"
  | "vector"
  | "vector_matched"
  | "graph_rag"
  | "graph"
  | "graph_rag_blind"
  | "triple_rag"
  | "rag_iter"
  | "oracle";

/** The four "legacy" modes the old sanctions sweep (`charts`) still reports. */
export type LegacyMode = "none" | "vector" | "graph_rag" | "graph";

export const MODE_LABELS: Record<Mode, string> = {
  none: "Closed-book",
  vector: "Vector RAG",
  vector_matched: "Vector (budget-matched)",
  graph_rag: "Graph context",
  graph: "Agentic graph",
  graph_rag_blind: "Graph context (blind)",
  triple_rag: "Flat triples",
  rag_iter: "Iterative RAG",
  oracle: "Oracle context",
};

/** Compact labels for tight chart axes / legends. */
export const MODE_SHORT: Record<Mode, string> = {
  none: "Closed-book",
  vector: "Vector",
  vector_matched: "Vector·matched",
  graph_rag: "Graph context",
  graph: "Agentic",
  graph_rag_blind: "Graph·blind",
  triple_rag: "Flat triples",
  rag_iter: "Iter. RAG",
  oracle: "Oracle",
};

export const MODE_BLURB: Record<Mode, string> = {
  none: "No retrieval — the model answers from its own weights. The per-model capacity floor.",
  vector:
    "A strong, tuned text-RAG baseline: a multilingual bge-m3 retriever over per-entity docs, with cross-encoder reranking.",
  vector_matched:
    "The same vector retriever, but given the graph-context token budget — controls for context VOLUME rather than structure.",
  graph_rag:
    "The relevant subgraph, resolved by relation-guided BFS and handed over as passive, structured facts.",
  graph:
    "The model drives typed graph-traversal tools itself, in a loop of up to 8 rounds.",
  graph_rag_blind:
    "The identical graph serializer with relation guidance turned OFF — ablates the relation heuristic.",
  triple_rag:
    "The SAME facts as the graph modes, but flattened to individual triples with no structure — isolates structure from content.",
  rag_iter:
    "Iterative multi-hop RAG (IRCoT / self-ask style): retrieve, reason, emit a follow-up query, retrieve again.",
  oracle:
    "The subgraph restricted to answer-bearing facts — an upper bound on passive context. Gap below it is retrieval; gap at it is reading.",
};

// Brand-ish colors for all nine modes (the original four kept verbatim; the new
// modes are harmonious variants — vector_matched a vector-adjacent amber, the
// structured / upper-bound modes distinct but in the same family).
export const MODE_COLORS: Record<Mode, string> = {
  none: "#94a3b8", // slate (capacity floor)
  vector: "#d8a65a", // amber (the tuned baseline)
  vector_matched: "#c8862f", // deeper amber — vector-adjacent
  graph_rag: "#3a5cc9", // accent blue (the headline)
  graph: "#2f8f63", // green (agentic)
  graph_rag_blind: "#6b8ad8", // lighter blue — the blind ablation of graph_rag
  triple_rag: "#b07d9e", // muted mauve — same facts, no structure
  rag_iter: "#7a9bb8", // dusty blue-grey — iterative text RAG
  oracle: "#7c5cc9", // violet — the upper bound
};

// ── legacy sanctions sweep (`charts`) ────────────────────────────────────────
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
  mode: LegacyMode;
  tokens: number;
  f1: number;
  tier: string;
  backend: string;
  params_b: number;
}

export interface ByMode {
  mode: LegacyMode;
  f1_mean: number | null;
  tokens_mean: number | null;
  faithful_mean: number | null;
  hallucination_rate: number | null;
  n: number;
}

export interface Charts {
  modes: LegacyMode[];
  perModel: PerModel[];
  byMode: ByMode[];
  nCells: number;
  nModels: number;
}

// ── entity resolution ────────────────────────────────────────────────────────
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

// ── recorded worked-example traces (`demo`) ──────────────────────────────────
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

// ── cross-domain replication (`domains`) ─────────────────────────────────────
/** Domains only score the four headline-relevant modes per dataset. */
export type DomainMode = "none" | "vector" | "vector_matched" | "graph_rag";

export interface DomainRow {
  key: string;
  title: string;
  tag: string;
  edge: string;
  byMode: Partial<Record<DomainMode, number | null>>;
  n: Partial<Record<DomainMode, number>>;
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
  nQuestionsPerDomain: Record<string, number>;
  models: string[];
  note: string;
}

// ── MetaQA external-gold arm (the headline) ──────────────────────────────────
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

/** A MetaQA row carries every one of the nine modes (null where not run). */
export type MetaqaRow = {
  model: string;
  params_b: number;
  control: boolean;
  incomplete?: boolean;
} & Record<Mode, MetaqaModeStat | null>;

export interface MetaqaContrast {
  model: string;
  pair: string; // e.g. "graph_rag-vector"
  delta: number;
  lo: number; // bootstrap 95% CI on the paired delta
  hi: number;
  p: number; // Wilcoxon p (uncorrected)
  dz: number; // paired Cohen's d_z
  sig: boolean; // Holm–Bonferroni-corrected significant
  sigRaw: boolean; // significant before correction
}

/** Per-mode mean F1 within a tool-profile bucket (6–9B band). */
export type MetaqaToolBucket = {
  n_models: number;
  models: string[];
  gap_gv: number; // graph − vector
  gap_gr: number; // graph − graph_rag
} & Record<Mode, number>;

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
  toolProfile: { agentic: MetaqaToolBucket; fc: MetaqaToolBucket; none: MetaqaToolBucket };
}

// ── legacy technique ladder (now superseded; kept optional) ──────────────────
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

// ── economics: tokens / latency / F1 / faithfulness by mode (local, $0) ───────
export interface Economics {
  /** Per-mode cost & accuracy, pooled over the 10 MetaQA models (all 9 modes). */
  byMode: { mode: Mode; tokens: number; latency: number; f1: number; n: number }[];
  /**
   * Faithfulness by mode from the 5 graph-oracle domains (answers map to graph
   * nodes). MetaQA external string gold has no faithfulness, so only the four
   * retrieval-relevant modes appear here.
   */
  hallucination: { mode: Mode; faithful: number; hallucination: number; n: number }[];
  note: string;
}

export interface Bundle {
  meta: { dataset: string; sources: string[]; costUsd: number; run?: string; note: string };
  charts: Charts;
  metaqa: MetaqaSection | null;
  techniques: TechniquesSection | null;
  domains: DomainsSection | null;
  economics: Economics;
  er: ErSection;
  demo: { model: DemoModel | null; questions: DemoQuestion[] };
}

export const ce = bundle as unknown as Bundle;

// ── derived selectors (legacy sanctions `charts`) ─────────────────────────────

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
export function frontierMean(mode: LegacyMode): number | null {
  const xs = frontierModels()
    .map((m) => m[mode])
    .filter((v): v is number => v != null);
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export function byMode(mode: LegacyMode): ByMode | undefined {
  return ce.charts.byMode.find((b) => b.mode === mode);
}

/** Points for the cost/accuracy scatter: one per (model, mode) with tokens + F1. */
export function scatterPoints(modes: LegacyMode[] = ["graph_rag", "graph"]): ScatterPoint[] {
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

// ── derived selectors (MetaQA headline) ───────────────────────────────────────

export type Hop = "2" | "3" | "pooled";

function shortModelName(m: string) {
  return m.replace(/-mlx$/, "").replace(/-local$/, "");
}
export { shortModelName as shortModel };

/** Pooled MetaQA rows, ascending by size. */
export function metaqaRows(hop: Hop = "pooled"): MetaqaRow[] {
  if (!ce.metaqa) return [];
  return [...ce.metaqa.byHop[hop]].sort((a, b) => a.params_b - b.params_b);
}

/** Mean F1 across the MetaQA roster for one mode at one hop (nulls skipped). */
export function metaqaMean(mode: Mode, hop: Hop = "pooled"): number | null {
  const xs = metaqaRows(hop)
    .map((r) => r[mode]?.f1)
    .filter((v): v is number => v != null);
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

/** Min / max F1 for one mode across the MetaQA size ladder. */
export function metaqaRange(mode: Mode, hop: Hop = "pooled"): { lo: number; hi: number } | null {
  const xs = metaqaRows(hop)
    .map((r) => r[mode]?.f1)
    .filter((v): v is number => v != null);
  if (!xs.length) return null;
  return { lo: Math.min(...xs), hi: Math.max(...xs) };
}

/** All contrasts for a given pair (e.g. "graph_rag-vector"). */
export function contrastsFor(pair: string): MetaqaContrast[] {
  return ce.metaqa?.contrasts.filter((c) => c.pair === pair) ?? [];
}

/** Count of models where a positive contrast is Holm-significant. */
export function sigCount(pair: string): { sig: number; total: number } {
  const xs = contrastsFor(pair);
  return { sig: xs.filter((c) => c.sig && c.delta > 0).length, total: xs.length };
}

/** Count of models where a contrast is significantly NEGATIVE (e.g. graph−vector). */
export function sigNegCount(pair: string): { sig: number; total: number } {
  const xs = contrastsFor(pair);
  return { sig: xs.filter((c) => c.sig && c.delta < 0).length, total: xs.length };
}

/** Min / max paired Δ over all models for a contrast pair. */
export function contrastDeltaRange(pair: string): { lo: number; hi: number } | null {
  const xs = contrastsFor(pair).map((c) => c.delta);
  if (!xs.length) return null;
  return { lo: Math.min(...xs), hi: Math.max(...xs) };
}

/** d_z range over the significant contrasts for a pair (absolute values). */
export function dzRange(pair: string, sigOnly = true): { lo: number; hi: number } | null {
  const xs = contrastsFor(pair)
    .filter((c) => (sigOnly ? c.sig : true))
    .map((c) => Math.abs(c.dz));
  if (!xs.length) return null;
  return { lo: Math.min(...xs), hi: Math.max(...xs) };
}
