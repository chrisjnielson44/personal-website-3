import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { projects } from "@/data/projects";
import { ArrowUpRight } from "lucide-react";
import {
  PageTransition,
  FadeIn,
  StaggerView,
  StaggerItem,
} from "@/components/Motion";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  head: () => ({
    meta: [
      {
        title: "Projects - Christopher Nielson",
      },
      {
        name: "description",
        content:
          "A collection of projects I've built, from ML risk analysis tools to fintech applications.",
      },
    ],
  }),
});

function ProjectsPage() {
  return (
    <PageTransition>
      <Container>
        <header className="mb-12">
          <FadeIn>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Projects
            </h1>
          </FadeIn>
          <FadeIn delay={0.05}>
            <p className="mt-4 text-base text-muted">
              A collection of things I've built. From machine learning backends
              to full-stack fintech applications.
            </p>
          </FadeIn>
        </header>

        <StaggerView className="grid gap-6 sm:grid-cols-2" fast>
          {projects.map((project) => (
            <StaggerItem key={project.name}>
              <Card className="h-full">
                <Card.Title href={project.link.href} external>
                  {project.name}
                </Card.Title>
                <Card.Description>{project.description}</Card.Description>
                {project.tags && <Card.Tags tags={project.tags} />}
                <Card.Link
                  href={project.link.href}
                  label={project.link.label}
                />
              </Card>
            </StaggerItem>
          ))}
        </StaggerView>

        <FadeIn delay={0.1}>
          <div className="mt-12 rounded-lg border border-border p-6 transition-colors hover:border-accent">
            <p className="text-center text-muted">
              More projects on{" "}
              <a
                href="https://github.com/chrisjnielson44"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-foreground transition-colors hover:text-accent"
              >
                GitHub
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </p>
          </div>
        </FadeIn>
      </Container>
    </PageTransition>
  );
}
