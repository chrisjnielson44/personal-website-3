import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { SocialLinks } from "@/components/SocialIcons";
import { getAllArticles, formatDate } from "@/data/articles";
import { projects } from "@/data/projects";
import { ArrowRight, Briefcase, GraduationCap, Download } from "lucide-react";
import {
  PageTransition,
  FadeIn,
  StaggerView,
  StaggerItem,
} from "@/components/Motion";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const recentArticles = getAllArticles().slice(0, 3);
  const featuredProjects = projects.slice(0, 3);

  return (
    <PageTransition>
      <Container>
        {/* Hero Section */}
        <section className="mb-16">
          <FadeIn>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-4xl">
              Christopher Nielson
            </h1>
          </FadeIn>
          <FadeIn delay={0.05}>
            <p className="mt-4 text-xl text-muted">Software Engineer @ BNY</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
              Building AI platforms for risk management in financial services. I
              design scalable systems that help businesses make smarter, faster
              decisions—from end-to-end applications to dashboards that surface
              actionable insights. Graduate student in Data Science & ML at
              Carnegie Mellon.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mt-6">
              <SocialLinks />
            </div>
          </FadeIn>
        </section>

        {/* Education & Work */}
        <section className="mb-16 grid gap-8 sm:grid-cols-2">
          <FadeIn delay={0.1}>
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                Education
              </h2>
              <ul className="space-y-3">
                <li>
                  <p className="font-medium text-foreground">
                    Carnegie Mellon University
                  </p>
                  <p className="text-sm text-muted">
                    Graduate Certificate · 2025
                  </p>
                </li>
                <li>
                  <p className="font-medium text-foreground">
                    Florida State University
                  </p>
                  <p className="text-sm text-muted">
                    BS, Computer Science · 2024
                  </p>
                </li>
              </ul>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                Work
              </h2>
              <ul className="space-y-3">
                <li>
                  <p className="font-medium text-foreground">
                    Software Engineer
                  </p>
                  <p className="text-sm text-muted">BNY · 2024 – Present</p>
                </li>
              </ul>
              <a
                href="https://chris-n.s3.us-east-2.amazonaws.com/images/Christopher_Nielson_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
              >
                <Download className="h-4 w-4" />
                Download Resume
              </a>
            </div>
          </FadeIn>
        </section>

        {/* Recent Articles */}
        <section className="mb-16">
          <FadeIn>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Articles
              </h2>
              <Link
                to="/articles"
                className="flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </FadeIn>
          <StaggerView className="space-y-4" fast>
            {recentArticles.map((article) => (
              <StaggerItem key={article.slug}>
                <li className="group flex items-baseline justify-between gap-4 border-b border-border pb-4 last:border-0 list-none">
                  <Link
                    to="/articles/$slug"
                    params={{ slug: article.slug }}
                    className="font-medium text-foreground transition-colors group-hover:text-accent"
                  >
                    {article.title}
                  </Link>
                  <time className="shrink-0 text-sm text-muted-foreground">
                    {formatDate(article.date)}
                  </time>
                </li>
              </StaggerItem>
            ))}
          </StaggerView>
        </section>

        {/* Featured Projects */}
        <section>
          <FadeIn>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Projects
              </h2>
              <Link
                to="/projects"
                className="flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </FadeIn>
          <StaggerView className="space-y-4" fast>
            {featuredProjects.map((project) => (
              <StaggerItem key={project.name}>
                <li className="group border-b border-border pb-4 last:border-0 list-none">
                  <a
                    href={project.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <h3 className="font-medium text-foreground transition-colors group-hover:text-accent">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted line-clamp-2">
                      {project.description}
                    </p>
                  </a>
                </li>
              </StaggerItem>
            ))}
          </StaggerView>
        </section>
      </Container>
    </PageTransition>
  );
}
