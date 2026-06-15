import {
  knowledgeLinks,
  knowledgeNodes,
} from "@/data/knowledgeGraph";
import { describe, expect, it } from "vitest";
import {
  expandResultNodeIds,
  getNodeCategory,
  nodeMatchesCategories,
  parseGraphSearch,
  parseGraphTypes,
  searchKnowledgeGraph,
  serializeGraphTypes,
} from "./knowledgeGraph";

describe("graph search state", () => {
  it("parses supported URL values and ignores non-string values", () => {
    expect(
      parseGraphSearch({
        types: "projects,writing",
        node: "portfolio",
        q: "agent systems",
        ignored: 12,
      }),
    ).toEqual({
      types: "projects,writing",
      node: "portfolio",
      q: "agent systems",
    });
  });

  it("round-trips categories in stable display order", () => {
    const parsed = parseGraphTypes("article,project,invalid");

    expect([...parsed]).toEqual(["writing", "projects"]);
    expect(serializeGraphTypes(parsed)).toBe("project,article");
  });
});

describe("graph categories", () => {
  it("treats schools and courses as education", () => {
    const cmu = knowledgeNodes.find((node) => node.id === "cmu")!;
    const course = knowledgeNodes.find((node) =>
      node.id.startsWith("course-"),
    )!;

    expect(getNodeCategory(cmu)).toBe("education");
    expect(getNodeCategory(course)).toBe("education");
    expect(nodeMatchesCategories(cmu, new Set(["education"]))).toBe(true);
    expect(nodeMatchesCategories(cmu, new Set(["work"]))).toBe(false);
  });

  it("shows every node when no category is selected", () => {
    expect(
      knowledgeNodes.every((node) =>
        nodeMatchesCategories(node, new Set()),
      ),
    ).toBe(true);
  });
});

describe("local graph retrieval", () => {
  it("ranks agent projects for a natural-language question", () => {
    const results = searchKnowledgeGraph(
      "What has Christopher built with AI agents?",
      knowledgeNodes,
      knowledgeLinks,
    );
    const ids = results.map((result) => result.node.id);

    expect(ids).toContain("agent-infrastructure");
    expect(
      ids.some((id) => id === "enterprise-risk-mcp" || id === "amats"),
    ).toBe(true);
    expect(results[0]!.reasons.length).toBeGreaterThan(0);
  });

  it("uses tags and connected relationships for risk questions", () => {
    const results = searchKnowledgeGraph(
      "financial risk machine learning",
      knowledgeNodes,
      knowledgeLinks,
    );

    expect(results[0]!.node.id).toBe("financial-risk");
    expect(
      results.some((result) => result.reasons.includes("connected context")),
    ).toBe(true);
  });

  it("answers education questions with the schools, not the courses", () => {
    const results = searchKnowledgeGraph(
      "What school did Christopher go to?",
      knowledgeNodes,
      knowledgeLinks,
    );
    const ids = results.map((result) => result.node.id);

    // The two institutions outrank any individual course.
    expect(ids.slice(0, 2)).toEqual(expect.arrayContaining(["cmu", "fsu"]));
    const firstCourseRank = ids.findIndex((id) => id.startsWith("course-"));
    if (firstCourseRank !== -1) {
      expect(firstCourseRank).toBeGreaterThan(1);
    }
  });

  it("ignores the subject's own name as a search term", () => {
    const withName = searchKnowledgeGraph(
      "Christopher's degree",
      knowledgeNodes,
      knowledgeLinks,
    ).map((result) => result.node.id);
    const withoutName = searchKnowledgeGraph(
      "degree",
      knowledgeNodes,
      knowledgeLinks,
    ).map((result) => result.node.id);

    expect(withName).toEqual(withoutName);
  });

  it("routes employment questions to work experience", () => {
    const results = searchKnowledgeGraph(
      "Where does Christopher work?",
      knowledgeNodes,
      knowledgeLinks,
    );

    expect(results[0]!.node.id).toBe("bny");
  });

  it("routes course questions to transcript courses", () => {
    const results = searchKnowledgeGraph(
      "What classes did he take?",
      knowledgeNodes,
      knowledgeLinks,
    );

    expect(results.some((result) => result.node.id.startsWith("course-"))).toBe(
      true,
    );
  });

  it("does not match tokens as substrings of unrelated words", () => {
    // "ai" must not match "dom-ai-n" (the kind label of several nodes); only
    // genuinely AI-related nodes should rank.
    const results = searchKnowledgeGraph(
      "AI agents",
      knowledgeNodes,
      knowledgeLinks,
    );
    const ids = results.map((result) => result.node.id);

    expect(ids).toContain("agent-infrastructure");
    // financial-risk's only tie to the query would be "ai" inside "domain";
    // with word-boundary matching it must not appear.
    expect(ids).not.toContain("financial-risk");
  });

  it("tolerates typos via bounded edit distance", () => {
    const pyton = searchKnowledgeGraph(
      "pyton",
      knowledgeNodes,
      knowledgeLinks,
    ).map((result) => result.node.id);
    const typescirpt = searchKnowledgeGraph(
      "typescirpt",
      knowledgeNodes,
      knowledgeLinks,
    ).map((result) => result.node.id);

    expect(pyton).toContain("python");
    expect(typescirpt).toContain("typescript");
  });

  it("matches mid-word substrings for longer tokens", () => {
    // "script" should reach "typescript" even though it is neither a whole word
    // nor a prefix of it.
    const ids = searchKnowledgeGraph(
      "script",
      knowledgeNodes,
      knowledgeLinks,
    ).map((result) => result.node.id);

    expect(ids).toContain("typescript");
  });

  it("returns nothing for queries that match no node", () => {
    // Previously high-importance nodes leaked through on the importance floor
    // alone; a no-match query must now come back empty.
    expect(
      searchKnowledgeGraph("xyzzy", knowledgeNodes, knowledgeLinks),
    ).toEqual([]);
  });

  it("never surfaces a node without a real match reason", () => {
    const results = searchKnowledgeGraph(
      "python",
      knowledgeNodes,
      knowledgeLinks,
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.reasons.length > 0)).toBe(true);
  });

  it("lets a rare term outrank a common one (IDF weighting)", () => {
    // "context" is corpus-wide filler; "graphrag" is distinctive, so a GraphRAG
    // node should lead rather than something that only matched "context".
    const results = searchKnowledgeGraph(
      "graphrag context",
      knowledgeNodes,
      knowledgeLinks,
    );

    expect(results[0]!.node.id).toMatch(/graphrag/);
  });

  it("expands evidence paths only between ranked result nodes", () => {
    const results = searchKnowledgeGraph(
      "GraphRAG context",
      knowledgeNodes,
      knowledgeLinks,
      5,
    );
    const expanded = expandResultNodeIds(results, knowledgeLinks);

    for (const result of results) {
      expect(expanded.has(result.node.id)).toBe(true);
    }
    expect(expanded.size).toBe(results.length);
  });
});
