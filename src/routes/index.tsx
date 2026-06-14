import { parseGraphSearch } from "@/lib/knowledgeGraph";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const KnowledgeGraph = lazy(() =>
  import("@/components/KnowledgeGraph").then((module) => ({
    default: module.KnowledgeGraph,
  })),
);

export const Route = createFileRoute("/")({
  component: HomePage,
  validateSearch: parseGraphSearch,
  head: () => ({
    meta: [
      {
        title: "Christopher Nielson - Personal Knowledge Graph",
      },
      {
        name: "description",
        content:
          "Explore Christopher Nielson's experience, projects, writing, technologies, and production AI work as an interactive knowledge graph.",
      },
    ],
  }),
});

function KnowledgeGraphSkeleton() {
  return (
    <div className="knowledge-graph-grid relative min-h-[calc(100dvh-3.5rem)] overflow-hidden">
      <div className="absolute top-5 left-5 flex gap-2">
        <div className="h-8 w-20 animate-pulse rounded bg-border" />
        <div className="h-8 w-24 animate-pulse rounded bg-border" />
        <div className="h-8 w-24 animate-pulse rounded bg-border" />
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <div className="size-28 animate-pulse rounded-full border border-border bg-surface" />
      </div>
      <div className="absolute right-4 bottom-5 left-4 mx-auto h-12 max-w-3xl animate-pulse rounded-lg bg-card" />
    </div>
  );
}

function HomePage() {
  const search = Route.useSearch();

  return (
    <div className="min-h-[calc(100dvh-3.5rem)]">
      <Suspense fallback={<KnowledgeGraphSkeleton />}>
        <KnowledgeGraph initialSearch={search} />
      </Suspense>
    </div>
  );
}
