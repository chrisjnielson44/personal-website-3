import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, GitFork, Lock } from "lucide-react";
import { Container } from "@/components/Container";
import { FadeInView, ReadingProgress } from "@/components/Motion";
import { GapCollapseChart } from "@/components/contextEngine/GapCollapseChart";
import { CostAccuracyScatter } from "@/components/contextEngine/CostAccuracyScatter";
import { DomainReplication } from "@/components/contextEngine/DomainReplication";
import { MetaqaCrossover, MetaqaContrasts } from "@/components/contextEngine/MetaqaCrossover";
import { MetaqaTechniques } from "@/components/contextEngine/MetaqaTechniques";
import { ModeExplainer } from "@/components/contextEngine/ModeExplainer";
import { StatGrid, ModeEconomics, ErPanel } from "@/components/contextEngine/BenchPanels";
import { Leaderboard } from "@/components/contextEngine/Leaderboard";
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
import { byMode, ce, qwenSweep } from "@/data/contextEngine";

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
  { id: "leaderboard", num: "8", label: "Full results" },
  { id: "discussion", num: "9", label: "Discussion" },
  { id: "limitations", num: "10", label: "Limitations" },
  { id: "future", num: "11", label: "Future work" },
  { id: "conclusion", num: "12", label: "Conclusion" },
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
  const n0 = byMode("none")!;
  const gr = byMode("graph_rag")!;
  const g = byMode("graph")!;
  const sweep = qwenSweep();
  const grSweep = sweep.map((s) => s.graph_rag as number);
  const grMin = Math.min(...grSweep);
  const grMax = Math.max(...grSweep);
  const tokenRatio = g.tokens_mean && gr.tokens_mean ? g.tokens_mean / gr.tokens_mean : 0;

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
                  {ce.charts.nModels} models · {ce.domains?.nDomains ?? 1} domains ·{" "}
                  {ce.charts.nCells.toLocaleString()} graded answers
                </span>
              </div>
            </FadeInView>

            <FadeInView delay={0.05} className="mt-8">
              <Abstract>
                When a small, locally-deployable LLM fails a multi-hop question, is the deficit{" "}
                <em>capacity</em> (too few parameters) or <em>context</em> (the wrong delivery of
                the facts)? We separate the two by holding the evidence fixed and varying only how
                it is delivered. On <strong>MetaQA</strong> — an external multi-hop benchmark whose
                gold answers are independent of any graph we build — we sweep a 4-bit quantized
                Qwen3 size ladder (0.6B–30B) plus a cross-family panel, all served on-device via
                MLX. Passive graph context (a pre-retrieved subgraph handed to the model) beats a
                tuned, reranked vector-RAG baseline at every size, and beats letting the model{" "}
                <em>drive</em> graph-traversal tools agentically — small quantized models read a
                subgraph better than they pilot one. Pooled F1 for graph context rises only from
                ≈0.53 to ≈0.70 across an ~18× parameter range, so a 1.7B model reading a subgraph
                outscores a 30B model with vector RAG. Much of a small model's multi-hop deficit is
                a context problem, not a capacity one — and the whole pipeline runs air-gapped, on
                local hardware, for $0.
              </Abstract>
            </FadeInView>

            <FadeInView delay={0.1} className="mt-4">
              <Contributions
                items={[
                  {
                    stat: "≈0",
                    text: (
                      <>
                        size-dependence of accuracy once the graph is delivered as context (Δ{" "}
                        {(grMax - grMin).toFixed(2)} across the sweep)
                      </>
                    ),
                  },
                  {
                    stat: "passive ≫ agentic",
                    text: (
                      <>
                        the novel crossover: small models read a subgraph better than they drive
                        one
                      </>
                    ),
                  },
                  {
                    stat: pct(n0.hallucination_rate),
                    text: <>closed-book hallucination, vs {pct(gr.hallucination_rate)} with graph context</>,
                  },
                  {
                    stat: `${tokenRatio.toFixed(1)}×`,
                    text: <>fewer tokens than the agentic loop, for most of the accuracy</>,
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
          <P>The setup is deliberately uniform. All models are 4-bit quantized and run on-device on an Apple M3 Ultra via MLX: a Qwen3 size ladder from 0.6B to 30B, a Llama-3.2-3B control, and a cross-family panel (Qwen2.5-7B, Llama-3.1-8B, Mistral-7B, Gemma-2-9B, Granite-3.3-8B, Phi-3.5-mini) to check that effects are not an artifact of one model family. The central pattern is large and consistent. Pooled MetaQA F1 for graph-as-passive-context rises from roughly <strong className="text-foreground">0.53 to 0.70</strong> across the size ladder, against roughly <strong className="text-foreground">0.19 to 0.29</strong> for reranked vector RAG and <strong className="text-foreground">0.04 to 0.13</strong> closed-book. The substitution is stark at the extremes: a 1.7B model reading a subgraph (~0.53) outscores a 30B model equipped with vector RAG (~0.29). The bottleneck, at least here, is more context than capacity.</P>
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

          <P>Our headline benchmark is <strong>MetaQA</strong>, a movie-domain knowledge-base question-answering dataset built on a clean knowledge base of <strong>134,741 triples</strong> spanning <strong>9 relation types</strong> and approximately <strong>43,000 entities</strong>. We use the multi-hop splits — <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">2-hop</code> and <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">3-hop</code> — and sample <strong>200 questions per hop</strong>. The gold answer set for each question is fixed by the benchmark and is therefore <em>external to our graph</em>: it does not depend on our construction choices, removing a major source of circularity.</P>

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
          <li><code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">vector</code> — a <strong>tuned RAG baseline</strong>, deliberately not a strawman: dense retrieval with <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">embeddinggemma</code> over per-entity documents, followed by a cross-encoder reranker (<code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">ms-marco-MiniLM</code>).</li>
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

          <P>We report <strong>mean F1</strong> with <strong>paired bootstrap 95% confidence intervals computed over the question set</strong>. Because the same questions are evaluated across every mode and model, comparisons are <em>paired</em>, and the bootstrap resamples questions to capture the dominant source of variance. We report <em>n</em> (the number of questions per condition) alongside every estimate. Decoding is near-greedy at low temperature, so run-to-run sampling variance is negligible relative to the question-set variance the intervals capture.</P>

          <h3 className="mt-8 text-base font-semibold text-foreground">3.6 Models and serving</h3>

          <P>To separate the effect of model <em>size</em> from architecture, our primary axis is a <strong>quantized size ladder</strong> of the Qwen3 family — <strong>0.6B, 1.7B, 4B, 8B, 14B, and 30B-a3b</strong> — supplemented by a <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">llama-3.2-3B</code> weak-tool-caller control to probe tool-use failures specifically. A <strong>cross-family</strong> set (<code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">Qwen2.5-7B</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">Llama-3.1-8B</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">Mistral-7B</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">Gemma-2-9B</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">Granite-3.3-8B</code>, <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">Phi-3.5-mini</code>) tests generality beyond a single lineage.</P>

          <MethodNote title="Quantization held constant">All models are served at <strong>4-bit quantization</strong>. Holding the quant level fixed across the ladder ensures that model <strong>size</strong> is the only thing varying along that axis, rather than a confound between size and precision.</MethodNote>

          <P>Inference runs entirely <strong>on-device</strong> on a single Apple <strong>M3 Ultra (256 GB)</strong> via per-model <strong>MLX</strong> servers run concurrently — fully local and at <strong>$0</strong> marginal cost, which is what makes an experiment of this combinatorial size (modes × models × hops × domains) tractable. Frontier models (Claude, GPT, Gemini) are reserved as a <strong>reference ceiling</strong> only and are pending.</P>

        </Section>

        {/* ── §4 results ───────────────────────────────────────────────── */}
        <Section num="4" id="results" title="Results" lead="Across model sizes and families, passively reading a retrieved subgraph beats both strong text RAG and letting the model drive graph tools — and the agentic deficit is largest exactly where deployment pressure is greatest.">

          <h3 className="mt-8 text-base font-semibold text-foreground">External gold — MetaQA</h3>

          <P>The cleanest test scores against gold answers that are fixed by the benchmark, not by any graph we build. On the MetaQA multi-hop splits, we run the full mode ladder across the on-device size ladder and a cross-family panel. The headline contrasts — passive graph context against the tuned vector baseline, and passive context against agentic graph access — appear directly below.</P>

          <FadeInView className="mt-5">
            <MetaqaCrossover />
          </FadeInView>
          <Caption n={1}>
            MetaQA mean F1 by model × retrieval mode, with paired-bootstrap 95% CIs over the
            question set; toggle 2-hop / 3-hop / pooled. Gold is external to our graph, so a
            graph-mode win here is not an artifact of the scorer.
          </Caption>
          <FadeInView className="mt-6">
            <MetaqaContrasts />
          </FadeInView>

          <h3 className="mt-12 text-base font-semibold text-foreground">Q1: Graph context versus a strong text-RAG baseline</h3>

          <P>On the MetaQA split scored against <em>external</em> gold answers, supplying the model with passive graph context (<strong className="text-foreground">graph_rag</strong>) outperforms a reranked dense-vector baseline at every model size we tested, by <strong className="text-foreground">+0.32 to +0.41 F1</strong>. Pooled across the sweep, graph context climbs from roughly <strong className="text-foreground">0.53 to 0.70 F1</strong> over the 1.7B→30B range, while the reranked vector baseline moves only from about <strong className="text-foreground">0.19 to 0.29</strong>; closed-book inference trails far below both (≈0.04→0.13), confirming that the task genuinely demands retrieved evidence rather than parametric recall. Every paired-bootstrap confidence interval on the graph-versus-vector contrast excludes zero, so the advantage is not an artifact of a favorable model or seed.</P>

          <P>The magnitude of the gap is itself the interesting result. Both conditions retrieve from the same underlying knowledge; what differs is the <em>shape</em> of the evidence handed to the model. The vector baseline returns a bag of passages — locally relevant but unstructured — whereas graph context delivers a traversable subgraph in which the entities and relations needed to chain an answer are already adjacent. For multi-hop questions, the binding work of "which fact connects to which" has effectively been done by the retriever's structure rather than left to the reader. We read this as evidence that <strong className="text-foreground">structure, not merely relevance, is what carries multi-hop performance</strong>: reranking sharpens passage relevance but cannot supply the relational adjacency that chaining requires.</P>

          <Observation n={1} title="Structured evidence beats relevant passages">
            Passive graph context beats a reranked vector baseline by +0.32–0.41 F1 at every size, with all paired-bootstrap CIs excluding zero. The same facts presented as a traversable subgraph rather than a bag of passages is what enables chaining.
          </Observation>

          <h3 className="mt-8 text-base font-semibold text-foreground">Q2: Passive context versus agentic graph access — the crossover</h3>

          <P>The central finding of this paper is a sign reversal between two ways of giving a model the <em>same</em> graph. Handing the model a pre-retrieved subgraph (<strong className="text-foreground">graph_rag</strong>) outperforms letting it <em>drive</em> graph-traversal tools itself (<strong className="text-foreground">agentic graph</strong>) by <strong className="text-foreground">+0.48 to +0.54 F1</strong> for every local model we evaluated. The effect is not merely that agency fails to help: for the smaller models, agentic graph access falls <em>below even the vector baseline</em>, a significant negative result. A model that reads a subgraph well can still be a poor pilot of one.</P>

          <P>We interpret the crossover as a mismatch between where capability is spent. Agentic retrieval converts a reading problem into a tool-orchestration problem — deciding which traversal to issue, parsing intermediate results, maintaining state across turns, and recovering from missteps. For small and quantized models, that orchestration burden exceeds available capability, and errors compound across turns faster than any one tool call can help; the model spends its budget steering rather than answering. Passive context removes that burden entirely, leaving the model with the one thing it does comparatively well — reading evidence laid out in front of it.</P>

          <P>Crucially, the agentic ceiling <em>rises with model size</em>. The deficit narrows as capability grows, which implies a crossover would eventually appear for a model capable enough to amortize the orchestration cost — a prediction consistent with strong results reported for frontier-scale agentic-graph systems. The contribution here is to characterize the regime <em>below</em> that crossover: the small, quantized, on-device models that are exactly where prior agentic-graph work has <strong className="text-foreground">not</strong> looked, and exactly where passive context is the safer design.</P>

          <Observation n={2} title="Reading a subgraph beats driving one">
            For every local model, pre-retrieved graph context beats agentic graph access by +0.48–0.54 F1; for the smaller models agentic graph is significantly <em>worse than vector RAG</em>. The agentic ceiling rises with size, so the advantage is specific to the small/quantized/on-device regime.
          </Observation>

          <h3 className="mt-8 text-base font-semibold text-foreground">Q3: Context as a substitute for parameters</h3>

          <P>Graph context scales gently with model size — from roughly <strong className="text-foreground">0.53 to 0.70 F1</strong> across an ~18× parameter increase — which has a striking practical consequence: a <strong className="text-foreground">1.7B model reading a subgraph (≈0.53) outperforms a 30B model with vector RAG (≈0.29)</strong>. Along the multi-hop axis that defines this task, the right context shape buys more than an order of magnitude of parameters does.</P>

          <P>This is, in effect, a graph-specific and on-device echo of the RETRO observation that retrieval can offset raw scale. We state it cautiously: the substitution holds <em>on this task family</em>, where chaining is the bottleneck and the subgraph supplies exactly the relational structure the small model cannot synthesize on its own. We do not claim context replaces capacity in general — only that, for multi-hop graph QA under deployment constraints, structured context and parameters trade against each other far enough that a small model with the right evidence is the better engineering choice.</P>

          <Observation n={3} title="Context trades against capacity">
            Graph context rises only ≈0.53→0.70 over ~18× parameters, so a 1.7B model reading a subgraph beats a 30B model with vector RAG — a graph-specific, on-device echo of RETRO, scoped to multi-hop QA.
          </Observation>

          <h3 className="mt-8 text-base font-semibold text-foreground">The context-technique ladder</h3>

          <FadeInView className="my-5">
            <MetaqaTechniques />
          </FadeInView>

          <P>To locate <em>why</em> these gaps arise, the comparison above arranges techniques as a ladder of increasing structure: closed-book, iterative text RAG (<strong className="text-foreground">rag_iter</strong>), flat-triple RAG (<strong className="text-foreground">triple_rag</strong>), blind-graph BFS (<strong className="text-foreground">graph_rag_blind</strong>), relation-guided graph (<strong className="text-foreground">graph_rag</strong>), and an oracle upper bound, with agentic access shown alongside. Each rung isolates one hypothesis. The first two ask whether the deficit is really about <em>access</em> to facts: rag_iter tests whether multiple rounds of retrieval suffice, and triple_rag tests whether simply <em>having</em> the relevant facts — even as flat, unstructured triples — is enough. The comparison shows that neither closes the gap: text RAG cannot chain even when it retrieves iteratively, and facts without traversable structure remain well below the structured-graph conditions.</P>

          <P>The remaining rungs decompose the structured advantage. Contrasting blind versus relation-guided BFS isolates the relation-guidance heuristic — whether choosing <em>which</em> relations to expand, rather than expanding breadth-first, is what helps. The oracle upper bound then separates two failure modes that a single score conflates: where the oracle bound sits well above guided-graph, the remaining loss is a <strong className="text-foreground">retrieval</strong> failure (the right context exists but our retriever missed it); where even small models trail the oracle, the loss is a <strong className="text-foreground">reading</strong> failure (the context is present but underused). This second case directly engages the standing threat that small models under-use the context they are given: if oracle context is only modest for the smallest models, part of their deficit is capacity, not retrieval. We leave the exact magnitudes to the accompanying table, reading the ladder qualitatively — each step that adds structure should recover error that the step below could not.</P>

          <Observation n={4} title="The ladder separates retrieval failure from reading failure">
            Iterative and flat-triple RAG test whether multi-round access or bare facts suffice (they do not); blind-vs-guided BFS isolates relation guidance; the oracle bound splits the deficit — gap below oracle is retrieval, gap that persists at the oracle is reading.
          </Observation>

          <h3 className="mt-8 text-base font-semibold text-foreground">Generalization across model families</h3>

          <P>The ordering <strong className="text-foreground">graph_rag ≫ vector ≫ agentic</strong> for small models is not a quirk of one architecture. It reproduces across Qwen3, Qwen2.5, Llama, Mistral, Gemma, Granite, and Phi — distinct pretraining corpora, tokenizers, and instruction-tuning recipes. That consistency is the strongest argument that the crossover is a property of the <em>small-model regime</em> rather than of any single model line: when capability is the binding constraint, the way evidence is shaped matters more than which family produced the model. We do note one expected modulation: tool-tuned families such as Granite, explicitly trained for function-calling, may narrow the agentic gap relative to families without such tuning — consistent with the orchestration-burden account, since tool tuning directly reduces that burden — though in our sweep it does not reverse the ordering at these sizes.</P>

          <Observation n={5} title="The pattern holds across seven model families">
            graph_rag ≫ vector ≫ agentic replicates across Qwen3, Qwen2.5, Llama, Mistral, Gemma, Granite, and Phi, arguing it is a property of the small-model regime, not one architecture. Tool-tuned families (Granite) may narrow the agentic gap without reversing the order.
          </Observation>

          <h3 className="mt-12 text-base font-semibold text-foreground">Internal replication on the sanctions graph</h3>

          <P>The same shape replicates on our second, independently constructed sanctions graph, where graph context rises from roughly <strong className="text-foreground">0.48 to 0.87 F1</strong> and again dominates both vector RAG and agentic access. We report this as <em>secondary</em> evidence and flag its principal limitation plainly: on the sanctions graph, answers are scored against the same graph that supplies the context, making the evaluation graph-oracle-scored and therefore partly circular. It demonstrates that the qualitative ordering is reproducible on a different, larger graph, but it cannot establish absolute accuracy the way the externally-gold MetaQA results do. The weight of our claims rests on Q1–Q3; the sanctions replication corroborates their shape rather than extending them.</P>

          <FadeInView className="mt-5">
            <GapCollapseChart />
          </FadeInView>
          <Caption n={2}>
            Mean F1 vs. model size (log axis) on the sanctions graph, one line per retrieval mode.
            Lines trace the controlled Qwen3 family; faint dots are other sized models; dashed rings
            mark the llama-3.2-3b weak-tool-caller control. Scored against the graph oracle, so read
            as a circular, secondary replication. Hover any point to inspect.
          </Caption>

          <Observation n={6} title="Sanctions graph corroborates the shape (secondary)">
            On an independent sanctions graph, graph_rag (≈0.48→0.87) again dominates vector and agentic access. Because answers are scored against the source graph, this evidence is circular and treated as secondary corroboration of the MetaQA findings.
          </Observation>

          <FadeInView className="mt-6">
            <StatGrid />
          </FadeInView>
          <Caption n={3} kind="Table">
            Summary statistics across the sanctions sweep.
          </Caption>

        </Section>

        {/* ── §5 worked example ───────────────────────────────────────── */}
        <Section
          num="5"
          id="trace"
          title="A worked example"
          lead="One question, two engines, recorded live. Vector RAG retrieves similar text and guesses; the agentic graph resolves the entity and walks the edges, citing each answer to a source list."
        >
          <FadeInView>
            <TraceDemo />
          </FadeInView>
          <Caption n={4}>
            Recorded runs of {ce.demo.model?.name} (on-device). Select a question; the agentic
            traversal replays one tool call at a time. The "answers found" scorecard counts matches
            against the oracle gold set.
          </Caption>
        </Section>

        {/* ── §6 generalization ───────────────────────────────────────── */}
        <Section
          num="6"
          id="domains"
          title="Generalization across domains"
          lead="A finding on one dataset is a curiosity. The same engine — zero per-domain code, schema introspected at query time — was pointed at four more public graphs to see whether the lift survives."
        >
          <FadeInView>
            <DomainReplication />
          </FadeInView>
          <Caption n={5}>
            Per-domain jump from vector RAG (amber) to graph context (blue), local models, mean F1
            over {ce.domains?.nQuestionsPerDomain ?? 10} questions each. The closed-book tick marks
            the no-retrieval floor.
          </Caption>
          {dMin && dMax && (
            <Observation n={7} title="The lift replicates — and varies honestly">
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
          lead="For high-stakes work the failure that matters is not low accuracy but confident fabrication — and the second axis is what each mode costs to run."
        >
          <FadeInView>
            <CostAccuracyScatter />
          </FadeInView>
          <Caption n={6}>
            Tokens per query (log) vs. mean F1, one dot per model × mode. Outlined dots are
            on-device models; faded dots are the frontier ceiling. Up-and-to-the-left is better.
          </Caption>

          <FadeInView className="mt-7">
            <ModeEconomics />
          </FadeInView>
          <Caption n={7}>
            Left: share of named answers resolving to no real graph node (hallucination). Right:
            mean tokens per query. Both by mode.
          </Caption>

          <div className="mt-6">
            <Observation n={8} title="Graph answers are faithful by construction, and cheap">
              Closed-book answers are uncited guesses and fabricate {pct(n0.hallucination_rate)} of
              the time; graph context drops that to {pct(gr.hallucination_rate)} because the answer
              is read off real nodes. And it gets there for {gr.tokens_mean?.toLocaleString()}{" "}
              tokens per query — {tokenRatio.toFixed(1)}× cheaper than the agentic loop's{" "}
              {g.tokens_mean?.toLocaleString()} — making it the pragmatic default for everything
              but the hardest questions.
            </Observation>
          </div>
        </Section>

        {/* ── §8 full results ─────────────────────────────────────────── */}
        <Section
          num="8"
          id="leaderboard"
          title="Full results"
          lead="Mean F1 for every model across the modes. Both graph modes dominate vector RAG at every size; cell shade tracks accuracy and the agentic leader is ringed."
        >
          <FadeInView>
            <Leaderboard />
          </FadeInView>
          <Caption n={8} kind="Table">
            Per-model mean F1 by mode, sorted by agentic-graph accuracy. On-device and frontier
            models tagged.
          </Caption>
        </Section>

        {/* ── §9 discussion ───────────────────────────────────────────── */}
        <Section
          num="9"
          id="discussion"
          title="Discussion"
          lead="What follows if much of the multi-hop deficit is context, not capacity."
        >
          <P>
            The practical consequence is the part I find most exciting. If a well-built, cited
            graph lets a model you run on your own hardware match a frontier model on multi-hop
            investigation, then the whole pipeline — ingestion, resolution, graph, answering — can
            run <strong className="text-foreground">air-gapped and sovereign</strong>, with no
            data leaving the machine and no frontier API in the loop. That is exactly the
            constraint in the domains where this kind of work matters most: security, health,
            finance.
          </P>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <FadeInView>
              <SpotlightCard className="flex h-full gap-3 p-5">
                <Lock className="size-5 shrink-0 text-[var(--cat-projects)]" />
                <div>
                  <div className="text-sm font-semibold text-foreground">On-device, frontier-grade</div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Local models on one workstation reach frontier-grade multi-hop accuracy when
                    given the graph. Cost: $0, fully air-gapped.
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
        <Section num="10" id="limitations" title="Limitations & threats to validity" lead="The result — that a structured subgraph lets a small local model punch above its weight — rests on a specific experimental frame. Here is where that frame is thin, and what would harden it.">
          <Observation n={1} title="Contamination and memorization">
            <P>MetaQA is built on movie facts that may sit in the pretraining corpus, so a graph-mode win could in principle reflect recall rather than reasoning. We mitigate this by reporting the <strong className="text-foreground">closed-book baseline</strong>, which is near-zero — if the model had memorized the answers, the no-context arm would not collapse, so memorization is not carrying the headline result. This is a mitigation, not an elimination: the only clean fix is an <em>anti-contamination</em> evaluation (e.g. MINTQA / FRAMES) whose facts post-date or fall outside the training distribution, which we have not yet run.</P>
          </Observation>
          <Observation n={2} title="Single seed">
            <P>For GPU-time reasons the headline numbers come from a single sample per question at low temperature. Our confidence intervals are <strong className="text-foreground">paired bootstrap over the question set</strong>, which captures the dominant variance source (which questions you happen to ask), but it does <em>not</em> capture generation stochasticity across seeds. Multiple seeds are deferred to future work, and until then the reported intervals understate total variance.</P>
          </Observation>
          <Observation n={3} title="Agentic arm sampled lighter">
            <P>The agentic mode costs roughly 50s per cell on a single GPU, so it is run on a smaller subset of questions than the passive arms. Its confidence intervals are correspondingly wider, and comparisons against the agentic arm should be read as directional rather than tight.</P>
          </Observation>
          <Observation n={4} title="Clean-KB caveat">
            <P>MetaQA hands us a curated graph with no extraction noise. That is a feature for <em>isolating context format</em> — it lets us attribute the win to structure rather than to a better information-extraction pipeline — but it is also a limitation: it does <strong className="text-foreground">not</strong> test the realistic, noisy IE-built-graph setting that a real deployment faces. A messy-text benchmark such as MuSiQue is needed to close that gap. The sanctions arm does exercise real entity resolution, but its scoring is graph-oracle and therefore circular, so it cannot stand in for end-to-end noise either.</P>
          </Observation>
          <Observation n={5} title="Entity linking is assumed, not evaluated">
            <P>The graph modes start from the benchmark's marked topic entity — a standard KGQA assumption — so end-to-end entity linking from raw text is outside the measured pipeline. In a real system, linking errors would erode some of the structured-context advantage we report.</P>
          </Observation>
          <Observation n={6} title="Retrieval-heuristic specificity">
            <P>Our <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">graph_rag</code> mode uses a <strong className="text-foreground">relation-guided BFS</strong>, and the blind-BFS ablation shows the relation guidance is doing real work rather than just the breadth. But a single hand-designed retriever is not the frontier of subgraph retrieval: a learned or personalized-PageRank retriever (HippoRAG-style) is not yet compared, so we cannot claim our heuristic is optimal — only that it is sufficient.</P>
          </Observation>
          <Observation n={7} title="No frontier ceiling yet">
            <P>We do not yet include a frontier model as an upper reference line (a cost decision). As a result, the question "how close does a structured-context local model get to a frontier model" is <em>not</em> quantified on MetaQA. Our claims are therefore about the gap between local configurations, not about closing the gap to the best available models.</P>
          </Observation>
        </Section>

        {/* ── §11 future work ─────────────────────────────────────────── */}
        <Section num="11" id="future" title="Future work" lead="The limitations above map cleanly onto a roadmap. In rough priority order:">
          <ul className="my-3 ml-5 list-disc space-y-1 text-muted">
            <li><strong className="text-foreground">Frontier ceiling + more seeds</strong> — add a frontier reference line to quantify the local-to-frontier gap, and sample multiple seeds so the confidence intervals capture generation stochasticity, not just question-set variance.</li>
            <li><strong className="text-foreground">MuSiQue</strong> — move from a clean given graph to messy text with an IE-built graph, to test whether the structured-context advantage survives extraction noise.</li>
            <li><strong className="text-foreground">Anti-contamination sets</strong> — run MINTQA / FRAMES to rule out memorization rather than merely bounding it with the closed-book baseline.</li>
            <li><strong className="text-foreground">Better subgraph retrieval</strong> — compare PPR / learned retrievers (HippoRAG-style) against the relation-guided BFS, and ablate the serialization format of the subgraph handed to the model.</li>
            <li><strong className="text-foreground">Quantization sweep</strong> — test Q4 / Q8 / bf16 to see whether quantization degrades agentic tool-use more than passive reading, since the two modes may have different sensitivity to precision loss.</li>
            <li><strong className="text-foreground">Cost/accuracy Pareto and a failure taxonomy</strong> — chart the accuracy-per-dollar/second frontier across modes, and categorize how the agentic loop fails when it fails.</li>
            <li><strong className="text-foreground">Scale</strong> — grow the question set and seed count to tighten all reported intervals, especially for the lightly-sampled agentic arm.</li>
          </ul>
        </Section>

        {/* ── §12 conclusion ──────────────────────────────────────────── */}
        <Section num="12" id="conclusion" title="Conclusion" lead="What did we actually learn, and what should a practitioner do with it.">
          <P>We set out to answer three questions. <strong className="text-foreground">Q1 — does context format matter for a small local model?</strong> Yes, decisively: handing the model a structured subgraph beat both the closed-book baseline (which was near-zero) and flatter context arms, and the gap was large enough to survive paired-bootstrap uncertainty. <strong className="text-foreground">Q2 — does a structured subgraph beat an agentic loop?</strong> On these tasks, passive reading of a relation-guided subgraph matched or exceeded the agentic mode while costing a fraction of the time — the agentic arm's extra machinery did not buy proportionate accuracy. <strong className="text-foreground">Q3 — is the relation guidance doing the work?</strong> The blind-BFS ablation says yes: it is the structure of the retrieved context, not merely its presence, that drives the result.</P>
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
                "Stack: Kuzu (embedded graph), MLX (on-device inference), sentence-transformers (vector baseline), OpenRouter (frontier ceiling only). Engine is local-only; frontier models are a reference ceiling, never in the pipeline.",
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
