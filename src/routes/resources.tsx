import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import {
  PageTransition,
  FadeIn,
  StaggerView,
  StaggerItem,
} from "@/components/Motion";

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
  head: () => ({
    meta: [
      {
        title: "Resources - Christopher Nielson",
      },
      {
        name: "description",
        content:
          "A collection of resources I use to build software, stay productive, and learn new things.",
      },
    ],
  }),
});

interface Tool {
  title: string;
  description: string;
  href?: string;
}

interface ToolsSection {
  title: string;
  tools: Tool[];
}

const resources: ToolsSection[] = [
  {
    title: "Workstation",
    tools: [
      {
        title: "MacBook Pro 16-inch (2019)",
        description:
          "My daily driver for development work. Running on an Intel i7 processor, this laptop has been reliable for all my development needs.",
      },
      {
        title: "Raspberry Pi 4 Model B",
        description:
          "Running Debian, I use this versatile little computer for various projects and learning Linux administration.",
      },
    ],
  },
  {
    title: "Development Tools",
    tools: [
      {
        title: "Zed",
        href: "https://zed.dev",
        description:
          "My current favorite IDE. Zed offers a modern, fast editing experience with excellent syntax highlighting and collaborative features.",
      },
      {
        title: "Git",
        href: "https://git-scm.com",
        description:
          "Essential for version control. I use it through the command line and integrate it with other tools in my workflow.",
      },
      {
        title: "GitHub Copilot",
        href: "https://github.com/features/copilot",
        description:
          "AI pair programmer that helps with code completion and generation. Particularly useful for boilerplate code and common patterns.",
      },
      {
        title: "Warp",
        href: "https://www.warp.dev",
        description:
          "A modern terminal that enhances productivity with features like AI command search, shared workflows, and built-in documentation.",
      },
      {
        title: "Docker",
        href: "https://www.docker.com",
        description:
          "Container platform that ensures consistency across development environments and simplifies deployment processes.",
      },
      {
        title: "TablePlus",
        href: "https://tableplus.com",
        description:
          "Clean and efficient database management tool. Supports multiple database types with a consistent interface.",
      },
      {
        title: "pnpm",
        href: "https://pnpm.io",
        description:
          "Fast, disk space efficient package manager for Node.js. Great for monorepos and maintaining consistent dependencies.",
      },
      {
        title: "Sourcetree",
        href: "https://www.sourcetreeapp.com",
        description:
          "Git GUI that makes complex version control operations visual and intuitive. Helpful for reviewing changes and managing branches.",
      },
    ],
  },
  {
    title: "Productivity",
    tools: [
      {
        title: "Obsidian",
        href: "https://obsidian.md",
        description:
          "My second brain. I use Obsidian for personal knowledge management, note-taking, and connecting ideas through its powerful linking features.",
      },
      {
        title: "Notion",
        href: "https://notion.so",
        description:
          "Perfect for collaboration and shared documentation. I use it for project planning and team coordination.",
      },
      {
        title: "Things 3",
        href: "https://culturedcode.com/things/",
        description:
          "My trusted task manager. Things 3's clean design and powerful organization features help me stay on top of projects and daily tasks.",
      },
    ],
  },
  {
    title: "Tech Stack",
    tools: [
      {
        title: "Next.js",
        href: "https://nextjs.org",
        description:
          "My go-to React framework for building full-stack web applications. The built-in routing, server components, and deployment features make it incredibly powerful.",
      },
      {
        title: "TypeScript",
        href: "https://www.typescriptlang.org",
        description:
          "I write all my JavaScript with TypeScript. The type safety and improved developer experience are invaluable for building robust applications.",
      },
      {
        title: "Tailwind CSS",
        href: "https://tailwindcss.com",
        description:
          "My preferred styling solution. Tailwind's utility-first approach allows for rapid development while maintaining consistency across projects.",
      },
      {
        title: "Prisma",
        href: "https://www.prisma.io",
        description:
          "Modern ORM that makes database work a joy. The type safety and integration with TypeScript create a seamless development experience.",
      },
      {
        title: "PostgreSQL",
        href: "https://www.postgresql.org",
        description:
          "My relational database of choice. PostgreSQL is powerful, reliable, and has excellent support for complex queries and data types.",
      },
      {
        title: "AWS S3",
        href: "https://aws.amazon.com/s3",
        description:
          "Scalable object storage for static assets and file uploads. I use it for hosting images, videos, and other media.",
      },
      {
        title: "Vercel",
        href: "https://vercel.com",
        description:
          "My favorite platform for deploying web applications. Vercel's integration with Next.js and GitHub makes it easy to set up continuous deployment.",
      },
    ],
  },
  {
    title: "Learning Resources",
    tools: [
      {
        title: "Big-O Cheat Sheet",
        href: "https://www.bigocheatsheet.com/",
        description:
          "An excellent reference for time and space complexity of common algorithms and data structures. Great for interview prep and understanding algorithmic efficiency.",
      },
      {
        title: "Neetcode",
        href: "https://neetcode.io/",
        description:
          "High-quality explanations of data structures, algorithms, and coding problems. The roadmap approach makes it easy to progress systematically through topics.",
      },
      {
        title: "Visualgo",
        href: "https://visualgo.net/",
        description:
          "Interactive visualizations of data structures and algorithms. Seeing these concepts in action makes them much easier to understand.",
      },
      {
        title: "Grokking Algorithms",
        href: "https://www.manning.com/books/grokking-algorithms",
        description:
          "An illustrated guide that makes complex algorithms accessible through clear explanations and practical examples. Great for visual learners.",
      },
      {
        title: "BaseCS",
        href: "https://medium.com/basecs",
        description:
          "A collection of articles that break down fundamental computer science concepts in an approachable way. Perfect for filling knowledge gaps.",
      },
    ],
  },
];

function ResourcesPage() {
  return (
    <PageTransition>
      <Container>
        <header className="mb-12">
          <FadeIn>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Resources
            </h1>
          </FadeIn>
          <FadeIn delay={0.05}>
            <p className="mt-4 text-base text-muted">
              A collection of resources I use to build software, stay
              productive, and learn new things.
            </p>
          </FadeIn>
        </header>

        <div className="space-y-16">
          {resources.map((section, sectionIndex) => (
            <section key={section.title}>
              <FadeIn delay={0.05 * (sectionIndex + 1)}>
                <h2 className="text-lg font-semibold text-foreground mb-6">
                  {section.title}
                </h2>
              </FadeIn>
              <StaggerView className="space-y-4" fast>
                {section.tools.map((tool) => (
                  <StaggerItem key={tool.title}>
                    <Card>
                      <Card.Title href={tool.href} external>
                        {tool.title}
                      </Card.Title>
                      <Card.Description>{tool.description}</Card.Description>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerView>
            </section>
          ))}
        </div>
      </Container>
    </PageTransition>
  );
}
