import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { getArticleBySlug, formatDate } from "@/data/articles";
import { ArticleContent } from "@/components/ArticleContent";
import { ArrowLeft } from "lucide-react";
import { useReducedMotion } from "motion/react";
import {
  FadeIn,
  Stagger,
  StaggerItem,
  ReadingProgress,
  motion,
  gentleSpring,
} from "@/components/Motion";

export const Route = createFileRoute("/articles/$slug")({
  component: ArticlePage,
  loader: ({ params }) => {
    const article = getArticleBySlug(params.slug);
    if (!article) {
      throw notFound();
    }
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.article?.title ?? "Article"} - Christopher Nielson`,
      },
      {
        name: "description",
        content: loaderData?.article?.description ?? "",
      },
      {
        property: "og:title",
        content: loaderData?.article?.title ?? "Article",
      },
      {
        property: "og:description",
        content: loaderData?.article?.description ?? "",
      },
      {
        property: "og:type",
        content: "article",
      },
      {
        name: "author",
        content: loaderData?.article?.author ?? "Christopher Nielson",
      },
    ],
  }),
  notFoundComponent: () => (
    <Container className="max-w-3xl">
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Article not found
        </h1>
        <p className="mt-2 text-muted">
          The article you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          search={{ types: "article" }}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to writing map
        </Link>
      </div>
    </Container>
  ),
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const prefersReducedMotion = useReducedMotion();
  const readingMinutes = Math.max(
    1,
    Math.ceil(article.content.trim().split(/\s+/).length / 220),
  );

  return (
    <>
      <ReadingProgress />
      <Container className="max-w-4xl">
        <FadeIn className="mb-10 block">
          <motion.span
            className="inline-flex"
            whileHover={prefersReducedMotion ? undefined : { x: -3 }}
            transition={gentleSpring}
          >
            <Link
              to="/"
              search={{ types: "article" }}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to writing map
            </Link>
          </motion.span>
        </FadeIn>

        <article>
          <header className="mb-12 border-b border-foreground pb-10">
            <Stagger staggerDelay={0.07}>
              <StaggerItem>
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs tabular-nums text-muted-foreground">
                  <time>{formatDate(article.date)}</time>
                  <span aria-hidden="true">/</span>
                  <span>{readingMinutes} min read</span>
                  <span aria-hidden="true">/</span>
                  <span>{article.author}</span>
                </div>
              </StaggerItem>
              <StaggerItem>
                <h1 className="mt-5 text-4xl leading-[1] text-balance text-foreground sm:text-6xl">
                  {article.title}
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="mt-5 text-base leading-7 text-pretty text-muted sm:text-lg">
                  {article.description}
                </p>
              </StaggerItem>
              {article.tags && article.tags.length > 0 && (
                <StaggerItem>
                  <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border-l border-accent pl-2 text-[11px] font-medium text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </StaggerItem>
              )}
            </Stagger>
          </header>

          <FadeIn delay={0.1}>
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              {article.mdx ? (
                <ArticleContent code={article.mdx} />
              ) : (
                <p className="text-muted">Article content is loading...</p>
              )}
            </div>
          </FadeIn>
        </article>
      </Container>
    </>
  );
}
