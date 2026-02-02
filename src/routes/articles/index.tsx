import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { getAllArticles, formatDate } from "@/data/articles";
import {
  PageTransition,
  FadeIn,
  StaggerView,
  StaggerItem,
} from "@/components/Motion";

export const Route = createFileRoute("/articles/")({
  component: ArticlesPage,
});

function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <PageTransition>
      <Container>
        <header className="mb-12">
          <FadeIn>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Articles
            </h1>
          </FadeIn>
          <FadeIn delay={0.05}>
            <p className="mt-4 text-base text-muted">
              Thoughts on software engineering, machine learning, fintech, and
              building things for the web.
            </p>
          </FadeIn>
        </header>

        <section>
          <StaggerView fast>
            <ul className="space-y-8">
              {articles.map((article) => (
                <StaggerItem key={article.slug}>
                  <li className="group border-b border-border pb-8 last:border-0 list-none">
                    <Link
                      to="/articles/$slug"
                      params={{ slug: article.slug }}
                      className="block"
                    >
                      <article>
                        <time className="text-sm text-muted-foreground">
                          {formatDate(article.date)}
                        </time>
                        <h2 className="mt-2 text-xl font-semibold text-foreground transition-colors group-hover:text-accent">
                          {article.title}
                        </h2>
                        <p className="mt-2 text-base leading-relaxed text-muted">
                          {article.description}
                        </p>
                        {article.tags && article.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {article.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-border px-2.5 py-0.5 text-xs text-muted"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </article>
                    </Link>
                  </li>
                </StaggerItem>
              ))}
            </ul>
          </StaggerView>

          {articles.length === 0 && (
            <FadeIn>
              <p className="text-center text-muted">
                No articles yet. Check back soon!
              </p>
            </FadeIn>
          )}
        </section>
      </Container>
    </PageTransition>
  );
}
