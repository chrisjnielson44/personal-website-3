import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { PageTransition, FadeIn } from "@/components/Motion";

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
        title: "Mac Studio M3 Ultra",
        description:
          "My main development machine. The M3 Ultra handles everything I throw at it—compiling, running local models, and containerized workloads.",
      },
      {
        title: "Raspberry Pi 4 Model B",
        description:
          "Running Debian for home server projects and learning Linux administration.",
      },
    ],
  },
  {
    title: "Development Tools",
    tools: [
      {
        title: "Cursor",
        href: "https://cursor.com",
        description:
          "AI-native code editor built on VS Code. The integrated AI assistance makes it great for rapid development.",
      },
      {
        title: "Warp",
        href: "https://www.warp.dev",
        description:
          "Modern terminal with AI command search and block-based output. Much faster than traditional terminals.",
      },
      {
        title: "Docker",
        href: "https://www.docker.com",
        description:
          "Container platform for consistent development environments and simplified deployments.",
      },
      {
        title: "TablePlus",
        href: "https://tableplus.com",
        description:
          "Clean database GUI that supports Postgres, MySQL, SQLite, and more.",
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
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-4xl">
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
                <div className="space-y-4">
                  {section.tools.map((tool) => (
                    <Card key={tool.title}>
                      <Card.Title href={tool.href} external>
                        {tool.title}
                      </Card.Title>
                      <Card.Description>{tool.description}</Card.Description>
                    </Card>
                  ))}
                </div>
              </FadeIn>
            </section>
          ))}
        </div>
      </Container>
    </PageTransition>
  );
}
