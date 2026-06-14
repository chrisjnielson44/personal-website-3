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
  skills: "Skills",
  education: "Education",
  personal: "Personal",
  resources: "Resources",
};

const categoryUrlTokens: Record<GraphCategory, string> = {
  work: "work",
  projects: "project",
  writing: "article",
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
  ["skills", "skills"],
  ["resources", "resources"],
]);

const categoryKinds: Record<GraphCategory, KnowledgeNodeKind[]> = {
  work: ["profile", "experience", "domain", "concept"],
  projects: ["project"],
  writing: ["article"],
  skills: ["skill"],
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

function countMatches(haystack: string, tokens: string[]): number {
  const words = haystack
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter(Boolean);
  const wordSet = new Set(words);

  return tokens.reduce((score, token) => {
    if (wordSet.has(token)) {
      // Whole-word hit: the strongest, least ambiguous signal.
      return score + 1;
    }

    // Prefix hit handles simple morphology (school/schools, agent/agents,
    // postgres/postgresql) without the false positives substring matching
    // produced (e.g. "ai" matching "domain").
    if (token.length >= 4 && words.some((word) => word.startsWith(token))) {
      return score + 0.6;
    }

    return score;
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

export function searchKnowledgeGraph(
  query: string,
  nodes: KnowledgeNode[],
  links: KnowledgeLink[],
  limit = 8,
  precomputedConnections?: ConnectionIndex,
): GraphSearchResult[] {
  const normalizedQuery = query.toLowerCase().trim();
  const tokens = tokenize(query);
  const activeIntents = detectIntentRules(query);

  if (tokens.length === 0 && activeIntents.length === 0) {
    return [];
  }

  // Reuse a caller-supplied index where available — the connection graph is
  // static, so there's no reason to rebuild it on every keystroke.
  const connections =
    precomputedConnections ?? buildConnectionIndex(nodes, links);

  return nodes
    .map((node) => {
      const labelMatches = countMatches(node.label, tokens);
      const tagMatches = countMatches(node.tags.join(" "), tokens);
      const descriptionMatches = countMatches(node.description, tokens);
      const eyebrowMatches = countMatches(node.eyebrow ?? "", tokens);
      const kindMatches = countMatches(
        `${knowledgeKindLabels[node.kind]} ${getNodeCategory(node)}`,
        tokens,
      );
      const linked = connections.get(node.id) ?? [];
      const relationMatches = countMatches(
        linked.map(({ relation }) => relation).join(" "),
        tokens,
      );
      const neighborMatches = countMatches(
        linked
          .map(({ node: neighbor }) =>
            [neighbor.label, neighbor.description, ...neighbor.tags].join(" "),
          )
          .join(" "),
        tokens,
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
      if (descriptionMatches || eyebrowMatches) reasons.push("description");
      if (kindMatches) reasons.push("type");
      if (relationMatches) reasons.push("relationships");
      if (neighborMatches) reasons.push("connected context");

      return { node, score, reasons };
    })
    .filter((result) => result.score > 0.5)
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
