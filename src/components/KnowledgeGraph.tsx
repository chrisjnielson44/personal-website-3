"use client";

import {
  knowledgeKindLabels,
  knowledgeLinks,
  knowledgeNodes,
  type KnowledgeNode,
  type KnowledgeNodeKind,
} from "@/data/knowledgeGraph";
import { ArticleContent } from "@/components/ArticleContent";
import { getArticleBySlug, formatDate } from "@/data/articles";
import { getTechIcon, type TechIcon } from "@/data/techIcons";
import {
  buildConnectionIndex,
  expandResultNodeIds,
  getCategoryLabel,
  getNodeCategory,
  graphCategories,
  nodeMatchesCategories,
  parseGraphTypes,
  searchKnowledgeGraph,
  serializeGraphTypes,
  type GraphCategory,
  type GraphSearchResult,
  type GraphSearchState,
} from "@/lib/knowledgeGraph";
import {
  drag,
  forceCollide,
  forceLink,
  forceManyBody,
  forceRadial,
  forceSimulation,
  forceX,
  forceY,
  randomLcg,
  select,
  zoom,
  zoomIdentity,
  type Selection,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
  type ZoomBehavior,
} from "d3";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  CircleHelp,
  FileText,
  Focus,
  Hash,
  Link2,
  Minus,
  Move,
  Network,
  Plus,
  Search,
  Tags,
  X,
} from "lucide-react";
import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "motion/react";
import { motion, AnimatePresence, gentleSpring } from "@/components/Motion";

interface GraphNode extends KnowledgeNode, SimulationNodeDatum {
  _dragOriginX?: number;
  _dragOriginY?: number;
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  relation: string;
}

interface KnowledgeGraphProps {
  initialSearch?: GraphSearchState;
}

interface GraphApi {
  applyState: (
    selectedId: string | null,
    visibleIds: ReadonlySet<string>,
    resultIds: ReadonlySet<string>,
  ) => void;
  fitIds: (ids?: ReadonlySet<string>) => void;
  focusNode: (id: string) => void;
  zoomBy: (factor: number) => void;
}

const WORLD_WIDTH = 2600;
const WORLD_HEIGHT = 1440;

const baseNodeRadius: Record<KnowledgeNodeKind, number> = {
  profile: 20,
  experience: 14,
  domain: 14,
  concept: 10,
  skill: 9,
  project: 12,
  article: 11,
  resource: 10,
  personal: 10,
  course: 6,
};

// Each kind gets its own region of the world so categories read as
// separated clusters instead of one central hairball. Relative [x, y]
// in [0, 1]; multiplied by WORLD_* to get the force anchor.
const kindAnchors: Record<KnowledgeNodeKind, [number, number]> = {
  profile: [0.5, 0.46], // center hub
  experience: [0.3, 0.24], // fallback (the three experience nodes are pinned below)
  domain: [0.56, 0.5], // center-right bridge ring around the profile
  concept: [0.72, 0.74], // lower-right
  skill: [0.5, 0.17], // top band
  project: [0.84, 0.5], // right output island
  article: [0.85, 0.22], // upper right
  resource: [0.86, 0.8], // lower right
  personal: [0.13, 0.88], // bottom-left corner
  course: [0.18, 0.58], // left academic island (with FSU)
};

// Singular hub nodes are pinned to exact anchors (no jitter) so the
// professional core and the academic island stay visually distinct:
// FSU anchors the left academic island next to its 46 coursework nodes,
// BNY stays in the professional core near the profile, CMU sits upper-left.
const nodeAnchors: Record<string, [number, number]> = {
  christopher: [0.5, 0.46],
  bny: [0.53, 0.27],
  cmu: [0.3, 0.22],
  fsu: [0.17, 0.5],
};

const nodeLookup = new Map(knowledgeNodes.map((node) => [node.id, node]));
const connectionLookup = buildConnectionIndex(knowledgeNodes, knowledgeLinks);

function getNodeId(node: string | GraphNode): string {
  return typeof node === "string" ? node : node.id;
}

function getNodeImportance(node: KnowledgeNode): number {
  if (node.importance) return node.importance;
  return node.kind === "skill" || node.kind === "project" ? 2 : 1;
}

function getNodeRadius(node: KnowledgeNode): number {
  return baseNodeRadius[node.kind] + (getNodeImportance(node) - 1) * 3;
}

function getAnchor(node: KnowledgeNode): [number, number] {
  // Pinned hub nodes anchor their region exactly (deterministic, no jitter).
  const pinned = nodeAnchors[node.id];
  if (pinned) return pinned;

  const hash = [...node.id].reduce(
    (value, character) =>
      (value * 31 + character.charCodeAt(0)) % 100_003,
    17,
  );
  const base = kindAnchors[node.kind];
  // Courses fan into a wide arc around the academic hub; every other kind
  // stays compact so its cluster reads as a distinct island.
  const spread = node.kind === "course" ? 0.34 : 0.16;

  return [
    Math.max(
      0.05,
      Math.min(0.95, base[0] + (((hash * 17) % 101) / 100 - 0.5) * spread),
    ),
    Math.max(
      0.06,
      Math.min(0.94, base[1] + (((hash * 43) % 101) / 100 - 0.5) * spread),
    ),
  ];
}

function updateUrl(
  categories: ReadonlySet<GraphCategory>,
  selectedId: string | null,
  question: string,
) {
  const url = new URL(window.location.href);
  const types = serializeGraphTypes(categories);

  if (types) url.searchParams.set("types", types);
  else url.searchParams.delete("types");
  if (selectedId) url.searchParams.set("node", selectedId);
  else url.searchParams.delete("node");
  if (question) url.searchParams.set("q", question);
  else url.searchParams.delete("q");

  window.history.replaceState(window.history.state, "", url);
}

export function KnowledgeGraph({ initialSearch = {} }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const graphApiRef = useRef<GraphApi | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const categoryRef = useRef<Set<GraphCategory>>(new Set());
  const resultIdsRef = useRef<Set<string>>(new Set());
  const edgeLabelsVisibleRef = useRef(true);
  const questionInputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const selectNodeRef = useRef<(id: string, focus?: boolean) => void>(
    () => undefined,
  );

  const initialCategories = useMemo(
    () => parseGraphTypes(initialSearch.types),
    [initialSearch.types],
  );
  const initialSelectedId =
    initialSearch.node && nodeLookup.has(initialSearch.node)
      ? initialSearch.node
      : null;
  const initialResults = useMemo(
    () =>
      initialSearch.q
        ? searchKnowledgeGraph(
            initialSearch.q,
            knowledgeNodes,
            knowledgeLinks,
            8,
            connectionLookup,
          )
        : [],
    [initialSearch.q],
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    initialSelectedId,
  );
  const [activeCategories, setActiveCategories] =
    useState<Set<GraphCategory>>(initialCategories);
  const [question, setQuestion] = useState(initialSearch.q ?? "");
  const [submittedQuestion, setSubmittedQuestion] = useState(
    initialSearch.q ?? "",
  );
  const [results, setResults] =
    useState<GraphSearchResult[]>(initialResults);
  const [edgeLabelsVisible, setEdgeLabelsVisible] = useState(true);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestIndex, setSuggestIndex] = useState(-1);

  const selectedNode = selectedNodeId
    ? nodeLookup.get(selectedNodeId) ?? null
    : null;
  const selectedConnections = selectedNode
    ? connectionLookup.get(selectedNode.id) ?? []
    : [];
  const visibleIds = useMemo(
    () =>
      new Set(
        knowledgeNodes
          .filter((node) => nodeMatchesCategories(node, activeCategories))
          .map((node) => node.id),
      ),
    [activeCategories],
  );
  const resultIds = useMemo(
    () => expandResultNodeIds(results, knowledgeLinks),
    [results],
  );
  const drawerOpen = Boolean(selectedNode || submittedQuestion);

  // Tactile press feedback for overlay controls (disabled when the visitor
  // prefers reduced motion). Hover stays as the existing CSS color shifts.
  const prefersReducedMotion = useReducedMotion();
  const tapScale = prefersReducedMotion ? undefined : { scale: 0.94 };

  // Live matches shown in a dropdown while the visitor is still typing.
  const suggestions = useMemo(() => {
    const trimmed = question.trim();
    if (trimmed.length < 2) return [];
    return searchKnowledgeGraph(
      trimmed,
      knowledgeNodes,
      knowledgeLinks,
      6,
      connectionLookup,
    );
  }, [question]);
  const showSuggestions = suggestOpen && suggestions.length > 0;

  useEffect(() => {
    setSuggestIndex(-1);
  }, [suggestions]);

  const selectNode = (id: string, focus = true) => {
    selectedIdRef.current = id;
    setSelectedNodeId(id);
    updateUrl(categoryRef.current, id, submittedQuestion);
    if (focus) requestAnimationFrame(() => graphApiRef.current?.focusNode(id));
  };
  selectNodeRef.current = selectNode;

  const closeDrawer = () => {
    selectedIdRef.current = null;
    setSelectedNodeId(null);
    setSubmittedQuestion("");
    setQuestion("");
    setResults([]);
    resultIdsRef.current = new Set();
    updateUrl(categoryRef.current, null, "");
    graphApiRef.current?.fitIds(visibleIds);
    requestAnimationFrame(() => questionInputRef.current?.focus());
  };

  const toggleCategory = (category: GraphCategory) => {
    setActiveCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      categoryRef.current = next;
      updateUrl(next, selectedIdRef.current, submittedQuestion);
      return next;
    });
  };

  const showAll = () => {
    const next = new Set<GraphCategory>();
    categoryRef.current = next;
    setActiveCategories(next);
    updateUrl(next, selectedIdRef.current, submittedQuestion);
  };

  const pickSuggestion = (id: string) => {
    setSuggestOpen(false);
    setSuggestIndex(-1);
    selectNode(id);
    questionInputRef.current?.blur();
  };

  const handleQuestionKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Escape") {
      if (showSuggestions) {
        event.preventDefault();
        setSuggestOpen(false);
      }
      return;
    }

    if (event.key === "ArrowDown" && !showSuggestions && suggestions.length) {
      event.preventDefault();
      setSuggestOpen(true);
      return;
    }

    if (!showSuggestions) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSuggestIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSuggestIndex((index) =>
        index <= 0 ? suggestions.length - 1 : index - 1,
      );
    } else if (event.key === "Enter" && suggestIndex >= 0) {
      event.preventDefault();
      pickSuggestion(suggestions[suggestIndex]!.node.id);
    }
  };

  const submitQuestion = (event: FormEvent) => {
    event.preventDefault();
    setSuggestOpen(false);
    const normalized = question.trim();
    const nextResults = searchKnowledgeGraph(
      normalized,
      knowledgeNodes,
      knowledgeLinks,
      8,
      connectionLookup,
    );
    const nextResultIds = expandResultNodeIds(nextResults, knowledgeLinks);

    selectedIdRef.current = null;
    resultIdsRef.current = nextResultIds;
    setSelectedNodeId(null);
    setSubmittedQuestion(normalized);
    setResults(nextResults);
    updateUrl(categoryRef.current, null, normalized);
    requestAnimationFrame(() =>
      graphApiRef.current?.fitIds(
        nextResultIds.size > 0 ? nextResultIds : visibleIds,
      ),
    );
  };

  useEffect(() => {
    selectedIdRef.current = selectedNodeId;
    categoryRef.current = activeCategories;
    resultIdsRef.current = resultIds;
    edgeLabelsVisibleRef.current = edgeLabelsVisible;
    graphApiRef.current?.applyState(
      selectedNodeId,
      visibleIds,
      resultIds,
    );
    if (activeCategories.size > 0) {
      graphApiRef.current?.fitIds(visibleIds);
    } else if (resultIds.size === 0 && !selectedNodeId) {
      graphApiRef.current?.fitIds();
    }
  }, [
    activeCategories,
    edgeLabelsVisible,
    resultIds,
    selectedNodeId,
    visibleIds,
  ]);

  useEffect(() => {
    if (!drawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = [
        ...drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]',
        ),
      ];
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  useEffect(() => {
    const container = containerRef.current;
    const svgElement = svgRef.current;
    if (!container || !svgElement) return;

    const svg = select(svgElement);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const graphNodes: GraphNode[] = knowledgeNodes.map((node) => ({ ...node }));
    const graphLinks: GraphLink[] = knowledgeLinks.map((link) => ({ ...link }));
    const neighbors = new Map<string, Set<string>>();
    let viewportWidth = Math.max(container.clientWidth, 320);
    let viewportHeight = Math.max(container.clientHeight, 480);
    let simulation: Simulation<GraphNode, GraphLink>;
    let zoomBehavior: ZoomBehavior<SVGSVGElement, unknown>;
    let nodeSelection: Selection<SVGGElement, GraphNode, SVGGElement, unknown>;
    let linkSelection: Selection<
      SVGLineElement,
      GraphLink,
      SVGGElement,
      unknown
    >;
    let relationSelection: Selection<
      SVGTextElement,
      GraphLink,
      SVGGElement,
      unknown
    >;

    for (const link of graphLinks) {
      const source = getNodeId(link.source);
      const target = getNodeId(link.target);
      neighbors.set(source, new Set(neighbors.get(source)).add(target));
      neighbors.set(target, new Set(neighbors.get(target)).add(source));
    }

    svg
      .attr("viewBox", `0 0 ${viewportWidth} ${viewportHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const canvas = svg.append("g").attr("class", "graph-render-layer");
    const linkLayer = canvas.append("g").attr("aria-hidden", "true");
    const relationLayer = canvas.append("g").attr("aria-hidden", "true");
    const nodeLayer = canvas.append("g");

    linkSelection = linkLayer
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(graphLinks)
      .join("line")
      .attr("class", "knowledge-link")
      .attr("stroke-width", 1);

    relationSelection = relationLayer
      .selectAll<SVGTextElement, GraphLink>("text")
      .data(graphLinks)
      .join("text")
      .attr("class", "knowledge-link-label")
      .attr("text-anchor", "middle")
      .text((link) => link.relation);

    nodeSelection = nodeLayer
      .selectAll<SVGGElement, GraphNode>("g")
      .data(graphNodes)
      .join("g")
      .attr(
        "class",
        (node) =>
          `knowledge-node is-${node.kind} ${
            getNodeImportance(node) >= 3 ? "is-prominent" : ""
          }`,
      )
      .attr("data-importance", (node) => getNodeImportance(node))
      .attr("role", "button")
      .attr("tabindex", 0)
      .attr(
        "aria-label",
        (node) => `${node.label}, ${knowledgeKindLabels[node.kind]}`,
      );

    nodeSelection
      .append("circle")
      .attr("class", "knowledge-node-halo")
      .attr("r", (node) => getNodeRadius(node) + 9);
    nodeSelection
      .append("circle")
      .attr("class", "knowledge-node-ring")
      .attr("r", (node) => getNodeRadius(node) + 4);
    nodeSelection
      .append("circle")
      .attr("class", "knowledge-node-core")
      .attr("r", (node) => getNodeRadius(node))
      .attr("vector-effect", "non-scaling-stroke");
    nodeSelection
      .append("text")
      .attr("class", "knowledge-label")
      .attr("text-anchor", "middle")
      .attr("dy", (node) => getNodeRadius(node) + 16)
      .text((node) => node.label);
    nodeSelection
      .append("title")
      .text(
        (node) =>
          `${node.label} · ${knowledgeKindLabels[node.kind]}\n${node.description}`,
      );

    // Flag "the graph is moving" so CSS can drop the expensive outlined text
    // labels for the duration. Guarded so the class is written once per burst
    // (not every frame), and debounced so labels reappear shortly after the
    // last tick/zoom — covers entrance settle, drag, and pan/zoom uniformly,
    // including the reduced-motion path where the sim is stopped via stop().
    let interacting = false;
    let interactionTimer = 0;
    const markInteracting = () => {
      if (!interacting) {
        interacting = true;
        canvas.classed("is-interacting", true);
      }
      window.clearTimeout(interactionTimer);
      interactionTimer = window.setTimeout(() => {
        interacting = false;
        canvas.classed("is-interacting", false);
      }, 180);
    };

    const updatePositions = () => {
      linkSelection
        .attr("x1", (link) => (link.source as GraphNode).x ?? 0)
        .attr("y1", (link) => (link.source as GraphNode).y ?? 0)
        .attr("x2", (link) => (link.target as GraphNode).x ?? 0)
        .attr("y2", (link) => (link.target as GraphNode).y ?? 0);
      relationSelection
        .attr(
          "x",
          (link) =>
            ((link.source as GraphNode).x! + (link.target as GraphNode).x!) / 2,
        )
        .attr(
          "y",
          (link) =>
            ((link.source as GraphNode).y! + (link.target as GraphNode).y!) / 2,
        );
      nodeSelection.attr(
        "transform",
        (node) => `translate(${node.x ?? 0},${node.y ?? 0})`,
      );
    };

    simulation = forceSimulation(graphNodes)
      .randomSource(randomLcg(0.4187))
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(graphLinks)
          .id((node) => node.id)
          .distance((link) => {
            const source = link.source as GraphNode;
            const target = link.target as GraphNode;
            // Long profile spokes fan the hub's many links across islands
            // instead of dragging neighbours into the center; short course
            // spokes hug each course to FSU on the academic island.
            if (source.kind === "profile" || target.kind === "profile")
              return 300;
            if (source.kind === "course" || target.kind === "course") return 95;
            if (source.kind === "domain" || target.kind === "domain") return 230;
            return 185;
          })
          .strength((link) => {
            const source = link.source as GraphNode;
            const target = link.target as GraphNode;
            return source.kind === "course" || target.kind === "course"
              ? 0.12
              : 0.16;
          }),
      )
      .force(
        "charge",
        forceManyBody<GraphNode>()
          .strength((node) =>
            // Courses repel weakly — the radial ring + collision space them;
            // strong mutual repulsion would re-scatter them into noise.
            // Everything else repels harder, scaled by importance, so hubs
            // carve out room and their labels stop overlapping.
            node.kind === "course"
              ? -95
              : -360 - getNodeImportance(node) * 60,
          )
          .distanceMax(900),
      )
      .force(
        "x",
        forceX<GraphNode>((node) => WORLD_WIDTH * getAnchor(node)[0]).strength(
          // Firm anchoring is what makes the clusters hold: repulsion then
          // spreads nodes WITHIN each region instead of collapsing to one
          // center of mass.
          (node) => (node.kind === "course" ? 0.06 : 0.085),
        ),
      )
      .force(
        "y",
        forceY<GraphNode>((node) => WORLD_HEIGHT * getAnchor(node)[1]).strength(
          (node) => (node.kind === "course" ? 0.06 : 0.085),
        ),
      )
      .force(
        "collision",
        forceCollide<GraphNode>()
          // Pad wider than a label line (labels sit at radius + 16) so
          // neighbouring hub labels never overlap.
          .radius((node) => getNodeRadius(node) + (node.kind === "course" ? 28 : 50))
          .strength(1)
          .iterations(3),
      )
      // Fan the 46 course dots into an arc/halo around the FSU academic hub
      // rather than a filled blob. No-op for every other kind.
      .force(
        "courseRing",
        forceRadial<GraphNode>(
          (node) => (node.kind === "course" ? 360 : 0),
          WORLD_WIDTH * nodeAnchors.fsu![0],
          WORLD_HEIGHT * nodeAnchors.fsu![1],
        ).strength((node) => (node.kind === "course" ? 0.06 : 0)),
      )
      // Cool to rest faster than D3's default. The earlier 0.0162 left the
      // simulation ticking ~7s after the entrance, repositioning every node at
      // 60fps the whole time — the main source of post-load lag. ~0.04 locks
      // the layout in ~3s while still leaving room for the burst to read.
      .alphaDecay(0.04)
      .velocityDecay(0.45)
      .stop();

    // The layout settles and STOPS after the entrance instead of ticking
    // forever. A perpetual alphaTarget kept D3's timer running at ~60fps,
    // rewriting every node/link/label each frame indefinitely, which pegged
    // the main thread and made the whole UI lag. Interactions (drag) re-warm
    // the simulation briefly, then it cools back to rest on its own.
    const FLOAT_ALPHA = 0;

    // Pre-settle once (off-screen) so the camera can frame the eventual
    // layout before the entrance plays.
    for (let index = 0; index < 460; index += 1) simulation.tick();
    updatePositions();

    zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3.4])
      .extent((): [[number, number], [number, number]] => [
        [0, 0],
        [viewportWidth, viewportHeight],
      ])
      .on("zoom", (event) => {
        canvas.attr("transform", event.transform.toString());
        // Reveal the dense skill / concept / course labels only once the
        // user zooms into a region, keeping the overview calm.
        canvas.classed("is-zoomed-in", event.transform.k >= 1.5);
        markInteracting();
      });
    svg.call(zoomBehavior).on("dblclick.zoom", null);

    const fitIds = (ids?: ReadonlySet<string>) => {
      const candidates =
        ids && ids.size > 0
          ? graphNodes.filter((node) => ids.has(node.id))
          : graphNodes;
      if (candidates.length === 0) return;

      const xs = candidates.map((node) => node.x ?? WORLD_WIDTH / 2);
      const ys = candidates.map((node) => node.y ?? WORLD_HEIGHT / 2);
      const minX = Math.min(...xs) - 90;
      const maxX = Math.max(...xs) + 90;
      const minY = Math.min(...ys) - 90;
      const maxY = Math.max(...ys) + 90;
      const boundsWidth = Math.max(maxX - minX, 220);
      const boundsHeight = Math.max(maxY - minY, 220);
      // Clear the floating chrome so the graph frames inside the visible band.
      // Below 960px the toolbar reflows into a full-width row near the top, so
      // it needs a deeper top clearance than the desktop overlay header.
      const compact = viewportWidth <= 960;
      const topClearance = compact ? 120 : 110;
      const bottomClearance = compact ? 100 : 112;
      const usableHeight = Math.max(
        viewportHeight - bottomClearance - topClearance,
        240,
      );

      const widthRatio = boundsWidth / viewportWidth;
      const heightRatio = boundsHeight / usableHeight;
      // "Contain": the whole selection fits within the visible band.
      let scale = 0.94 / Math.max(widthRatio, heightRatio);

      // On portrait phones/tablets a wide graph fit purely to width leaves big
      // empty bands above and below and shrinks every node to an unreadable
      // dot. Zoom in to fill the vertical space instead, letting the graph
      // spill past the left/right edges (it pans) — but never wider than ~1.7x
      // the viewport so it can't drift entirely off-screen.
      if (compact && viewportHeight > viewportWidth) {
        const fillHeight = 0.92 / heightRatio;
        const overflowCap = (1.7 * viewportWidth) / boundsWidth;
        scale = Math.max(scale, Math.min(fillHeight, overflowCap));
      }
      scale = Math.min(scale, 1.6);
      const x = viewportWidth / 2 - scale * (minX + maxX) / 2;
      const y =
        topClearance + usableHeight / 2 - scale * (minY + maxY) / 2 + 18;
      const transform = zoomIdentity.translate(x, y).scale(scale);

      svg
        .transition()
        .duration(reducedMotion ? 0 : 240)
        .call(zoomBehavior.transform, transform);
    };

    const focusNode = (id: string) => {
      const node = graphNodes.find((candidate) => candidate.id === id);
      if (!node) return;
      const phone = viewportWidth <= 767;
      const scale = viewportWidth <= 960 ? 1.05 : 1.35;
      // Desktop / tablet: nudge left so the right-side inspector panel doesn't
      // cover the node. Phone: the inspector is a bottom sheet, so lift the node
      // into the visible strip above it instead of centring it underneath.
      const offsetX = phone ? 0 : -Math.min(viewportWidth * 0.12, 150);
      const targetY = phone ? viewportHeight * 0.17 : viewportHeight / 2;
      const transform = zoomIdentity
        .translate(viewportWidth / 2 + offsetX, targetY)
        .scale(scale)
        .translate(-(node.x ?? 0), -(node.y ?? 0));
      svg
        .transition()
        .duration(reducedMotion ? 0 : 220)
        .call(zoomBehavior.transform, transform);
    };

    const applyState = (
      selectedId: string | null,
      visibleNodeIds: ReadonlySet<string>,
      matchedIds: ReadonlySet<string>,
    ) => {
      const selectedNeighbors = selectedId
        ? neighbors.get(selectedId) ?? new Set<string>()
        : new Set<string>();
      const hasResults = matchedIds.size > 0;

      nodeSelection
        .classed("is-active", (node) => node.id === selectedId)
        .classed(
          "is-related",
          (node) =>
            Boolean(selectedId) &&
            (node.id === selectedId || selectedNeighbors.has(node.id)),
        )
        .classed("is-result", (node) => matchedIds.has(node.id))
        .classed("is-muted", (node) => {
          if (!visibleNodeIds.has(node.id)) return true;
          if (hasResults) return !matchedIds.has(node.id);
          if (selectedId)
            return node.id !== selectedId && !selectedNeighbors.has(node.id);
          return false;
        })
        .classed("is-filtered", (node) => !visibleNodeIds.has(node.id))
        .attr("aria-hidden", (node) =>
          visibleNodeIds.has(node.id) ? null : "true",
        )
        .attr("tabindex", (node) => (visibleNodeIds.has(node.id) ? 0 : -1));

      linkSelection
        .classed("is-active", (link) => {
          const source = getNodeId(link.source);
          const target = getNodeId(link.target);
          return (
            (selectedId !== null &&
              (source === selectedId || target === selectedId)) ||
            (hasResults && matchedIds.has(source) && matchedIds.has(target))
          );
        })
        .classed("is-muted", (link) => {
          const source = getNodeId(link.source);
          const target = getNodeId(link.target);
          if (!visibleNodeIds.has(source) || !visibleNodeIds.has(target))
            return true;
          if (hasResults)
            return !(matchedIds.has(source) && matchedIds.has(target));
          if (selectedId)
            return source !== selectedId && target !== selectedId;
          return false;
        });

      relationSelection
        .classed("is-visible", (link) => {
          const source = getNodeId(link.source);
          const target = getNodeId(link.target);
          // A focused node narrows the relation labels to just its own edges;
          // an active search narrows them to the matched set. Only when neither
          // is active does the global Relations toggle decide all-or-nothing.
          if (selectedId) {
            return source === selectedId || target === selectedId;
          }
          if (hasResults) {
            return matchedIds.has(source) && matchedIds.has(target);
          }
          return edgeLabelsVisibleRef.current;
        })
        .classed("is-muted", (link) => {
          const source = getNodeId(link.source);
          const target = getNodeId(link.target);
          return !visibleNodeIds.has(source) || !visibleNodeIds.has(target);
        });
    };

    const activateNode = (node: GraphNode) =>
      selectNodeRef.current(node.id, false);
    nodeSelection
      .on("click", (_event, node) => activateNode(node))
      .on("keydown", (event, node) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activateNode(node);
        }
      });

    let dragging = false;
    nodeSelection.call(
      drag<SVGGElement, GraphNode>()
        .clickDistance(4)
        .on("start", (event, node) => {
          dragging = false;
          node.fx = node.x;
          node.fy = node.y;
          node._dragOriginX = event.x;
          node._dragOriginY = event.y;
        })
        .on("drag", (event, node) => {
          if (
            Math.hypot(
              event.x - Number(node._dragOriginX),
              event.y - Number(node._dragOriginY),
            ) > 4
          ) {
            dragging = true;
          }
          if (!dragging) return;
          node.fx = event.x;
          node.fy = event.y;
          simulation.alphaTarget(0.12).restart();
        })
        .on("end", (_event, node) => {
          node.fx = null;
          node.fy = null;
          if (reducedMotion) {
            simulation.alphaTarget(0);
            window.setTimeout(() => simulation.stop(), 320);
          } else {
            // Let the simulation cool back to rest and stop (no perpetual tick).
            simulation.alphaTarget(FLOAT_ALPHA);
          }
        }),
    );
    simulation.on("tick", () => {
      updatePositions();
      markInteracting();
    });

    graphApiRef.current = {
      applyState,
      fitIds,
      focusNode,
      zoomBy: (factor) => {
        svg
          .transition()
          .duration(reducedMotion ? 0 : 140)
          .call(zoomBehavior.scaleBy, factor);
      },
    };
    applyState(selectedIdRef.current, visibleIds, resultIdsRef.current);

    // Entrance. Reduced motion: keep the pre-settled static layout, framed
    // once. Otherwise: collapse every node to the centre and release the
    // simulation at full energy so the graph bursts outward into its clusters,
    // then cools to rest and stops (no perpetual ticking).
    let entranceTimer = 0;
    let entranceBurstTimer = 0;
    if (reducedMotion) {
      requestAnimationFrame(() => fitIds(resultIdsRef.current));
    } else {
      // Frame the eventual layout first so the burst happens in view.
      fitIds(resultIdsRef.current);

      const burstX = WORLD_WIDTH * 0.5;
      const burstY = WORLD_HEIGHT * 0.5;
      graphNodes.forEach((node, index) => {
        if (node.id === "christopher") {
          node.x = burstX;
          node.y = burstY;
        } else {
          // Golden-angle spray so the implosion point isn't a single pixel
          // and the explosion fans out evenly in all directions.
          const angle = index * 2.399963229728653;
          const radius = 12 + (index % 9) * 5;
          node.x = burstX + Math.cos(angle) * radius;
          node.y = burstY + Math.sin(angle) * radius;
        }
        node.vx = 0;
        node.vy = 0;
      });
      updatePositions();

      // Two-phase entrance. Phase 1: only the profile (name) node is on
      // screen, popping in at the centre while everything else stays imploded
      // beneath it and held invisible. Phase 2 (after a short beat): the rest
      // fade in and the simulation detonates, so every other node shoots
      // outward from the name into its cluster.
      const hubNode = nodeSelection.filter((node) => node.id === "christopher");
      const otherNodes = nodeSelection.filter(
        (node) => node.id !== "christopher",
      );

      hubNode.classed("is-hub-enter", true);
      otherNodes.style("opacity", "0");
      linkLayer.style("opacity", "0");
      relationLayer.style("opacity", "0");

      // How long the lone name holds before the rest detonate around it.
      const HUB_BEAT = 720;

      entranceBurstTimer = window.setTimeout(() => {
        // Reveal the rest as they burst; bring the link/relation layers in
        // slightly later so they don't render as a knot at the implosion point.
        otherNodes
          .style("opacity", null)
          .style("animation", "knowledge-node-enter 620ms ease-out backwards")
          .style(
            "animation-delay",
            (_node, index) => `${Math.min(index * 4, 300)}ms`,
          );
        linkLayer
          .style("opacity", null)
          .style("animation", "knowledge-layer-enter 760ms ease-out backwards")
          .style("animation-delay", "120ms");
        relationLayer
          .style("opacity", null)
          .style("animation", "knowledge-layer-enter 860ms ease-out backwards")
          .style("animation-delay", "260ms");

        // Detonate, then cool to rest (alphaTarget 0) and stop.
        simulation.alpha(1).alphaTarget(FLOAT_ALPHA).restart();
      }, HUB_BEAT);

      // The live burst settles into slightly different positions than the
      // static pre-settle, so re-frame once it has mostly come to rest. Also
      // drop the hub-entrance exemption now so the name label hides during
      // later interactions like every other label.
      entranceTimer = window.setTimeout(() => {
        hubNode.classed("is-hub-enter", false);
        if (resultIdsRef.current.size === 0 && !selectedIdRef.current) {
          fitIds(visibleIds);
        }
      }, HUB_BEAT + 2000);
    }

    let resizeFrame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        viewportWidth = Math.max(container.clientWidth, 320);
        viewportHeight = Math.max(container.clientHeight, 480);
        svg.attr("viewBox", `0 0 ${viewportWidth} ${viewportHeight}`);
        fitIds(
          resultIdsRef.current.size > 0
            ? resultIdsRef.current
            : new Set(
                knowledgeNodes
                  .filter((node) =>
                    nodeMatchesCategories(node, categoryRef.current),
                  )
                  .map((node) => node.id),
              ),
        );
      });
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(resizeFrame);
      window.clearTimeout(entranceTimer);
      window.clearTimeout(entranceBurstTimer);
      window.clearTimeout(interactionTimer);
      simulation.stop();
      graphApiRef.current = null;
      svg.selectAll("*").remove();
    };
  }, []);

  const selectedHrefOpensNewTab = Boolean(
    selectedNode?.href?.startsWith("http") ||
      selectedNode?.href?.endsWith(".pdf"),
  );

  // For article nodes, pull the full content-collections entry so the
  // inspector can render the article inline (Obsidian-style note view).
  const selectedArticle =
    selectedNode?.kind === "article" && selectedNode.href
      ? getArticleBySlug(selectedNode.href.replace("/articles/", "")) ?? null
      : null;
  const coverImage = selectedNode?.image ?? selectedArticle?.image ?? null;

  return (
    <div className="graph-workspace">
      <div ref={containerRef} className="knowledge-graph-grid graph-canvas">
        <svg
          ref={svgRef}
          className="graph-svg"
          aria-label="Interactive knowledge map of Christopher Nielson's work, projects, writing, skills, education, and interests"
        />

        <div className="graph-hud">
        <div className="graph-meta">
          <div className="graph-workspace-title">
            <Network className="size-3.5" />
            <span>{knowledgeNodes.length} nodes</span>
            <span>{knowledgeLinks.length} connections</span>
          </div>
          <div className="graph-instructions">
            <Move className="size-3" />
            Drag nodes · pan canvas · scroll to zoom
          </div>
        </div>

        <div className="graph-toolbar">
          <motion.button
            type="button"
            className={`edge-label-toggle ${edgeLabelsVisible ? "is-active" : ""}`}
            onClick={() => setEdgeLabelsVisible((value) => !value)}
            aria-pressed={edgeLabelsVisible}
            whileHover={prefersReducedMotion ? undefined : { y: -1 }}
            whileTap={tapScale}
            transition={gentleSpring}
          >
            Relations
          </motion.button>

          <div className="graph-filter-panel" aria-label="Knowledge filters">
            <motion.button
              type="button"
              onClick={showAll}
              className={`graph-filter ${activeCategories.size === 0 ? "is-active" : ""}`}
              aria-pressed={activeCategories.size === 0}
              whileTap={tapScale}
              transition={gentleSpring}
            >
              Show all
            </motion.button>
            {graphCategories.map((category) => (
              <motion.button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`graph-filter ${
                  activeCategories.has(category) ? "is-active" : ""
                }`}
                aria-pressed={activeCategories.has(category)}
                whileTap={tapScale}
                transition={gentleSpring}
              >
                {getCategoryLabel(category)}
                <span>
                  {
                    knowledgeNodes.filter(
                      (node) => getNodeCategory(node) === category,
                    ).length
                  }
                </span>
              </motion.button>
            ))}
          </div>

          <div className="graph-view-controls">
            <motion.button
              type="button"
              onClick={() => graphApiRef.current?.zoomBy(0.82)}
              className="graph-control"
              data-tooltip="Zoom out"
              aria-label="Zoom out"
              whileTap={tapScale}
              transition={gentleSpring}
            >
              <Minus className="size-3.5" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => graphApiRef.current?.fitIds(visibleIds)}
              className="graph-control"
              data-tooltip="Fit to view"
              aria-label="Fit visible nodes"
              whileTap={tapScale}
              transition={gentleSpring}
            >
              <Focus className="size-3.5" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => graphApiRef.current?.zoomBy(1.22)}
              className="graph-control"
              data-tooltip="Zoom in"
              aria-label="Zoom in"
              whileTap={tapScale}
              transition={gentleSpring}
            >
              <Plus className="size-3.5" />
            </motion.button>
          </div>
        </div>
        </div>

        <form className="graph-question-bar" onSubmit={submitQuestion}>
          <AnimatePresence>
            {showSuggestions ? (
              <motion.ul
                key="question-suggest"
                id="graph-question-suggest"
                className="question-suggest"
                role="listbox"
                aria-label="Matching nodes"
                onMouseDown={(event) => event.preventDefault()}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.14,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                {suggestions.map((result, index) => (
                  <li key={result.node.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === suggestIndex}
                      className={`question-suggest-item${
                        index === suggestIndex ? " is-active" : ""
                      }`}
                      onClick={() => pickSuggestion(result.node.id)}
                      onMouseEnter={() => setSuggestIndex(index)}
                    >
                      <span className="question-suggest-kind">
                        {knowledgeKindLabels[result.node.kind]}
                      </span>
                      <span className="question-suggest-label">
                        {result.node.label}
                      </span>
                      <ArrowUpRight className="size-3.5 shrink-0 opacity-50" />
                    </button>
                  </li>
                ))}
              </motion.ul>
            ) : null}
          </AnimatePresence>
          <CircleHelp className="size-4 shrink-0 text-accent" />
          <input
            ref={questionInputRef}
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              setSuggestOpen(true);
            }}
            onFocus={() => setSuggestOpen(true)}
            onBlur={() => setSuggestOpen(false)}
            onKeyDown={handleQuestionKeyDown}
            placeholder="Ask about my work, projects, or experience..."
            aria-label="Ask the knowledge graph a question"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls="graph-question-suggest"
            aria-autocomplete="list"
          />
          {question ? (
            <motion.button
              type="button"
              onClick={() => setQuestion("")}
              className="question-clear"
              aria-label="Clear question"
              whileTap={tapScale}
              transition={gentleSpring}
            >
              <X className="size-3.5" />
            </motion.button>
          ) : null}
          <motion.button
            type="submit"
            className="question-submit"
            disabled={!question.trim()}
            aria-label="Find relevant nodes"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
            whileTap={tapScale}
            transition={gentleSpring}
          >
            <ArrowRight className="size-4" />
          </motion.button>
        </form>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <motion.button
            key="inspector-scrim"
            type="button"
            className="inspector-scrim"
            onClick={closeDrawer}
            aria-label="Close details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            key="knowledge-inspector"
            ref={drawerRef}
            className="knowledge-inspector"
            aria-label={selectedNode ? `${selectedNode.label} details` : "Question results"}
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, y: 10, scale: 0.985 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 8, scale: 0.99 }
            }
            transition={{
              duration: prefersReducedMotion ? 0 : 0.24,
              ease: [0.2, 0.8, 0.2, 1],
            }}
          >
            <div className="inspector-tabbar">
              <div className="inspector-tab">
                {selectedNode ? (
                  <FileText className="size-3.5" />
                ) : (
                  <Search className="size-3.5" />
                )}
                <span className="truncate">
                  {selectedNode ? selectedNode.label : "Relevant nodes"}
                </span>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="inspector-close"
                aria-label="Close details"
                autoFocus
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="inspector-note">
              {selectedNode ? (
                <>
                  {coverImage ? (
                    <div className="inspector-cover">
                      <img
                        src={coverImage}
                        alt={selectedNode.label}
                        loading="lazy"
                        onError={(event) => {
                          const cover =
                            event.currentTarget.closest<HTMLElement>(
                              ".inspector-cover",
                            );
                          if (cover) cover.style.display = "none";
                        }}
                      />
                    </div>
                  ) : null}
                  <header className="inspector-note-header">
                    <div className="flex items-center justify-between gap-4">
                      <p className="inspector-path">
                        knowledge / {getNodeCategory(selectedNode)} /{" "}
                        {selectedNode.id}
                      </p>
                      {selectedNode.href ? (
                        <a
                          href={selectedNode.href}
                          target={
                            selectedHrefOpensNewTab ? "_blank" : undefined
                          }
                          rel={
                            selectedHrefOpensNewTab
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="inspector-open-link"
                        >
                          Open
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      ) : null}
                    </div>
                    <div className="inspector-title-row">
                      {getTechIcon(selectedNode.id) ? (
                        <TechEmblem
                          icon={getTechIcon(selectedNode.id)!}
                          className="inspector-emblem"
                        />
                      ) : null}
                      <h2 className="inspector-note-title">
                        {selectedNode.label}
                      </h2>
                    </div>
                    {selectedNode.eyebrow ? (
                      <p className="inspector-eyebrow">
                        {selectedNode.eyebrow}
                      </p>
                    ) : null}
                    <p className="inspector-description">
                      {selectedNode.description}
                    </p>
                    {selectedArticle ? (
                      <p className="inspector-article-meta">
                        {formatDate(selectedArticle.date)} ·{" "}
                        {selectedArticle.author}
                      </p>
                    ) : null}
                  </header>

                  {selectedArticle?.mdx ? (
                    <section className="inspector-section inspector-article-section">
                      <h3 className="inspector-section-title">
                        <FileText className="size-3.5" />
                        Article
                      </h3>
                      <div className="inspector-article">
                        <ArticleContent code={selectedArticle.mdx} />
                      </div>
                    </section>
                  ) : null}

                  <section className="inspector-section">
                    <h3 className="inspector-section-title">
                      <ChevronRight className="size-3.5" />
                      Properties
                    </h3>
                    <dl className="inspector-properties">
                      <div>
                        <dt>
                          <Hash className="size-3.5" /> Type
                        </dt>
                        <dd>
                          <span
                            className={`graph-kind-badge is-${selectedNode.kind}`}
                          >
                            {knowledgeKindLabels[selectedNode.kind]}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt>
                          <Link2 className="size-3.5" /> Connections
                        </dt>
                        <dd>{selectedConnections.length}</dd>
                      </div>
                      <div>
                        <dt>
                          <Focus className="size-3.5" /> Prominence
                        </dt>
                        <dd>{getNodeImportance(selectedNode)} / 4</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="inspector-section">
                    <h3 className="inspector-section-title">
                      <ChevronRight className="size-3.5" />
                      Evidence tags
                    </h3>
                    <div className="inspector-tags">
                      {selectedNode.tags.map((tag) => (
                        <span key={tag}>
                          <Tags className="size-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="inspector-section inspector-backlinks">
                    <div className="inspector-section-heading">
                      <h3 className="inspector-section-title">
                        <ChevronRight className="size-3.5" />
                        Connected evidence
                      </h3>
                      <span>{selectedConnections.length} links</span>
                    </div>
                    <div className="graph-connections">
                      {selectedConnections.map(({ node, relation }) => {
                        const connectionIcon = getTechIcon(node.id);
                        return (
                        <button
                          key={`${selectedNode.id}-${node.id}`}
                          type="button"
                          onClick={() => selectNode(node.id)}
                          className="inspector-backlink group"
                        >
                          {connectionIcon ? (
                            <TechEmblem
                              icon={connectionIcon}
                              className="graph-connection-emblem"
                            />
                          ) : (
                            <span
                              className={`graph-connection-dot is-${node.kind}`}
                            />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="inspector-backlink-title">
                              {node.label}
                            </span>
                            <span className="inspector-backlink-relation">
                              {relation} · {knowledgeKindLabels[node.kind]}
                            </span>
                          </span>
                          <ChevronRight className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                        );
                      })}
                    </div>
                  </section>
                </>
              ) : (
                <QuestionResults
                  question={submittedQuestion}
                  results={results}
                  onSelect={selectNode}
                />
              )}
            </div>

            <div className="inspector-statusbar">
              <span>
                {selectedNode
                  ? `${selectedNode.id}.md`
                  : `${results.length} ranked nodes`}
              </span>
              <span>Esc to close</span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function TechEmblem({
  icon,
  className,
}: {
  icon: TechIcon;
  className: string;
}) {
  return (
    <span
      className={className}
      style={{ background: icon.bg }}
      title={icon.title}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" role="img">
        <path d={icon.path} fill={icon.fg} />
      </svg>
    </span>
  );
}

function QuestionResults({
  question,
  results,
  onSelect,
}: {
  question: string;
  results: GraphSearchResult[];
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <header className="inspector-note-header question-results-header">
        <p className="inspector-path">local graph retrieval</p>
        <h2 className="inspector-note-title">“{question}”</h2>
        <p className="inspector-description">
          Ranked from node names, descriptions, tags, types, relationships, and
          connected context. Select a result to inspect its evidence.
        </p>
      </header>
      <section className="inspector-section">
        <div className="inspector-section-heading">
          <h3 className="inspector-section-title">
            <ChevronRight className="size-3.5" />
            Relevant nodes
          </h3>
          <span>{results.length} matches</span>
        </div>
        <div className="question-result-list">
          {results.length ? (
            results.map((result, index) => (
              <button
                key={result.node.id}
                type="button"
                className="question-result"
                onClick={() => onSelect(result.node.id)}
              >
                <span className="question-result-rank">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="question-result-title">
                    {result.node.label}
                  </span>
                  <span className="question-result-description">
                    {result.node.description}
                  </span>
                  <span className="question-result-reason">
                    Matched {result.reasons.join(", ")}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0" />
              </button>
            ))
          ) : (
            <div className="question-empty">
              <CircleHelp className="size-5" />
              <p>No strong node matches. Try a project, technology, employer, or topic.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
