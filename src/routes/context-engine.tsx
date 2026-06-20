import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, GitFork, Lock } from "lucide-react";
import { Container } from "@/components/Container";
import { FadeInView, ReadingProgress } from "@/components/Motion";
import { DomainReplication } from "@/components/contextEngine/DomainReplication";
import {
  MetaqaCrossover,
  MetaqaContrasts,
  MetaqaTable,
} from "@/components/contextEngine/MetaqaCrossover";
import { ConfoundControl } from "@/components/contextEngine/ConfoundControl";
import { ToolProfile } from "@/components/contextEngine/ToolProfile";
import { ContrastsTable } from "@/components/contextEngine/ContrastsTable";
import { ModeExplainer } from "@/components/contextEngine/ModeExplainer";
import {
  ErPanel,
  EconomicsTokens,
  EconomicsHallucination,
  EconomicsScatter,
} from "@/components/contextEngine/BenchPanels";
import { TraceDemo } from "@/components/contextEngine/TraceDemo";
import { SpotlightCard } from "@/components/contextEngine/primitives";
import {
  Abstract,
  Caption,
  Contributions,
  MethodNote,
  Observation,
  P,
  References,
  Section,
  TableOfContents,
  type TocItem,
} from "@/components/contextEngine/academic";
import {
  ce,
  contrastDeltaRange,
  contrastsFor,
  dzRange,
  metaqaRange,
  metaqaRows,
  sigCount,
  sigNegCount,
} from "@/data/contextEngine";

export const Route = createFileRoute("/context-engine")({
  component: ContextEnginePage,
  head: () => ({
    meta: [
      {
        title:
          "Passive graph context vs. agentic graph tools for small, local LLMs · Christopher Nielson",
      },
      {
        name: "description",
        content:
          "For small, quantized, on-device LLMs, does it pay to hand the model a pre-retrieved " +
          "subgraph (passive context) or to let it drive graph-traversal tools (agentic)? On " +
          "MetaQA external gold, passive graph context beats both a tuned vector RAG baseline " +
          "and agentic graph access at every size — and runs air-gapped, for $0.",
      },
      {
        property: "og:title",
        content: "Passive graph context vs. agentic graph tools for small, local LLMs",
      },
      {
        property: "og:description",
        content:
          "A controlled, size-swept, on-device study: structured graph context lets a small " +
          "local model read its way past a much larger one — and beats letting it pilot the graph.",
      },
    ],
  }),
});

const TOC: TocItem[] = [
  { id: "intro", num: "1", label: "Introduction" },
  { id: "related", num: "2", label: "Related work" },
  { id: "methods", num: "3", label: "Methods" },
  { id: "results", num: "4", label: "Results" },
  { id: "trace", num: "5", label: "Worked example" },
  { id: "domains", num: "6", label: "Generalization" },
  { id: "economics", num: "7", label: "Cost & faithfulness" },
  { id: "discussion", num: "8", label: "Discussion" },
  { id: "limitations", num: "9", label: "Limitations" },
  { id: "future", num: "10", label: "Future work" },
  { id: "conclusion", num: "11", label: "Conclusion" },
];

function pct(x: number | null | undefined) {
  return `${((x ?? 0) * 100).toFixed(1)}%`;
}

function GraphSchemaCard() {
  const nodes = ["Entity", "Program", "Country", "Address"];
  const edges = ["SANCTIONED_UNDER", "NATIONAL_OF", "LOCATED_AT", "LINKED_TO"];
  return (
    <SpotlightCard className="p-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Node types
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {nodes.map((n) => (
              <span
                key={n}
                className="rounded-md border border-border bg-background/50 px-2.5 py-1 font-mono text-xs text-foreground"
              >
                {n}
              </span>
            ))}
          </div>
          <div className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Edge types
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {edges.map((e) => (
              <span
                key={e}
                className="rounded-md border border-border bg-background/50 px-2.5 py-1 font-mono text-xs text-accent"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-3 text-sm leading-6 text-muted">
          <p>
            The resolved entities load into an embedded{" "}
            <strong className="text-foreground">Kuzu</strong> graph — every node carries its
            provenance, every edge its supporting evidence.
          </p>
          <p>
            <strong className="text-foreground">
              {ce.er.multiSource.toLocaleString()} entities
            </strong>{" "}
            are fused across two or more lists: the cross-source links no single source contains,
            and the reason multi-hop questions become answerable at all.
          </p>
        </div>
      </div>
    </SpotlightCard>
  );
}

function ContextEnginePage() {
  // §7 economics (local, $0; tokens/F1 MetaQA-pooled, faithfulness graph-oracle).
  const econByMode = (m: string) => ce.economics.byMode.find((r) => r.mode === m);
  const econHall = (m: string) => ce.economics.hallucination.find((r) => r.mode === m);
  const econGr = econByMode("graph_rag");
  const econGraph = econByMode("graph");
  const econOracle = econByMode("oracle");
  const econBlind = econByMode("graph_rag_blind");
  const hallNone = econHall("none");
  const hallVec = econHall("vector");
  const hallGr = econHall("graph_rag");

  // MetaQA headline figures (external gold, pooled).
  const grRange = metaqaRange("graph_rag") ?? { lo: 0.41, hi: 0.69 };
  const vecRange = metaqaRange("vector") ?? { lo: 0.06, hi: 0.36 };
  const noneRange = metaqaRange("none") ?? { lo: 0.01, hi: 0.15 };
  const grSpan = grRange.hi - grRange.lo;
  const grVsVec = sigCount("graph_rag-vector");
  const grVsGraph = sigCount("graph_rag-graph");
  const gvDelta = contrastDeltaRange("graph_rag-vector") ?? { lo: 0.15, hi: 0.35 };
  const ggDelta = contrastDeltaRange("graph_rag-graph") ?? { lo: 0.29, hi: 0.49 };
  const grVsTriple = sigCount("graph_rag-triple_rag");
  const grVsVecMatchedN = sigCount("graph_rag-vector_matched").sig;
  const graphVsVec = sigNegCount("graph-vector");
  const oracleVsGr = ce.metaqa ? contrastsFor("oracle-graph_rag") : [];
  const oracleSig = oracleVsGr.filter((c) => c.sig).length;
  // smallest graph_rag vs largest vector — the substitution.
  const mqRows = metaqaRows("pooled");
  const small = mqRows.length ? [...mqRows].sort((a, b) => a.params_b - b.params_b)[0] : null;
  const big = mqRows.length ? [...mqRows].sort((a, b) => b.params_b - a.params_b)[0] : null;
  const smallGr = small?.graph_rag?.f1 ?? 0.52;
  const bigVec = big?.vector?.f1 ?? 0.36;
  const bigParams = big?.params_b ?? 30;

  const deltas = (ce.domains?.datasets ?? []).map((d) => ({
    title: d.title,
    delta: (d.byMode.graph_rag ?? 0) - (d.byMode.vector ?? 0),
  }));
  const dMin = deltas.length ? deltas.reduce((a, b) => (a.delta < b.delta ? a : b)) : null;
  const dMax = deltas.length ? deltas.reduce((a, b) => (a.delta > b.delta ? a : b)) : null;
  const allUp = deltas.every((d) => d.delta > 0);

  return (
    <div className="relative overflow-clip">
      <ReadingProgress />
      <TableOfContents items={TOC} />

      {/* ── masthead ───────────────────────────────────────────────────── */}
      <div className="ce-hero">
        <div className="ce-hero-grid" aria-hidden />
        <div className="ce-hero-glow ce-hero-glow--a" aria-hidden />
        <div className="ce-hero-glow ce-hero-glow--b" aria-hidden />

        <Container className="pb-10 pt-24 sm:pt-28">
          <div className="mx-auto max-w-3xl">
            <FadeInView>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground backdrop-blur">
                <span className="inline-block size-1.5 rounded-full bg-[var(--cat-projects)]" />
                Research paper · knowledge graphs &amp; local models
              </div>
              <h1 className="font-display text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl">
                Passive graph context vs. agentic graph tools for{" "}
                <span className="hero-gradient-text">small, local LLMs</span>
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
                <span className="text-muted">Christopher Nielson</span>
                <span>·</span>
                <span>Independent research</span>
                <span>·</span>
                <span>June 2026</span>
                <span>·</span>
                <span>
                  {ce.metaqa?.meta.models.length ?? 10} models ·{" "}
                  {(ce.domains?.nDomains ?? 5) + 1} domains ·{" "}
                  {(ce.metaqa?.meta.nCells ?? 9000).toLocaleString()} graded answers · $0
                </span>
              </div>
            </FadeInView>

            <FadeInView delay={0.05} className="mt-8">
              <Abstract>
                When a small, locally-deployable LLM fails a multi-hop question, is the deficit{" "}
                <em>capacity</em> (too few parameters) or <em>context</em> (the wrong delivery of
                the facts)? We separate the two by holding the evidence fixed and varying only how
                it is delivered. This is a <strong>pre-registered, fully-local</strong> study: ten
                4-bit MLX models (1.7B–30B), deterministic greedy decoding, and a{" "}
                <em>strong</em> baseline — a multilingual <strong>bge-m3</strong> retriever with
                cross-encoder rerank, served on-device, no Ollama and no network at inference, for
                $0. On <strong>MetaQA</strong> — external multi-hop gold, independent of any graph
                we build — passive graph context (a pre-retrieved subgraph handed to the model)
                beats that tuned vector baseline by{" "}
                <strong>+{gvDelta.lo.toFixed(2)} to +{gvDelta.hi.toFixed(2)} F1</strong> ({grVsVec.sig}/
                {grVsVec.total} models, Holm-corrected), and beats letting the model <em>drive</em>{" "}
                graph-traversal tools by{" "}
                <strong>+{ggDelta.lo.toFixed(2)} to +{ggDelta.hi.toFixed(2)} F1</strong> ({grVsGraph.sig}/
                {grVsGraph.total}). For
                most small models agentic graph access is even worse than vector RAG. The win is
                structure: it survives a budget-matched vector arm and the same facts flattened to
                triples, while an answer-bearing oracle barely tops it ({oracleSig}/
                {oracleVsGr.length} significant) — so the residual error is reading, not retrieval.
                Pooled graph-context F1 rises only ≈{grRange.lo.toFixed(2)}→{grRange.hi.toFixed(2)}{" "}
                across the ladder, so a {small?.params_b ?? 1.7}B model reading a subgraph (
                {smallGr.toFixed(2)}) outscores a {bigParams}B doing vector RAG ({bigVec.toFixed(2)}).
              </Abstract>
            </FadeInView>

            <FadeInView delay={0.1} className="mt-4">
              <Contributions
                items={[
                  {
                    stat: `${grVsVec.sig}/${grVsVec.total}`,
                    text: (
                      <>
                        models where passive graph context significantly beats a{" "}
                        <em>strong</em> bge-m3 vector baseline (Holm-corrected)
                      </>
                    ),
                  },
                  {
                    stat: "passive ≫ agentic",
                    text: (
                      <>
                        the crossover, {grVsGraph.sig}/{grVsGraph.total} models: small/quantized
                        models read a subgraph better than they drive one
                      </>
                    ),
                  },
                  {
                    stat: `${grVsTriple.sig}/${grVsTriple.total}`,
                    text: (
                      <>
                        it's <em>structure</em>: graph context beats the same facts flattened to
                        triples
                      </>
                    ),
                  },
                  {
                    stat: `${small?.params_b ?? 1.7}B ≻ ${bigParams}B`,
                    text: (
                      <>
                        context substitutes for capacity: a {small?.params_b ?? 1.7}B reading a
                        subgraph beats a {bigParams}B doing vector RAG
                      </>
                    ),
                  },
                ]}
              />
            </FadeInView>

            <FadeInView delay={0.15} className="mt-7 flex flex-wrap gap-3">
              <a
                href="#intro"
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                Read the paper
                <ArrowDown className="size-3.5" />
              </a>
              <a
                href="https://github.com/chrisjnielson44"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-sm font-semibold text-foreground backdrop-blur transition-transform hover:-translate-y-0.5"
              >
                Code &amp; data
                <ArrowUpRight className="size-3.5" />
              </a>
            </FadeInView>
          </div>
        </Container>
      </div>

      <Container>
        {/* ── §1 introduction ─────────────────────────────────────────── */}
        <Section num="1" id="intro" title="Introduction" lead="When a small, locally-deployable language model fails a multi-hop investigative question, is it short on parameters or short on the right context?">
          <P>Multi-hop investigative questions—the kind that require chaining several facts about people, organizations, and events into a single answer—remain a stubborn failure mode for small, locally-deployable language models. A 1.7B or 7B model that answers single-fact lookups fluently will often collapse when the answer depends on traversing three or four relations. The reflexive explanation is <strong className="text-foreground">capacity</strong>: the model simply has too few parameters to store and compose the relevant knowledge. But there is a competing explanation that is rarely isolated cleanly—<strong className="text-foreground">context</strong>: the model has the reasoning ability, and what fails is the way the facts are delivered to it. These two hypotheses prescribe opposite remedies. If the bottleneck is capacity, you scale the model; if it is context, you change retrieval and leave the model alone. This work is an attempt to separate them.</P>
          <P>The question is timely because the deployment frontier has moved. There is now real demand for capable language models that run entirely on-device: sovereign deployments that cannot send data across a border, air-gapped environments that have no network at all, and privacy-sensitive workflows where the appeal of investigative QA collapses the moment a frontier API is in the loop. A 4-bit quantized model on a single workstation is a different object than a hosted 400B model, and the techniques that make the latter answer multi-hop questions well do not automatically transfer. If structured context can do the heavy lifting, investigative QA becomes something you can run with no external dependency, no per-query cost, and no data leaving the machine.</P>
          <P>The prior literature is encouraging but does not settle the small-model case, and a full Related Work section follows. The headline GraphRAG-versus-RAG comparisons are run almost entirely on large or frontier models, where abundant parameters may mask or distort the effect of context format. The small and quantized regime—where capacity is genuinely scarce and the context-versus-capacity tension is sharpest—is comparatively under-studied. Two relevant results are partly known: that graph-structured context can beat flat retrieval, and that retrieval can substitute for parameters (the RETRO line of work). Because each is partly established, the novelty here has to be sharper than restating either: it has to characterize how these effects behave as the model shrinks and is quantized to fit on-device.</P>
          <P>We frame the contribution as three research questions. <strong className="text-foreground">(Q1)</strong> Does structured graph context beat a strong text-RAG baseline—reranked and iterative, not a strawman—for multi-hop QA on small local models? <strong className="text-foreground">(Q2)</strong> For small, quantized, on-device models, is it better to hand the model a pre-retrieved subgraph (the <em>passive</em> mode) or to let the model drive graph-traversal tools itself (the <em>agentic</em> mode)—and where, along the size ladder, is the capability crossover between the two? <strong className="text-foreground">(Q3)</strong> How far does graph-structured context substitute for model parameters: how much capacity can the right context format buy back?</P>
          <P>A word on validity, because the easiest way to get a flattering graph result is to ask the graph its own questions. The headline experiments run on <strong className="text-foreground">MetaQA</strong>, an external multi-hop benchmark whose questions and gold answers are independent of the graph we build—removing the graph-as-oracle circularity that an earlier version of this study suffered, where the evaluation was effectively scored against the same structure under test. Because the underlying knowledge base is clean and shared across conditions, the differences we measure reflect the <em>format</em> in which context is delivered, not noise in how facts were extracted. Every mode reads from the same facts; only the packaging changes.</P>
          <P>The setup is deliberately uniform. All models are 4-bit quantized and run on-device on an Apple M3 Ultra via MLX: a Qwen3 size ladder from 1.7B to 30B, a Llama-3.2-3B control, and a cross-family panel (Llama-3.1-8B, Gemma-2-9B, Granite-3.3-8B, Hermes-3-Llama-3.1-8B) to check that effects are not an artifact of one model family. The central pattern is large and consistent. Pooled MetaQA F1 for graph-as-passive-context rises from roughly <strong className="text-foreground">0.52 to 0.69</strong> across the size ladder, against roughly <strong className="text-foreground">0.25 to 0.36</strong> for reranked vector RAG and <strong className="text-foreground">0.05 to 0.12</strong> closed-book. The substitution is stark at the extremes: a 1.7B model reading a subgraph (~0.52) outscores a 30B model equipped with vector RAG (~0.36). The bottleneck, at least here, is more context than capacity.</P>
          <Observation n={1} title="Contributions">We report a <strong className="text-foreground">passive-versus-agentic crossover</strong> for on-device quantized models—the novel core, locating where letting the model drive graph traversal begins to pay off relative to handing it a pre-retrieved subgraph. We show <strong className="text-foreground">graph context decisively beats tuned text RAG at every model size</strong>, not just on average. We <strong className="text-foreground">quantify how far context substitutes for capacity</strong>, sizing the parameter count that the right context format buys back. And we do all of it on <strong className="text-foreground">external gold answers with bootstrap confidence intervals</strong>, at <strong className="text-foreground">$0 cost and fully local</strong>.</Observation>
        </Section>

        {/* ── §2 related work ──────────────────────────────────────────── */}
        <Section num="2" id="related" title="Related work" lead="Our study sits at the intersection of graph-structured retrieval, agentic traversal, and the small-model retrieval-utilization literature, and we are careful to position it against what each already establishes.">

          <h3 className="mt-8 text-base font-semibold text-foreground">GraphRAG versus vector RAG for multi-hop QA</h3>

          <P>
          A large body of recent work argues that organizing a corpus into an explicit entity-relation graph improves multi-hop retrieval over flat dense passages. <strong>Microsoft GraphRAG</strong> extracts an entity graph, runs Leiden community detection, and summarizes communities hierarchically, distinguishing <em>local</em> (entity-centric) from <em>global</em> (community-summary) search; its documented strength is global sensemaking rather than fine-grained factoid QA, and independent evaluations find global search can actually <em>hurt</em> detail-centric questions. <strong>HippoRAG</strong> and <strong>HippoRAG 2</strong> reframe retrieval as Personalized PageRank over an OpenIE-derived graph, reporting sizeable multi-hop gains (HippoRAG 2 adds roughly +7 mean F1 over a strong dense embedder on associative tasks). <strong>LightRAG</strong> adds a dual-level graph index with cheap incremental updates but reports mostly LLM-judged comprehensiveness rather than exact-match multi-hop accuracy. <strong>G-Retriever</strong> casts subgraph selection as a Prize-Collecting Steiner Tree fed to an LLM via a GNN soft prompt, and <strong>StructRAG</strong> chooses an optimal intermediate structure (table/graph/tree) at inference time.
          </P>

          <P>
          Read together, these systems establish that graph structure helps, but they also delimit <em>where</em> it helps. The wins concentrate on comparison, temporal, aggregation, and global-sensemaking queries and on connecting evidence scattered across documents; on plain bridging multi-hop the margins are frequently single-digit F1. The most directly comparable controlled study, <em>RAG vs. GraphRAG: A Systematic Evaluation</em> (arXiv 2502.11371), reports Community-GraphRAG-Local at 63.0 F1 versus 60.0 for vector RAG on HotpotQA (a small win) while showing a large win on temporal queries (~60% versus ~31%). Crucially, that study and nearly all of the systems above are evaluated with <strong>large or frontier models</strong> (GPT-3.5/4, Llama-3.x-70B); it reports a single 8B data point but does not sweep model size and does not quantize. <strong>Our work occupies exactly this gap</strong>: a controlled, size-swept, on-device comparison of retrieval <em>formats</em> across small quantized models, with the graph held fixed so that differences reflect context delivery rather than extraction noise.
          </P>

          <h3 className="mt-8 text-base font-semibold text-foreground">Agentic graph traversal</h3>

          <P>
          A parallel line treats the graph as something the model actively explores rather than passively reads. <strong>Think-on-Graph (ToG)</strong> performs iterative beam search over a KG with the LLM as the agent selecting paths; <strong>ToG-2</strong> alternates KG and document retrieval, reaching SOTA on six of seven knowledge-intensive sets and reporting that it can lift Llama-2-13B toward GPT-3.5-direct level — one of the few smaller-model data points, though with a capable 13B and no matched passive-subgraph control. <strong>Reasoning-on-Graphs (RoG)</strong> plans faithful relation paths before reasoning, <strong>GNN-RAG</strong> offloads multi-hop reasoning to a trained GNN and hands verbalized paths to the LLM, <strong>GraphReader</strong> has an LLM agent explore atomic-fact nodes with a notebook, and <strong>KGP</strong> uses an LLM traversal agent over a passage graph as a "local navigator."
          </P>

          <P>
          These methods demonstrate that agentic traversal works <em>with capable models</em>, and they document its cost: ToG averages roughly <strong>11.6 LLM calls and ~16s per question</strong>, and its quality degrades on weaker models. General small-model tool-use studies corroborate the relevant failure mode — small LLMs struggle at function calling out of the box (arXiv 2410.18890), can be fine-tuned to usable agentic tool-calling but fail unprompted (arXiv 2512.15943), and exhibit omission and execution errors even at 7B (arXiv 2601.16280). What is <strong>not</strong> studied is the passive-versus-agentic contrast as a function of model size in the small/local/quantized regime: no prior work isolates a pre-retrieved subgraph handed to the model against the same model driving graph-traversal tools, holding the graph and question set fixed and sweeping size to locate the <em>capability crossover</em>. That controlled crossover is the primary contribution of this work, and our empirical finding — small quantized models do worse piloting tools than reading a pre-retrieved subgraph — is consistent with, but not pre-empted by, the tool-use literature.
          </P>

          <h3 className="mt-8 text-base font-semibold text-foreground">Retrieval as a substitute for parameters</h3>

          <P>
          The idea that retrieval can stand in for raw parameter count is not new: <strong>RETRO</strong> (DeepMind, arXiv 2112.04426) showed that a 7B model retrieving from ~2T tokens matches GPT-3 / Jurassic-1 despite ~25x fewer parameters, framing semi-parametric models as a more efficient alternative to scaling. We therefore do <em>not</em> claim to discover a context-versus-capacity tradeoff. Instead, we present our iso-accuracy curves as a deliberately narrow, graph-specific, <strong>on-device extension</strong> of RETRO's parameters-versus-retrieval exchange: how many parameters does <em>graph-structured</em> context buy on quantized small models, and does pre-structured graph context survive the small-model failure to use context better than raw passages? RETRO answers neither question — it uses large-scale unstructured retrieval — so this remains a defensible, if secondary, framing.
          </P>

          <h3 className="mt-8 text-base font-semibold text-foreground">Small and quantized models using retrieved context</h3>

          <P>
          Our optimism about adding context must be tempered by recent evidence that small models under-utilize it. <em>Can Small Language Models Use What They Retrieve?</em> (arXiv 2603.11513) sweeps five sizes from 360M to 8B and finds that for ≤7B the bottleneck is context utilization rather than retrieval quality: even with <strong>oracle retrieval</strong> these models fail to extract the correct answer 85-100% of the time on questions they could not already answer, and adding retrieved context <em>destroys</em> 42-100% of answers the model previously knew, with "irrelevant generation" (ignoring the context) the dominant failure. This is a direct threat: below ~7B, more context — graph or otherwise — may not substitute for capacity and may actively hurt. Separately, <em>The Impact of Quantization on RAG</em> (arXiv 2406.10251) finds that INT4 quantization does not materially impair RAG at 7-8B if the FP16 model already does the task, implying capability, not quantization per se, is the dominant variable. We engage this threat directly through an <strong>oracle upper-bound mode</strong> that hands the model gold evidence, isolating utilization ceilings from retrieval error and testing whether graph formatting raises that ceiling relative to vector passages.
          </P>

          <h3 className="mt-8 text-base font-semibold text-foreground">Multi-hop QA benchmarks and evaluation</h3>

          <P>
          We evaluate on established external benchmarks with graph-independent gold answers. <strong>MetaQA</strong> provides a clean, closed movie-domain KG with 1/2/3-hop splits, giving a built-in difficulty axis and isolating context format from extraction noise; <strong>MuSiQue</strong>, composed from single-hop questions to force genuine composition, is the hardest and least shortcut-solvable text multi-hop set and supplies messy-text external validity. We treat <strong>HotpotQA</strong> and <strong>2WikiMultiHopQA</strong> with caution — both are widely criticized as shortcut-solvable and contamination-heavy — and avoid <strong>WebQSP/CWQ</strong> as primary sets because audits place their factual correctness near 52% and 49%.
          </P>

          <P>
          On methodology, we deliberately avoid the graph-as-oracle pitfall of auto-generating questions from the graph and scoring with the same graph, which measures self-consistency rather than QA. <em>Diagnosing and Addressing Pitfalls in KG-RAG Datasets</em> (arXiv 2505.23495) audited 16 KGQA datasets and found roughly <strong>57% average factual correctness</strong>, underscoring that even human-built sets are noisy. We therefore use external gold answers with EM/F1 (SQuAD-normalized) and Hits@1, preferring these to LLM-as-judge scoring, whose documented positional, verbosity, self-preference, and authority biases mean it does not measure truth on clean-answer benchmarks. Following best practice that many RAG/GraphRAG papers omit, we report paired tests and bootstrap confidence intervals over the shared question set, and treat per-question cost (LLM calls, tokens, wall-clock on the actual device) as a first-class metric — without which an agentic-versus-passive comparison is meaningless.
          </P>

          <h3 className="mt-8 text-base font-semibold text-foreground">Strong RAG baselines</h3>

          <P>
          A recurring validity critique of GraphRAG papers is the comparison of a tuned graph system against a deliberately under-tuned vector baseline. To make our claims credible, the vector arm must be a genuinely strong baseline rather than single-shot dense retrieval: iterative and multi-hop schemes such as <strong>IRCoT</strong> and <strong>self-ask</strong>, query reformulation via <strong>HyDE</strong>, and hybrid <strong>BM25 + dense + reranking</strong> with tuned chunking and top-k. Demonstrating that graph or oracle modes help on small quantized models is only meaningful if they beat this hardened vector baseline, not a naive one — so we tune it accordingly before drawing any context-format conclusions.
          </P>

          <References items={[
            <>Edge et al. <em>From Local to Global: A Graph RAG Approach to Query-Focused Summarization (Microsoft GraphRAG)</em>. 2024. arXiv:2404.16130.</>,
            <>Anonymous. <em>RAG vs. GraphRAG: A Systematic Evaluation</em>. 2025. arXiv:2502.11371.</>,
            <>Gutiérrez et al. <em>HippoRAG: Neurobiologically Inspired Long-Term Memory for Large Language Models</em>. NeurIPS, 2024. arXiv:2405.14831.</>,
            <>Gutiérrez et al. <em>HippoRAG 2: From RAG to Memory — Non-Parametric Continual Learning</em>. ICML, 2025.</>,
            <>Guo et al. <em>LightRAG: Simple and Fast Retrieval-Augmented Generation</em>. EMNLP Findings, 2025. arXiv:2410.05779.</>,
            <>He et al. <em>G-Retriever: Retrieval-Augmented Generation for Textual Graph Understanding and Question Answering</em>. NeurIPS, 2024. arXiv:2402.07630.</>,
            <>Li et al. <em>StructRAG: Boosting Knowledge-Intensive Reasoning of LLMs via Inference-Time Hybrid Information Structurization</em>. 2024. arXiv:2410.08815.</>,
            <>Li et al. <em>GraphReader: Building Graph-Based Agent to Enhance Long-Context Abilities of LLMs</em>. EMNLP Findings, 2024. arXiv:2406.14550.</>,
            <>Mavromatis and Karypis. <em>GNN-RAG: Graph Neural Retrieval for Large Language Model Reasoning</em>. 2024. arXiv:2405.20139.</>,
            <>Sun et al. <em>Think-on-Graph: Deep and Responsible Reasoning of LLM on Knowledge Graph</em>. ICLR, 2024. arXiv:2307.07697.</>,
            <>Ma et al. <em>Think-on-Graph 2.0: Deep and Faithful LLM Reasoning with Knowledge-Guided Retrieval Augmented Generation</em>. ICLR, 2025. arXiv:2407.10805.</>,
            <>Luo et al. <em>Reasoning on Graphs: Faithful and Interpretable Large Language Model Reasoning (RoG)</em>. ICLR, 2024. arXiv:2310.01061.</>,
            <>Wang et al. <em>Knowledge Graph Prompting for Multi-Document Question Answering (KGP)</em>. AAAI, 2024. arXiv:2308.11730.</>,
            <>Borgeaud et al. <em>Improving Language Models by Retrieving from Trillions of Tokens (RETRO)</em>. 2021. arXiv:2112.04426.</>,
            <>Anonymous. <em>Can Small Language Models Use What They Retrieve? An Empirical Study of Retrieval Utilization Across Model Scale</em>. 2026. arXiv:2603.11513.</>,
            <>Anonymous. <em>The Impact of Quantization on Retrieval-Augmented Generation: An Analysis of Small LLMs</em>. 2024. arXiv:2406.10251.</>,
            <>Trivedi et al. <em>MuSiQue: Multihop Questions via Single-hop Question Composition</em>. TACL, 2022.</>,
            <>Yang et al. <em>HotpotQA: A Dataset for Diverse, Explainable Multi-hop Question Answering</em>. EMNLP, 2018.</>,
            <>Zhang et al. <em>Variational Reasoning for Question Answering with Knowledge Graph (MetaQA)</em>. AAAI, 2018.</>,
            <>Anonymous. <em>Diagnosing and Addressing Pitfalls in KG-RAG Datasets</em>. NeurIPS, 2025. arXiv:2505.23495.</>,
            <>Trivedi et al. <em>Interleaving Retrieval with Chain-of-Thought Reasoning for Knowledge-Intensive Multi-Step Questions (IRCoT)</em>. ACL, 2023.</>,
            <>Gao et al. <em>Precise Zero-Shot Dense Retrieval without Relevance Labels (HyDE)</em>. ACL, 2023.</>,
          ]} />

        </Section>

        {/* ── §3 methods ───────────────────────────────────────────────── */}
        <Section num="3" id="methods" title="Methods" lead="We hold the evidence constant and vary only how it is delivered to the model, so that any performance difference is attributable to context format rather than retrieval recall or extraction noise.">

          <P>Our central design principle is the isolation of <em>context format</em> as the independent variable. To do this we begin from a clean knowledge base whose facts are already correct, build a graph that contains exactly those facts, and then deliver the same underlying evidence atoms to the model under a series of retrieval modes that differ only in their structure and access pattern. Everything else — the gold answers, the scoring procedure, the quantization level, and the serving stack — is held fixed.</P>

          <h3 className="mt-8 text-base font-semibold text-foreground">3.1 Datasets</h3>

          <P>Our headline benchmark is <strong>MetaQA</strong>, a movie-domain knowledge-base question-answering dataset built on a clean knowledge base of <strong>134,741 triples</strong> spanning <strong>9 relation types</strong> and approximately <strong>43,000 entities</strong>. We use the multi-hop splits — <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">2-hop</code> and <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">3-hop</code> — over a fixed, pre-registered set of <strong>{ce.metaqa?.meta.nQuestions ?? 100} questions</strong>, scored across {ce.metaqa?.meta.models.length ?? 10} models and 9 modes ({(ce.metaqa?.meta.nCells ?? 9000).toLocaleString()} graded cells). The gold answer set for each question is fixed by the benchmark and is therefore <em>external to our graph</em>: it does not depend on our construction choices, removing a major source of circularity.</P>

          <MethodNote title="Why MetaQA is the headline">Because we build the graph directly from the clean KB, there is <strong>no entity resolution</strong> and <strong>no information-extraction noise</strong> anywhere in the pipeline. Every retrieval mode draws from the same verified facts, so observed differences cannot be attributed to one mode retrieving more or cleaner evidence than another. This isolates context <em>format</em> as the sole explanatory variable.</MethodNote>

          <P>As an <strong>internal-replication</strong> domain we use <strong>global sanctions screening</strong> — the OFAC SDN, UK OFSI, and UN consolidated lists (~25,000 records) — a task that genuinely requires entity resolution. Here gold answers are produced by a <em>graph oracle</em> rather than an independent benchmark, which makes the evaluation <strong>circular</strong>: the graph that answers the question also defines what counts as correct. We report this domain only to confirm that the MetaQA findings reproduce under a noisier, real-world pipeline, and we flag the circularity explicitly as the reason MetaQA, not sanctions, is our primary result.</P>

          <P>For breadth, we additionally replicate across four further public-data domains — <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">CORDIS</code> (EU research projects), <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">ClinicalTrials.gov</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">GLEIF</code> (legal-entity identifiers), and <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">SEC EDGAR</code> — to test cross-domain generality of the format effect.</P>

          <h3 className="mt-8 text-base font-semibold text-foreground">3.2 Graph construction</h3>

          <P>For MetaQA, movies and people become <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">Entity</code> nodes. The relations <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">directed_by</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">written_by</code>, and <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">starred_actors</code> become entity-to-entity edges, while <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">release_year</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">language</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">genre</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">tags</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">rating</code>, and <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">votes</code> become attribute nodes. The graph is stored in <strong>Kuzu</strong>, an embedded graph database.</P>

          <MethodNote title="One dataset-agnostic engine">A single retrieval engine serves every domain. Rather than hard-coding the movie schema, it <strong>introspects each graph's schema at query time</strong>, discovering node labels and relation types dynamically. The same code path therefore drives MetaQA, sanctions, and all four replication domains, so the engine itself introduces no per-dataset bias.</MethodNote>

          <GraphSchemaCard />

          <h3 className="mt-8 text-base font-semibold text-foreground">3.3 Retrieval modes — the independent variable</h3>

          <P>The retrieval mode determines what context, if any, the model sees before answering. The modes escalate from no evidence to fully structured and finally to agentic access; crucially, the fact-bearing modes all draw from the <em>same</em> underlying triples, so they differ only in <strong>structure</strong> and <strong>access pattern</strong>.</P>

          <ul className="my-3 ml-5 list-disc space-y-1 text-muted">
          <li><code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">none</code> — closed-book. The model answers from parametric memory alone, establishing a per-model <strong>capacity floor</strong>.</li>
          <li><code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">vector</code> — a <strong>tuned RAG baseline</strong>, deliberately not a strawman: dense retrieval with a strong multilingual <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">bge-m3</code> embedder over per-entity documents, followed by a cross-encoder reranker — all served locally, no Ollama.</li>
          <li><code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">vector_matched</code> — the same retriever given the <strong>graph-context token budget</strong>, so any graph win can't be dismissed as simply seeing more context.</li>
          <li><code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">rag_iter</code> — iterative multi-hop RAG in the <em>IRCoT / self-ask</em> style: retrieve, reason, emit a follow-up sub-query, and retrieve again, for up to <em>N</em> rounds.</li>
          <li><code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">triple_rag</code> — dense retrieval over individual KB triples as <strong>flat facts</strong>. This delivers the <em>same evidence atoms</em> as the graph modes but with <strong>no structure</strong>, isolating whether structure per se is what helps.</li>
          <li><code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">graph_rag</code> — the relevant subgraph, retrieved <strong>deterministically</strong> by a relation-guided bounded <em>k</em>-hop BFS that expands along the relations the question names, then serialized and handed to the model as <strong>passive structured facts</strong>.</li>
          <li><code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">graph_rag_blind</code> — the identical serializer with <strong>relation guidance turned off</strong>, ablating the relation heuristic to measure its contribution.</li>
          <li><code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">oracle</code> — the retrieved subgraph restricted to <strong>answer-bearing facts</strong> (those mentioning a seed or gold entity). This is an <strong>upper bound</strong> on passive context: if even the oracle is low for a small model, the deficit lies in <em>reading and capacity</em>, not retrieval.</li>
          <li><code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">graph</code> — <strong>agentic</strong> access. The model drives typed graph-traversal tools (<code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">get_entity</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">neighbors</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">k_hop</code>, …) in a loop of up to <strong>8 rounds</strong>.</li>
          </ul>

          <ModeExplainer />

          <MethodNote title="Entity linking does not peek at gold">For all graph modes, entity linking uses the question's <strong>marked topic entity</strong> — a standard KGQA assumption — as the BFS seed. At no point does retrieval consult the gold answer set, so the upper-bound and structured modes remain honest comparisons.</MethodNote>

          <h3 className="mt-8 text-base font-semibold text-foreground">3.4 Scoring</h3>

          <P>Answers are scored against <strong>external gold</strong> as sets. We compute exact normalized set <strong>Precision</strong>, <strong>Recall</strong>, and <strong>F1</strong>, plus <strong>Hits@1</strong>, applying SQuAD-style answer normalization (lowercasing, article and punctuation stripping) before set comparison. We deliberately use <strong>no LLM-as-judge</strong>: such judges introduce known self-preference, verbosity, and position biases that would confound a study whose entire subject is how models read context. For the sanctions domain only, gold is supplied by the graph oracle — the circular case noted in Section 3.1.</P>

          <ErPanel />

          <h3 className="mt-8 text-base font-semibold text-foreground">3.5 Statistics</h3>

          <P>The study is <strong>pre-registered</strong> (the mode set, model roster, question set, and contrast family were fixed before the run). We report <strong>mean F1</strong> with <strong>paired bootstrap 95% confidence intervals</strong> over the shared question set. Every headline contrast is also tested with a <strong>paired Wilcoxon signed-rank test</strong>, corrected for multiple comparisons with <strong>Holm–Bonferroni</strong> across the contrast family, and reported with a paired effect size (<strong>Cohen's d_z</strong>). Decoding is <strong>deterministic greedy</strong>, so run-to-run sampling variance is effectively zero and the intervals capture the dominant source — which questions you happen to ask.</P>

          <h3 className="mt-8 text-base font-semibold text-foreground">3.6 Models and serving</h3>

          <P>The MetaQA arm uses a lean <strong>{ce.metaqa?.meta.models.length ?? 10}-model</strong> roster spanning a <strong>{small?.params_b ?? 1.7}B–{bigParams}B</strong> size range: a Qwen3 size ladder (1.7B / 4B / 8B / 14B / 30B-a3b) for the size axis, plus cross-family models (<code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">llama-3.1-8B</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">llama-3.2-3B</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">gemma2-9B</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">granite-3.3-8B</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">hermes3-llama3.1-8B</code>) chosen to span tool-training profiles and to check that effects are not a single-lineage artifact.</P>

          <MethodNote title="Quantization held constant">All MetaQA models are served at <strong>4-bit quantization</strong>. Holding the quant level fixed across the ladder ensures that model <strong>size</strong> is the only thing varying along that axis, rather than a confound between size and precision. The flip side is a limitation: the agentic arm has no unquantized / frontier ceiling, so its low score is a <em>floor</em> for this regime, not a verdict on agentic RAG in general.</MethodNote>

          <P>Inference runs entirely <strong>on-device</strong> via per-model <strong>MLX</strong> servers — fully local, no Ollama, <strong>no network at inference</strong>, at <strong>$0</strong> marginal cost, which is what makes an experiment of this combinatorial size (modes × models × hops × domains) tractable. There is no frontier API anywhere in the pipeline.</P>

        </Section>

        {/* ── §4 results ───────────────────────────────────────────────── */}
        <Section num="4" id="results" title="Results" lead="Across model sizes and families, passively reading a retrieved subgraph beats both strong text RAG and letting the model drive graph tools — and the agentic deficit is largest exactly where deployment pressure is greatest.">

          <h3 className="mt-8 text-base font-semibold text-foreground">External gold — MetaQA</h3>

          <P>The cleanest test scores against gold answers that are fixed by the benchmark, not by any graph we build. On the MetaQA multi-hop splits, we run the full mode ladder across the on-device size ladder and a cross-family panel. The headline contrasts — passive graph context against the tuned vector baseline, and passive context against agentic graph access — appear directly below.</P>

          <FadeInView className="mt-5">
            <MetaqaCrossover />
          </FadeInView>
          <Caption n={1}>
            MetaQA mean F1 vs. model size (log x), one line per key mode, with paired-bootstrap 95%
            CI bands. Lines trace the Qwen3 ladder; faint dots are the cross-family models. Gold is
            external to our graph, so a graph-mode win here is not an artifact of the scorer — and
            the smallest model reading a subgraph clears the largest doing vector RAG.
          </Caption>
          <FadeInView className="mt-6">
            <MetaqaContrasts />
          </FadeInView>
          <FadeInView className="mt-6">
            <MetaqaTable />
          </FadeInView>
          <Caption n={2} kind="Table">
            Per-model F1 [95% CI] across the modes, hop-toggled. graph_rag is emphasized; the
            confound-control modes (vector_matched, triple_rag, graph_rag_blind, oracle) sit
            alongside it.
          </Caption>

          <h3 className="mt-12 text-base font-semibold text-foreground">Q1: Graph context versus a strong text-RAG baseline</h3>

          <P>On MetaQA scored against <em>external</em> gold, passive graph context (<strong className="text-foreground">graph_rag</strong>) outperforms the tuned vector baseline by <strong className="text-foreground">+{gvDelta.lo.toFixed(2)} to +{gvDelta.hi.toFixed(2)} F1</strong>, significant in <strong className="text-foreground">{grVsVec.sig} of {grVsVec.total}</strong> models after Holm–Bonferroni correction (paired Cohen's d_z {(dzRange("graph_rag-vector")?.lo ?? 0.32).toFixed(2)}–{(dzRange("graph_rag-vector")?.hi ?? 0.78).toFixed(2)}). Pooled across the ladder, graph context climbs from <strong className="text-foreground">{grRange.lo.toFixed(2)} to {grRange.hi.toFixed(2)} F1</strong>, while the vector baseline moves only from about <strong className="text-foreground">{vecRange.lo.toFixed(2)} to {vecRange.hi.toFixed(2)}</strong>; closed-book trails far below (≈{noneRange.lo.toFixed(2)}→{noneRange.hi.toFixed(2)}), confirming the task genuinely demands retrieved evidence rather than parametric recall. Crucially the baseline is not a strawman: it is a <em>multilingual bge-m3</em> retriever with cross-encoder rerank, served on-device — so this is graph structure beating a strong, tuned text RAG.</P>

          <P>The magnitude of the gap is itself the interesting result. Both conditions retrieve from the same underlying knowledge; what differs is the <em>shape</em> of the evidence handed to the model. The vector baseline returns a bag of passages — locally relevant but unstructured — whereas graph context delivers a traversable subgraph in which the entities and relations needed to chain an answer are already adjacent. For multi-hop questions, the binding work of "which fact connects to which" has effectively been done by the retriever's structure rather than left to the reader. We read this as evidence that <strong className="text-foreground">structure, not merely relevance, is what carries multi-hop performance</strong>: reranking sharpens passage relevance but cannot supply the relational adjacency that chaining requires.</P>

          <Observation n={1} title="Structured evidence beats relevant passages">
            Passive graph context beats a <em>strong</em> bge-m3 + rerank baseline by +{gvDelta.lo.toFixed(2)}–+{gvDelta.hi.toFixed(2)} F1, Holm-significant in {grVsVec.sig}/{grVsVec.total} models (d_z {(dzRange("graph_rag-vector")?.lo ?? 0.32).toFixed(2)}–{(dzRange("graph_rag-vector")?.hi ?? 0.78).toFixed(2)}). The same facts presented as a traversable subgraph rather than a bag of passages is what enables chaining.
          </Observation>

          <h3 className="mt-8 text-base font-semibold text-foreground">Q2: Passive context versus agentic graph access — the crossover</h3>

          <P>The central finding is a sign reversal between two ways of giving a model the <em>same</em> graph. Handing the model a pre-retrieved subgraph (<strong className="text-foreground">graph_rag</strong>) outperforms letting it <em>drive</em> graph-traversal tools itself (<strong className="text-foreground">agentic graph</strong>) by <strong className="text-foreground">+{ggDelta.lo.toFixed(2)} to +{ggDelta.hi.toFixed(2)} F1</strong> — Holm-significant in <strong className="text-foreground">{grVsGraph.sig} of {grVsGraph.total}</strong> models, with paired d_z up to {(dzRange("graph_rag-graph")?.hi ?? 1.11).toFixed(2)}. The effect is not merely that agency fails to help: for most models, agentic graph access falls <em>below even the vector baseline</em> ({graphVsVec.sig}/{graphVsVec.total} models significantly negative). A model that reads a subgraph well can still be a poor pilot of one. We scope this carefully to the <strong className="text-foreground">small / quantized / on-device</strong> regime — with no frontier or unquantized ceiling in this run, the agentic number is a <em>floor</em>, not a verdict that agentic RAG fails in general.</P>

          <P>We interpret the crossover as a mismatch between where capability is spent. Agentic retrieval converts a reading problem into a tool-orchestration problem — deciding which traversal to issue, parsing intermediate results, maintaining state across turns, and recovering from missteps. For small and quantized models, that orchestration burden exceeds available capability, and errors compound across turns faster than any one tool call can help; the model spends its budget steering rather than answering. Passive context removes that burden entirely, leaving the model with the one thing it does comparatively well — reading evidence laid out in front of it.</P>

          <P>Crucially, the agentic ceiling <em>rises with model size</em>. The deficit narrows as capability grows, which implies a crossover would eventually appear for a model capable enough to amortize the orchestration cost — a prediction consistent with strong results reported for frontier-scale agentic-graph systems. The contribution here is to characterize the regime <em>below</em> that crossover: the small, quantized, on-device models that are exactly where prior agentic-graph work has <strong className="text-foreground">not</strong> looked, and exactly where passive context is the safer design.</P>

          <Observation n={2} title="Reading a subgraph beats driving one">
            Pre-retrieved graph context beats agentic graph access by +{ggDelta.lo.toFixed(2)}–{ggDelta.hi.toFixed(2)} F1 ({grVsGraph.sig}/{grVsGraph.total} models, d_z to {(dzRange("graph_rag-graph")?.hi ?? 1.11).toFixed(2)}); for most models agentic graph is significantly <em>worse than vector RAG</em> ({graphVsVec.sig}/{graphVsVec.total}). Scoped to small/quantized/on-device — the agentic arm is a floor here, not a general verdict on agentic RAG.
          </Observation>

          <h3 className="mt-8 text-base font-semibold text-foreground">Q3: Context as a substitute for parameters</h3>

          <P>Graph context scales gently with model size — from roughly <strong className="text-foreground">{grRange.lo.toFixed(2)} to {grRange.hi.toFixed(2)} F1</strong> across the full ladder, a span of only {grSpan.toFixed(2)} — which has a striking practical consequence: a <strong className="text-foreground">{small?.params_b ?? 1.7}B model reading a subgraph ({smallGr.toFixed(2)}) outperforms a {bigParams}B model with vector RAG ({bigVec.toFixed(2)})</strong>. Along the multi-hop axis that defines this task, the right context shape buys more than the parameter gap does.</P>

          <P>This is, in effect, a graph-specific and on-device echo of the RETRO observation that retrieval can offset raw scale. We state it cautiously: the substitution holds <em>on this task family</em>, where chaining is the bottleneck and the subgraph supplies exactly the relational structure the small model cannot synthesize on its own. We do not claim context replaces capacity in general — only that, for multi-hop graph QA under deployment constraints, structured context and parameters trade against each other far enough that a small model with the right evidence is the better engineering choice.</P>

          <Observation n={3} title="Context trades against capacity">
            Graph context rises only ≈{grRange.lo.toFixed(2)}→{grRange.hi.toFixed(2)} across the ladder, so a {small?.params_b ?? 1.7}B model reading a subgraph ({smallGr.toFixed(2)}) beats a {bigParams}B doing vector RAG ({bigVec.toFixed(2)}) — a graph-specific, on-device echo of RETRO, scoped to multi-hop QA.
          </Observation>

          <h3 className="mt-8 text-base font-semibold text-foreground">Q4: Is it structure — or just volume, content, or retrieval luck?</h3>

          <P>A graph-context win invites four deflating explanations, and the confound-control panel below tests each by lining graph_rag up against a control that isolates it. <strong className="text-foreground">Volume:</strong> a budget-matched vector arm (<code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">vector_matched</code>) gets the same token budget as the subgraph and still trails graph context ({grVsVecMatchedN} models significant). <strong className="text-foreground">Content:</strong> the same facts flattened to individual triples (<code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">triple_rag</code>) collapse to near closed-book level — graph_rag beats it in {grVsTriple.sig}/{grVsTriple.total} models (d_z to {(dzRange("graph_rag-triple_rag")?.hi ?? 1.32).toFixed(2)}). So it is the <em>structure</em>, not the volume or the bare facts.</P>

          <FadeInView className="my-5">
            <ConfoundControl />
          </FadeInView>
          <Caption n={3}>
            Pooled mean F1 for graph context against four controls, each isolating one alternative
            explanation. The tick on each control row marks the graph_rag score. Same facts flat
            (triple_rag) collapse; budget-matched vector trails; the blind subgraph nearly matches
            the guided one; and the oracle barely tops graph context.
          </Caption>

          <P>The last two rungs are the honest caveats. The blind-BFS ablation (<code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">graph_rag_blind</code>) turns the relation-guidance heuristic off and lands almost on top of guided graph_rag — significant in only <strong className="text-foreground">{contrastsFor("graph_rag-graph_rag_blind").filter((c) => c.sig).length}/{contrastsFor("graph_rag-graph_rag_blind").length}</strong> models — so the clever relation heuristic adds little; the win is <em>delivering a subgraph at all</em>. And the answer-bearing <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">oracle</code> upper bound barely edges graph_rag ({oracleSig}/{oracleVsGr.length} significant), which means the retriever is already near its ceiling: the residual error is the model <em>reading</em> the context it was given, not the retriever missing it.</P>

          <Observation n={4} title="Structure, not volume or content; retrieval is near-ceiling">
            graph_rag beats budget-matched flat docs ({grVsVecMatchedN}/{grVsVec.total}) and the same facts flattened ({grVsTriple.sig}/{grVsTriple.total}, d_z to {(dzRange("graph_rag-triple_rag")?.hi ?? 1.32).toFixed(2)}). It nearly equals its own blind ablation and the oracle ({oracleSig}/{oracleVsGr.length} sig) — so the win is delivering a subgraph, and the residual error is reading, not retrieval.
          </Observation>

          <h3 className="mt-8 text-base font-semibold text-foreground">Tool-training and the agentic gap (directional)</h3>

          <P>If the agentic deficit is an orchestration-burden problem, function-call training ought to narrow it. We split the 6–9B band by tool profile — tool-tuned / agentic, function-calling, and not-tool-tuned — and compare passive graph context to agentic graph in each bucket. Passive context wins in <em>every</em> bucket, even the tool-tuned one. But this is <strong className="text-foreground">directional only</strong>: the lean roster leaves just 3, 1, and 1 model per bucket, far too few to actually test the hypothesis. Read it as "tool-tuning did not reverse the ordering at these sizes" and nothing stronger.</P>

          <FadeInView className="my-5">
            <ToolProfile />
          </FadeInView>
          <Caption n={4}>
            Passive graph context vs. agentic graph by tool profile, 6–9B band. Underpowered by
            construction (3 / 1 / 1 models) — directional evidence, not a hypothesis test.
          </Caption>

          <h3 className="mt-8 text-base font-semibold text-foreground">Every contrast, every model</h3>

          <P>The table below is the full statistical backbone: for each model and each contrast pair, the paired F1 delta, its bootstrap 95% CI, the paired effect size d_z, and whether it survives Holm–Bonferroni correction. Toggle the pair to inspect any claim above directly.</P>

          <FadeInView className="my-5">
            <ContrastsTable />
          </FadeInView>
          <Caption n={5} kind="Table">
            Per-model paired contrasts with bootstrap CIs, d_z, and Holm-corrected significance.
          </Caption>

        </Section>

        {/* ── §5 worked example ───────────────────────────────────────── */}
        <Section
          num="5"
          id="trace"
          title="A worked example"
          lead="To make the engine's mechanics concrete, here is one recorded trace on the sanctions graph with a local model — illustrative only, and separate from the headline MetaQA run above. Vector RAG retrieves similar text and guesses; the agentic graph resolves the entity and walks the edges, citing each answer to a source list."
        >
          <FadeInView>
            <TraceDemo />
          </FadeInView>
          <Caption n={6}>
            An illustrative <strong>recorded trace</strong> of {ce.demo.model?.name}{" "}
            (a local 4-bit model) running the engine on the <strong>sanctions graph</strong>. This
            trace is separate from — and predates — the headline MetaQA run: it is <em>not</em> one
            of the ten lean MetaQA models, and the scorecard counts matches against the sanctions
            graph oracle, not external gold. It is shown only to make the engine's mechanics
            concrete. Select a question; the agentic traversal replays one tool call at a time.
          </Caption>
        </Section>

        {/* ── §6 generalization ───────────────────────────────────────── */}
        <Section
          num="6"
          id="domains"
          title="Generalization across domains"
          lead="A finding on one dataset is a curiosity. The same engine — zero per-domain code, schema introspected at query time — was pointed at five public graphs to see whether the lift survives. It does: graph context beats vector on all five."
        >
          <FadeInView>
            <DomainReplication />
          </FadeInView>
          <Caption n={7}>
            Per-domain jump from vector RAG (amber) to graph context (blue) across {ce.domains?.nDomains ?? 5}{" "}
            public graphs, local models, mean F1 over each domain's full question bank. The
            budget-matched vector tick (deeper amber) sits right on the vector dot — extra tokens
            don't help; the closed-book tick marks the no-retrieval floor.
          </Caption>
          {dMin && dMax && (
            <Observation n={5} title="The lift replicates — and varies honestly">
              Graph context beats vector RAG in {allUp ? "every" : "most"} domain tested, by{" "}
              {dMin.delta >= 0 ? "+" : ""}
              {dMin.delta.toFixed(2)} ({dMin.title.split(" ")[0]}) to +{dMax.delta.toFixed(2)} (
              {dMax.title.split(" ")[0]}). The margin is largest where the graph encodes genuinely
              multi-hop structure and smallest where one entity's neighborhood already answers the
              question. A domain-dependent lift is more credible than a uniform win — and it rules
              out the result being a quirk of sanctions data.
            </Observation>
          )}
        </Section>

        {/* ── §7 cost & faithfulness ──────────────────────────────────── */}
        <Section
          num="7"
          id="economics"
          title="Cost and faithfulness"
          lead="Accuracy is only half the picture for deployment. Two other axes decide whether a mode is usable: what each query costs to run, and — for high-stakes work — how often the model fabricates an answer that maps to nothing real."
        >
          <P>
            Every mode here runs <strong className="text-foreground">on-device, $0, local</strong>.
            The cost we can compare is therefore tokens per query (and the latency that tracks it),
            pooled over the ten MetaQA models. The token-heavy modes are the <em>k</em>-hop ones:
            the blind subgraph at {econBlind?.tokens.toLocaleString()} tokens and the agentic loop at{" "}
            {econGraph?.tokens.toLocaleString()}. Passive graph context costs{" "}
            {econGr?.tokens.toLocaleString()} — only modestly less than the agentic loop, not the
            order-of-magnitude gap one might assume — while the answer-bearing oracle is both the
            leanest fact-bearing mode ({econOracle?.tokens.toLocaleString()}) and among the most
            accurate. The agentic loop is the real cost outlier on <em>latency</em> (its multi-round
            tool calls run far longer per query), without buying accuracy back.
          </P>

          <FadeInView className="mt-5">
            <EconomicsTokens />
          </FadeInView>
          <Caption n={8}>
            Mean tokens per query by mode, pooled over the 10 MetaQA models (local, $0). The
            <em> k</em>-hop modes — graph context (blind) and the agentic graph loop — are the
            token-heavy ones; passive graph context and especially the oracle stay lean.
          </Caption>

          <FadeInView className="mt-7">
            <EconomicsScatter />
          </FadeInView>
          <Caption n={9}>
            Tokens per query (log x) vs. mean F1, one point per mode, local only — no frontier
            models, no dollar axis. Up-and-to-the-left is better: graph context and the oracle sit
            in the cheap-and-accurate corner, while the agentic loop spends the most tokens for one
            of the lowest scores.
          </Caption>

          <FadeInView className="mt-7">
            <EconomicsHallucination />
          </FadeInView>
          <Caption n={10}>
            Hallucination rate by mode — share of named answers that resolve to no real graph node —
            measured on the five graph-oracle domains (MetaQA external string gold has no
            faithfulness signal). Closed-book fabricates {pct(hallNone?.hallucination)}; graph
            context is the most faithful retrieval mode at {pct(hallGr?.hallucination)}.
          </Caption>

          <div className="mt-6">
            <Observation n={6} title="Graph context is the faithful — and lean — retrieval mode">
              On the graph-oracle domains, closed-book answers are uncited guesses that fabricate{" "}
              {pct(hallNone?.hallucination)} of the time; passive graph context drops that to{" "}
              {pct(hallGr?.hallucination)} — the most faithful of the retrieval modes, well below
              even vector RAG ({pct(hallVec?.hallucination)}) — because the answer is read off real
              nodes. It gets there for {econGr?.tokens.toLocaleString()} tokens per query, only
              modestly above the leanest fact-bearing modes and barely cheaper than the agentic loop
              ({econGraph?.tokens.toLocaleString()} tokens) — so the case for passive context here is
              accuracy and faithfulness, not a dramatic token saving. Faithfulness is measured on the
              graph-oracle domains only; MetaQA's external gold does not define it.
            </Observation>
          </div>
        </Section>

        {/* ── §8 discussion ───────────────────────────────────────────── */}
        <Section
          num="8"
          id="discussion"
          title="Discussion"
          lead="What follows if much of the multi-hop deficit is context, not capacity."
        >
          <P>
            The practical consequence is the part I find most exciting. A well-built, cited graph
            lets a 1.7B model you run on your own hardware out-score a 30B doing vector RAG on
            multi-hop investigation — so the whole pipeline (ingestion, resolution, graph,
            answering) can run <strong className="text-foreground">air-gapped and sovereign</strong>,
            with no data leaving the machine and no frontier API in the loop. That is exactly the
            constraint in the domains where this kind of work matters most: security, health,
            finance. We are careful <em>not</em> to claim parity with a frontier model — this run
            has no frontier or unquantized ceiling — only that, within the local regime, the right
            context format buys more than parameters or autonomy.
          </P>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <FadeInView>
              <SpotlightCard className="flex h-full gap-3 p-5">
                <Lock className="size-5 shrink-0 text-[var(--cat-projects)]" />
                <div>
                  <div className="text-sm font-semibold text-foreground">On-device, $0, air-gapped</div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Given the right subgraph, a small local model on one workstation does multi-hop
                    QA that a far larger model with vector RAG cannot. No network, no API, $0.
                  </p>
                </div>
              </SpotlightCard>
            </FadeInView>
            <FadeInView>
              <SpotlightCard className="flex h-full gap-3 p-5">
                <GitFork className="size-5 shrink-0 text-accent" />
                <div>
                  <div className="text-sm font-semibold text-foreground">Plug it into any agent</div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    The same graph tools are exposed as an MCP server — point any agent host at the
                    resolved graph and investigate it live.
                  </p>
                </div>
              </SpotlightCard>
            </FadeInView>
          </div>
        </Section>

        {/* ── §10 limitations ─────────────────────────────────────────── */}
        <Section num="9" id="limitations" title="Limitations & threats to validity" lead="The result — that a structured subgraph lets a small local model punch above its weight — rests on a specific experimental frame. Here is where that frame is thin, and what would harden it.">
          <Observation n={1} title="Contamination and memorization">
            <P>MetaQA is built on movie facts that may sit in the pretraining corpus, so a graph-mode win could in principle reflect recall rather than reasoning. We mitigate this by reporting the <strong className="text-foreground">closed-book baseline</strong>, which is near-zero — if the model had memorized the answers, the no-context arm would not collapse, so memorization is not carrying the headline result. This is a mitigation, not an elimination: the only clean fix is an <em>anti-contamination</em> evaluation (e.g. MINTQA / FRAMES) whose facts post-date or fall outside the training distribution, which we have not yet run.</P>
          </Observation>
          <Observation n={2} title="Deterministic, single decode">
            <P>Decoding is <strong className="text-foreground">deterministic greedy</strong>, so there is no sampling stochasticity to average over — a strength for reproducibility, but it also means the reported confidence intervals are a <strong className="text-foreground">paired bootstrap over the question set only</strong>. They capture the dominant variance source (which 100 questions you happen to ask) but would not reflect prompt-format or temperature sensitivity, which we did not vary.</P>
          </Observation>
          <Observation n={3} title="Tool-profile evidence is directional">
            <P>The function-call-training analysis (H3 / the tool-profile panel) is <strong className="text-foreground">directional only</strong>. The lean 10-model roster leaves just 3 agentic, 1 function-calling, and 1 non-tool-tuned model in the 6–9B band — far too few to test whether tool training closes the passive-vs-agentic gap. We report it because passive context wins in every bucket, but it is underpowered and should not be read as a hypothesis test.</P>
          </Observation>
          <Observation n={4} title="Clean-KB caveat">
            <P>MetaQA hands us a curated graph with no extraction noise. That is a feature for <em>isolating context format</em> — it lets us attribute the win to structure rather than to a better information-extraction pipeline — but it is also a limitation: it does <strong className="text-foreground">not</strong> test the realistic, noisy IE-built-graph setting that a real deployment faces. A messy-text benchmark such as MuSiQue is needed to close that gap. The sanctions arm does exercise real entity resolution, but its scoring is graph-oracle and therefore circular, so it cannot stand in for end-to-end noise either.</P>
          </Observation>
          <Observation n={5} title="Entity linking is assumed, not evaluated">
            <P>The graph modes start from the benchmark's marked topic entity — a standard KGQA assumption — so end-to-end entity linking from raw text is outside the measured pipeline. In a real system, linking errors would erode some of the structured-context advantage we report.</P>
          </Observation>
          <Observation n={6} title="The relation heuristic adds little">
            <P>Honest negative: our <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">graph_rag</code> mode uses a <strong className="text-foreground">relation-guided BFS</strong>, but the blind-BFS ablation (<code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">graph_rag_blind</code>) lands almost on top of it — significant in only 1/10 models. So the relation-guidance heuristic is <em>not</em> what carries the result; the win is delivering a subgraph at all. A learned or personalized-PageRank retriever (HippoRAG-style) is not yet compared, so we cannot claim our retriever is optimal — only that even its blind variant suffices.</P>
          </Observation>
          <Observation n={7} title="No frontier / unquantized ceiling">
            <P>This run has no frontier or unquantized model as an upper reference line (a cost decision). So "how close does a structured-context local model get to a frontier model" is <em>not</em> quantified, and — crucially — the weak agentic-graph result is a <strong className="text-foreground">floor for the local 4-bit regime</strong>, not evidence that agentic RAG fails at scale. Our claims are about gaps <em>between local configurations</em>, not about closing the gap to the best available models.</P>
          </Observation>
          <Observation n={8} title="MetaQA is template-generated">
            <P>MetaQA questions are generated from templates over a movie KB, so they are cleaner and more uniform than naturally-occurring multi-hop questions. That aids the controlled isolation of context format, but limits external validity; a messy-text set such as MuSiQue is the needed complement.</P>
          </Observation>
          <Observation n={9} title="Cross-domain replication is graph-oracle">
            <P>The five replication domains are scored against a <strong className="text-foreground">graph oracle</strong>, not independent gold — so they confirm the <em>shape</em> of the format effect reproduces across schemas, but they are not independent truth and cannot establish absolute accuracy the way the external MetaQA gold does.</P>
          </Observation>
        </Section>

        {/* ── §11 future work ─────────────────────────────────────────── */}
        <Section num="10" id="future" title="Future work" lead="The limitations above map cleanly onto a roadmap. In rough priority order:">
          <ul className="my-3 ml-5 list-disc space-y-1 text-muted">
            <li><strong className="text-foreground">Frontier + unquantized ceiling</strong> — add frontier and full-precision reference lines to quantify the local-to-frontier gap and to test whether the agentic deficit is a quantization/scale artifact (the open question this run cannot answer).</li>
            <li><strong className="text-foreground">Power up the tool-profile test</strong> — a roster balanced across tool-training profiles, enough per bucket to actually test whether function-call training narrows the passive-vs-agentic gap.</li>
            <li><strong className="text-foreground">MuSiQue</strong> — move from a clean given graph to messy text with an IE-built graph, to test whether the structured-context advantage survives extraction noise.</li>
            <li><strong className="text-foreground">Anti-contamination sets</strong> — run MINTQA / FRAMES to rule out memorization rather than merely bounding it with the closed-book baseline.</li>
            <li><strong className="text-foreground">Better subgraph retrieval</strong> — compare PPR / learned retrievers (HippoRAG-style) against the relation-guided BFS, and ablate the serialization format of the subgraph handed to the model.</li>
            <li><strong className="text-foreground">Quantization sweep</strong> — test Q4 / Q8 / bf16 to see whether quantization degrades agentic tool-use more than passive reading, since the two modes may have different sensitivity to precision loss.</li>
            <li><strong className="text-foreground">Cost/accuracy Pareto and a failure taxonomy</strong> — chart the accuracy-per-dollar/second frontier across modes, and categorize how the agentic loop fails when it fails.</li>
            <li><strong className="text-foreground">Scale</strong> — grow the question set and seed count to tighten all reported intervals, especially for the lightly-sampled agentic arm.</li>
          </ul>
        </Section>

        {/* ── §12 conclusion ──────────────────────────────────────────── */}
        <Section num="11" id="conclusion" title="Conclusion" lead="What did we actually learn, and what should a practitioner do with it.">
          <P>We set out to answer four questions. <strong className="text-foreground">Q1 — does structured graph context beat a strong text-RAG baseline?</strong> Yes, decisively: graph context beat a tuned bge-m3 + rerank baseline by +{gvDelta.lo.toFixed(2)}–+{gvDelta.hi.toFixed(2)} F1, significant in {grVsVec.sig}/{grVsVec.total} models. <strong className="text-foreground">Q2 — passive subgraph vs. agentic loop?</strong> For these small, quantized, on-device models, reading a pre-retrieved subgraph beat driving graph tools in {grVsGraph.sig}/{grVsGraph.total} models — agentic access often fell below even vector RAG. We scope that to the local regime; it is a floor, not a verdict on agentic RAG. <strong className="text-foreground">Q3 — is it structure, or volume/content?</strong> Structure: graph context beat the budget-matched vector arm and the same facts flattened to triples ({grVsTriple.sig}/{grVsTriple.total}). <strong className="text-foreground">Q4 — where does the residual error live?</strong> An answer-bearing oracle barely topped graph context, so the retriever is near its ceiling and the loss is the model <em>reading</em> the context — and notably the clever relation-guidance heuristic added little over a blind subgraph, so the win is delivering a subgraph at all.</P>
          <P>The practical upshot is concrete. Capable investigative QA does not require sending data to a frontier API or spinning up an agentic tool-use loop. It can run <strong className="text-foreground">on-device, at $0 marginal cost</strong>, on a small model — provided you do the work of giving that model a well-chosen, structured subgraph rather than reaching for more parameters or more autonomy. For the contamination-, seed-, and noise-related reasons laid out above, this is a result about a clean, single-seed, single-GPU regime, and it should be read with those boundaries in mind until the roadmap above fills them in.</P>
          <P>If there is one line to carry away, it is this: <em>for small local models, how you deliver context matters more than how many parameters you have.</em></P>
        </Section>

        {/* ── references ──────────────────────────────────────────────── */}
        <div id="refs" className="mx-auto mt-20 max-w-3xl scroll-mt-24">
          <FadeInView>
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Notes &amp; sources
            </div>
            <References
              items={[
                "OFAC Specially Designated Nationals (SDN) list, U.S. Treasury.",
                "UK OFSI consolidated list of financial sanctions targets, HM Treasury.",
                "UN Security Council consolidated sanctions list.",
                "Cross-domain sources: CORDIS (EU research grants), ClinicalTrials.gov, GLEIF (legal-entity ownership), SEC EDGAR (filings & Form 4 insider trades).",
                "Stack: Kuzu (embedded graph), MLX (on-device inference, 4-bit), bge-m3 + cross-encoder rerank (vector baseline). Fully local — no Ollama, no network at inference, no frontier API anywhere in the pipeline, $0 marginal cost.",
              ]}
            />
          </FadeInView>
          <FadeInView className="mt-8">
            <p className="text-xs leading-5 text-muted-foreground">{ce.meta.note}</p>
          </FadeInView>
        </div>

        <div className="h-24" />
      </Container>
    </div>
  );
}
