import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { getArticleBySlug, formatDate } from "@/data/articles";
import { ArticleContent } from "@/components/ArticleContent";
import { ArrowLeft } from "lucide-react";
import { PageTransition, FadeIn, motion } from "@/components/Motion";

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
    <Container>
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Article not found
        </h1>
        <p className="mt-2 text-muted">
          The article you're looking for doesn't exist.
        </p>
        <Link
          to="/articles"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to articles
        </Link>
      </div>
    </Container>
  ),
});

function ArticlePage() {
  const { article } = Route.useLoaderData();

  return (
    <PageTransition>
      <Container>
        <FadeIn>
          <motion.div
            whileHover={{ x: -4 }}
            transition={{ duration: 0.2 }}
            className="inline-block"
          >
            <Link
              to="/articles"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to articles
            </Link>
          </motion.div>
        </FadeIn>

        <article>
          <header className="mb-8">
            <FadeIn delay={0.1}>
              <time className="text-sm text-muted-foreground">
                {formatDate(article.date)}
              </time>
            </FadeIn>
            <FadeIn delay={0.15}>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {article.title}
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-4 text-lg text-muted">{article.description}</p>
            </FadeIn>
            {article.tags && article.tags.length > 0 && (
              <FadeIn delay={0.25}>
                <div className="mt-4 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <motion.span
                      key={tag}
                      className="rounded-full bg-border px-2.5 py-0.5 text-xs text-muted"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.15 }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </FadeIn>
            )}
          </header>

          <FadeIn delay={0.3}>
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
    </PageTransition>
  );
}
