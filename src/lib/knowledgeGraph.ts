import {
  knowledgeKindLabels,
  type KnowledgeLink,
  type KnowledgeNode,
  type KnowledgeNodeKind,
} from "@/data/knowledgeGraph";

export const graphCategories = [
  "work",
  "projects",
  "writing",
  "readings",
  "skills",
  "education",
  "personal",
  "resources",
] as const;

export type GraphCategory = (typeof graphCategories)[number];

export interface GraphSearchState {
  types?: string;
  node?: string;
  q?: string;
}

export interface GraphSearchResult {
  node: KnowledgeNode;
  score: number;
  reasons: string[];
}

const stopWords = new Set([
  // generic articles, prepositions, and question words that carry no signal
  "a",
  "about",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "been",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "for",
  "from",
  "get",
  "go",
  "goes",
  "going",
  "got",
  "had",
  "has",
  "have",
  "he",
  "her",
  "here",
  "him",
  "his",
  "how",
  "i",
  "in",
  "into",
  "is",
  "it",
  "its",
  "me",
  "my",
  "of",
  "on",
  "or",
  "she",
  "should",
  "some",
  "tell",
  "that",
  "the",
  "their",
  "them",
  "there",
  "they",
  "this",
  "to",
  "up",
  "was",
  "we",
  "went",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "whom",
  "whose",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
  // the entire graph is about the subject, so the subject's name is pure noise
  "christopher",
  "chris",
  "nielson",
]);

const aliases: Record<string, string[]> = {
  ai: ["agent", "agents", "llm", "model"],
  agent: ["agents", "agentic"],
  agents: ["agent", "agentic"],
  database: ["databases", "postgresql", "postgres", "sql", "snowflake"],
  databases: ["database", "postgresql", "postgres", "sql", "snowflake"],
  job: ["work", "experience", "professional"],
  machine: ["ml"],
  ml: ["machine", "learning"],
  portfolio: ["project", "projects", "work"],
  risk: ["financial", "pfe"],
  // education vocabulary so school/degree questions reach the institutions
  school: ["university", "college", "education"],
  schools: ["university", "college", "education"],
  university: ["school", "college", "education"],
  college: ["school", "university", "education"],
  study: ["education", "degree"],
  studied: ["education", "degree"],
  degree: ["education", "graduate"],
  education: ["school", "university", "degree"],
  graduate: ["degree", "education"],
  major: ["degree"],
  // surface the actual language/skill nodes for "what languages does he know"
  language: ["python", "typescript", "sql"],
  languages: ["python", "typescript", "sql", "language"],
  programming: ["python", "typescript", "code"],
  coding: ["python", "typescript", "code"],
};

const categoryLabels: Record<GraphCategory, string> = {
  work: "Work",
  projects: "Projects",
  writing: "Writing",
  readings: "Readings",
  skills: "Skills",
  education: "Education",
  personal: "Personal",
  resources: "Resources",
};

const categoryUrlTokens: Record<GraphCategory, string> = {
  work: "work",
  projects: "project",
  writing: "article",
  readings: "reading",
  skills: "skill",
  education: "education",
  personal: "personal",
  resources: "resource",
};

const urlTokenCategories = new Map<string, GraphCategory>([
  ...graphCategories.map(
    (category) => [categoryUrlTokens[category], category] as const,
  ),
  ["projects", "projects"],
  ["writing", "writing"],
  ["readings", "readings"],
  ["skills", "skills"],
  ["resources", "resources"],
]);

const categoryKinds: Record<GraphCategory, KnowledgeNodeKind[]> = {
  work: ["profile", "experience", "domain", "concept"],
  projects: ["project"],
  writing: ["article"],
  readings: ["reading"],
  skills: ["skill", "model"],
  education: ["course"],
  personal: ["personal"],
  resources: ["resource"],
};

/**
 * Maps the *intent* of a question to the kinds of nodes that should answer it.
 * Plain keyword matching can't tell that "what school did he go to" wants the
 * institutions (CMU, FSU) rather than the dozens of individual courses, so each
 * rule boosts a specific slice of the graph when its keywords appear.
 */
const intentRules: Array<{
  reason: string;
  keywords: string[];
  applies: (node: KnowledgeNode) => boolean;
  weight: number;
}> = [
  {
    reason: "education",
    keywords: [
      "school",
      "schools",
      "university",
      "universities",
      "college",
      "colleges",
      "degree",
      "degrees",
      "study",
      "studied",
      "studies",
      "studying",
      "graduate",
      "graduated",
      "graduation",
      "undergraduate",
      "education",
      "educated",
      "academic",
      "academics",
      "major",
      "majored",
      "minor",
      "alma",
      "gpa",
    ],
    applies: (node) =>
      node.kind === "experience" && getNodeCategory(node) === "education",
    weight: 16,
  },
  {
    reason: "coursework",
    keywords: [
      "course",
      "courses",
      "class",
      "classes",
      "coursework",
      "curriculum",
      "transcript",
      "subject",
      "subjects",
    ],
    applies: (node) => node.kind === "course",
    weight: 12,
  },
  {
    reason: "work",
    keywords: [
      "work",
      "works",
      "worked",
      "working",
      "job",
      "jobs",
      "career",
      "employer",
      "employed",
      "employment",
      "company",
      "companies",
      "professional",
      "professionally",
      "role",
      "position",
    ],
    applies: (node) =>
      node.kind === "experience" && getNodeCategory(node) === "work",
    weight: 14,
  },
  {
    reason: "writing",
    keywords: [
      "article",
      "articles",
      "wrote",
      "write",
      "writes",
      "written",
      "writing",
      "blog",
      "blogs",
      "post",
      "posts",
      "publication",
      "publications",
      "published",
      "essay",
      "essays",
    ],
    applies: (node) => node.kind === "article",
    weight: 14,
  },
  {
    reason: "agent systems",
    keywords: ["ai", "agent", "agents", "agentic"],
    applies: (node) => node.id === "agent-infrastructure",
    weight: 14,
  },
  {
    reason: "projects",
    keywords: [
      "project",
      "projects",
      "build",
      "built",
      "building",
      "builds",
      "made",
      "make",
      "makes",
      "ship",
      "shipped",
      "created",
      "create",
      "creates",
      "developed",
      "develop",
      "app",
      "apps",
    ],
    applies: (node) => node.kind === "project",
    weight: 10,
  },
  {
    reason: "skills",
    keywords: [
      "skill",
      "skills",
      "technology",
      "technologies",
      "tech",
      "language",
      "languages",
      "tool",
      "tools",
      "stack",
      "framework",
      "frameworks",
      "proficient",
      "expertise",
      "programming",
      "coding",
      "code",
    ],
    applies: (node) => node.kind === "skill",
    weight: 10,
  },
  {
    reason: "personal",
    keywords: [
      "hobby",
      "hobbies",
      "personal",
      "fun",
      "interest",
      "interests",
      "sport",
      "sports",
      "pet",
      "pets",
      "dog",
      "hobbies",
      "leisure",
    ],
    applies: (node) => node.kind === "personal",
    weight: 12,
  },
  {
    reason: "resource",
    keywords: ["resume", "cv", "contact", "email", "linkedin", "github", "reach"],
    applies: (node) => node.kind === "resource",
    weight: 8,
  },
  {
    reason: "local LLM inference",
    keywords: [
      "local",
      "locally",
      "ollama",
      "mlx",
      "inference",
      "quantization",
      "quantized",
      "gguf",
      "on-device",
      "offline",
      "open-weight",
      "open-weights",
    ],
    applies: (node) =>
      node.kind === "model" ||
      [
        "local-llm-inference",
        "small-models-thesis",
        "ollama",
        "mlx",
        "mac-studio",
      ].includes(node.id),
    weight: 10,
  },
];

function detectIntentRules(query: string) {
  const words = new Set(
    query
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/)
      .filter(Boolean),
  );

  return intentRules.filter((rule) =>
    rule.keywords.some((keyword) => words.has(keyword)),
  );
}

export function getCategoryLabel(category: GraphCategory): string {
  return categoryLabels[category];
}

export function getNodeCategory(node: KnowledgeNode): GraphCategory {
  if (
    node.kind === "experience" &&
    (node.id === "cmu" || node.id === "fsu")
  ) {
    return "education";
  }

  return (
    graphCategories.find((category) =>
      categoryKinds[category].includes(node.kind),
    ) ?? "work"
  );
}

export function parseGraphTypes(value?: string): Set<GraphCategory> {
  if (!value) {
    return new Set();
  }

  return new Set(
    value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .map((item) => urlTokenCategories.get(item))
      .filter((item): item is GraphCategory => Boolean(item)),
  );
}

export function serializeGraphTypes(types: Iterable<GraphCategory>): string {
  const selected = new Set(types);
  return graphCategories
    .filter((category) => selected.has(category))
    .map((category) => categoryUrlTokens[category])
    .join(",");
}

export function parseGraphSearch(
  search: Record<string, unknown>,
): GraphSearchState {
  return {
    types: typeof search.types === "string" ? search.types : undefined,
    node: typeof search.node === "string" ? search.node : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
  };
}

export function nodeMatchesCategories(
  node: KnowledgeNode,
  categories: ReadonlySet<GraphCategory>,
): boolean {
  return categories.size === 0 || categories.has(getNodeCategory(node));
}

function tokenize(value: string): string[] {
  const baseTokens = value
    .toLowerCase()
    .replace(/[^a-z0-9+#.-]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));
  const expanded = new Set(baseTokens);

  for (const token of baseTokens) {
    for (const alias of aliases[token] ?? []) {
      expanded.add(alias);
    }
  }

  return [...expanded];
}

function splitWords(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter(Boolean);
}

/**
 * Bounded Levenshtein: returns true when `a` can be turned into `b` in at most
 * `max` single-character edits. Powers typo tolerance ("pyton" → "python")
 * without the cost of a full distance: a length-gap pre-check and a per-row
 * minimum let it bail the moment the budget is blown.
 */
function withinEditDistance(a: string, b: string, max: number): boolean {
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > max) return false;
  if (a === b) return true;

  let prev = Array.from({ length: lb + 1 }, (_, j) => j);
  let curr = new Array<number>(lb + 1);

  for (let i = 1; i <= la; i++) {
    curr[0] = i;
    let rowMin = i;
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        prev[j]! + 1, // deletion
        curr[j - 1]! + 1, // insertion
        prev[j - 1]! + cost, // substitution
      );
      curr[j] = value;
      if (value < rowMin) rowMin = value;
    }
    // Every cell in this row already exceeds the budget, so no completion can
    // come back under it — stop early.
    if (rowMin > max) return false;
    [prev, curr] = [curr, prev];
  }

  return prev[lb]! <= max;
}

/**
 * Scores how well a single query token matches a word from node text, in tiers
 * of decreasing confidence. Returns the best tier found (tiers don't stack):
 *   1.00  exact whole word            ("react" → "react")
 *   0.60  prefix, token ≥ 4           ("postgres" → "postgresql")
 *   0.45  infix, token ≥ 5            ("script" → "typescript")
 *   0.35  fuzzy, token ≥ 5            ("pyton" → "python")
 * Short tokens stay whole-word-only so "ai" can't leak into "dom*ai*n".
 */
function tokenMatchStrength(
  token: string,
  words: string[],
  wordSet: ReadonlySet<string>,
): number {
  if (wordSet.has(token)) return 1;
  if (token.length < 4) return 0;

  const fuzzyBudget = token.length >= 8 ? 2 : 1;
  let best = 0;

  for (const word of words) {
    if (word.startsWith(token)) return 0.6; // best possible non-exact tier
    if (token.length >= 5) {
      if (word.includes(token)) best = Math.max(best, 0.45);
      else if (best < 0.35 && withinEditDistance(token, word, fuzzyBudget))
        best = Math.max(best, 0.35);
    }
  }

  return best;
}

function countMatches(
  haystack: string,
  tokens: string[],
  idf?: ReadonlyMap<string, number>,
): number {
  const words = splitWords(haystack);
  if (words.length === 0) return 0;
  const wordSet = new Set(words);

  return tokens.reduce((score, token) => {
    const strength = tokenMatchStrength(token, words, wordSet);
    if (strength === 0) return score;
    // Rare terms (low document frequency) count for more than corpus-wide
    // filler like "engineering"; idf defaults to 1 when no index is supplied.
    return score + strength * (idf?.get(token) ?? 1);
  }, 0);
}

export type ConnectionIndex = Map<
  string,
  Array<{ node: KnowledgeNode; relation: string }>
>;

export function buildConnectionIndex(
  nodes: KnowledgeNode[],
  links: KnowledgeLink[],
): ConnectionIndex {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const connections: ConnectionIndex = new Map();

  const append = (
    key: string,
    node: KnowledgeNode,
    relation: string,
  ) => {
    // Mutate the existing array instead of re-spreading it on every link —
    // the old [...prev, item] form was O(degree²) for high-degree hubs like
    // the profile node, which this index rebuilds on every search keystroke.
    const list = connections.get(key);
    if (list) list.push({ node, relation });
    else connections.set(key, [{ node, relation }]);
  };

  for (const link of links) {
    const source = nodesById.get(link.source);
    const target = nodesById.get(link.target);

    if (!source || !target) {
      continue;
    }

    append(link.source, target, link.relation);
    append(link.target, source, link.relation);
  }

  return connections;
}

/**
 * Precomputed, query-independent search structures. The connection graph and
 * the per-term document frequencies never change, so building them once (rather
 * than on every keystroke) keeps live search cheap and lets ranking weight rare
 * terms via IDF.
 */
export interface SearchIndex {
  connections: ConnectionIndex;
  /** How many nodes contain each term across their searchable text. */
  documentFrequency: Map<string, number>;
  totalDocuments: number;
}

/** The own-text words a node contributes to the corpus (no neighbors). */
function nodeDocumentWords(node: KnowledgeNode): string[] {
  return splitWords(
    [
      node.label,
      node.tags.join(" "),
      node.description,
      ...(node.details ?? []),
      ...(node.highlights ?? []).map(
        (highlight) => `${highlight.label} ${highlight.value}`,
      ),
      node.eyebrow ?? "",
      knowledgeKindLabels[node.kind],
      getNodeCategory(node),
    ].join(" "),
  );
}

export function buildSearchIndex(
  nodes: KnowledgeNode[],
  links: KnowledgeLink[],
): SearchIndex {
  const documentFrequency = new Map<string, number>();

  for (const node of nodes) {
    // Count each term once per node so frequency reflects how many nodes use a
    // term, not how often it's repeated within one.
    for (const word of new Set(nodeDocumentWords(node))) {
      documentFrequency.set(word, (documentFrequency.get(word) ?? 0) + 1);
    }
  }

  return {
    connections: buildConnectionIndex(nodes, links),
    documentFrequency,
    totalDocuments: nodes.length,
  };
}

// How hard IDF pulls ranking toward rare terms. Kept gentle so a distinctive
// match (e.g. "graphrag") edges ahead of a generic one ("engineering") without
// letting term rarity overwhelm the field weights below.
const IDF_STRENGTH = 0.35;

function idfWeight(token: string, index: SearchIndex): number {
  const df = index.documentFrequency.get(token) ?? 0;
  // Out-of-vocabulary tokens are only reachable via fuzzy/infix matches; treat
  // them as rare-but-capped (as if they appeared in a single node).
  const safeDf = df > 0 ? df : 1;
  const raw = Math.log((index.totalDocuments + 1) / (safeDf + 1));
  return 1 + IDF_STRENGTH * Math.max(0, raw);
}

export function searchKnowledgeGraph(
  query: string,
  nodes: KnowledgeNode[],
  links: KnowledgeLink[],
  limit = 8,
  precomputedIndex?: SearchIndex,
): GraphSearchResult[] {
  const normalizedQuery = query.toLowerCase().trim();
  const tokens = tokenize(query);
  const activeIntents = detectIntentRules(query);

  if (tokens.length === 0 && activeIntents.length === 0) {
    return [];
  }

  // Reuse a caller-supplied index where available — the connection graph and
  // term frequencies are static, so there's no reason to rebuild them on every
  // keystroke.
  const index = precomputedIndex ?? buildSearchIndex(nodes, links);
  const connections = index.connections;
  // Weight each query term by how rare it is across the corpus, computed once.
  const idf = new Map(tokens.map((token) => [token, idfWeight(token, index)]));

  return nodes
    .map((node) => {
      const labelMatches = countMatches(node.label, tokens, idf);
      const tagMatches = countMatches(node.tags.join(" "), tokens, idf);
      const descriptionMatches = countMatches(node.description, tokens, idf);
      const detailMatches = countMatches(
        [
          ...(node.details ?? []),
          ...(node.highlights ?? []).map(
            (highlight) => `${highlight.label} ${highlight.value}`,
          ),
        ].join(" "),
        tokens,
        idf,
      );
      const eyebrowMatches = countMatches(node.eyebrow ?? "", tokens, idf);
      const kindMatches = countMatches(
        `${knowledgeKindLabels[node.kind]} ${getNodeCategory(node)}`,
        tokens,
        idf,
      );
      const linked = connections.get(node.id) ?? [];
      const relationMatches = countMatches(
        linked.map(({ relation }) => relation).join(" "),
        tokens,
        idf,
      );
      const neighborMatches = countMatches(
        linked
          .map(({ node: neighbor }) =>
            [neighbor.label, neighbor.description, ...neighbor.tags].join(" "),
          )
          .join(" "),
        tokens,
        idf,
      );

      const reasons: string[] = [];

      let intentMatches = 0;
      for (const rule of activeIntents) {
        if (rule.applies(node)) {
          intentMatches += rule.weight;
          if (!reasons.includes(rule.reason)) {
            reasons.push(rule.reason);
          }
        }
      }

      const score =
        labelMatches * 9 +
        tagMatches * 6 +
        descriptionMatches * 4 +
        detailMatches * 2 +
        eyebrowMatches * 3 +
        kindMatches * 3 +
        relationMatches * 4 +
        neighborMatches * 1.5 +
        intentMatches +
        (node.importance ?? 1) * 0.15 +
        (normalizedQuery.includes(node.label.toLowerCase()) ? 18 : 0) +
        (node.kind === "project" &&
        /\b(build|built|project|projects|ship|shipped)\b/.test(normalizedQuery)
          ? 12
          : 0);

      if (labelMatches) reasons.push("name");
      if (tagMatches) reasons.push("tags");
      if (descriptionMatches || eyebrowMatches || detailMatches)
        reasons.push("description");
      if (kindMatches) reasons.push("type");
      if (relationMatches) reasons.push("relationships");
      if (neighborMatches) reasons.push("connected context");

      return { node, score, reasons };
    })
    // Require a real match signal. The importance baseline and label/keyword
    // bonuses only ever break ties *between matches* — on their own they let
    // high-importance nodes surface for queries (typos, gibberish) that match
    // nothing, which is just noise.
    .filter((result) => result.reasons.length > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        (right.node.importance ?? 1) - (left.node.importance ?? 1) ||
        left.node.label.localeCompare(right.node.label),
    )
    .slice(0, limit);
}

export function expandResultNodeIds(
  results: GraphSearchResult[],
  links: KnowledgeLink[],
): Set<string> {
  const directIds = new Set(results.map((result) => result.node.id));
  const expanded = new Set(directIds);

  for (const link of links) {
    if (directIds.has(link.source) && directIds.has(link.target)) {
      expanded.add(link.source);
      expanded.add(link.target);
    }
  }

  return expanded;
}
