import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { SocialLinks } from "@/components/SocialIcons";
import { PageTransition, FadeIn, FadeInView } from "@/components/Motion";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      {
        title: "About - Christopher Nielson",
      },
      {
        name: "description",
        content:
          "Learn more about Christopher Nielson, a Software Engineer at BNY focused on financial technology and machine learning.",
      },
    ],
  }),
});

const skills = [
  "Python",
  "TypeScript",
  "Java",
  "C++",
  "React",
  "Next.js",
  "TanStack",
  "FastAPI",
  "Node.js",
  "PostgreSQL",
  "Docker",
  "Kubernetes",
  "Machine Learning",
  "NLP",
  "Prisma",
  "Tailwind CSS",
  "Git",
  "AWS",
];

function AboutPage() {
  return (
    <PageTransition>
      <Container>
        <FadeIn>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            About Me
          </h1>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted">
            <p>
              I'm Christopher Nielson, a Software Engineer at BNY and graduate
              student at Carnegie Mellon University. I hold a Bachelor of
              Science in Computer Science from Florida State University, with
              minors in Business and Mathematics.
            </p>

            <p>
              My work focuses on building ML-driven applications for financial
              risk analysis. I've developed systems that leverage machine
              learning and natural language processing to enhance risk data
              interpretation and improve financial assessments across various
              instruments including FX, interest rates, and futures.
            </p>

            <p>
              I'm passionate about the intersection of technology and finance,
              particularly in areas like quantitative analysis, algorithmic
              trading systems, and risk management platforms. My technical
              toolkit includes Python, TypeScript, React, Next.js, FastAPI, and
              various ML/NLP frameworks.
            </p>

            <p>
              Previously, I interned at BNY where I built machine learning
              applications for risk engineering, and at Isofy where I
              contributed to network security solutions. I'm a Florida Bright
              Futures Academic Scholar and have been active in organizations
              like the Cryptocurrency Organization for Young Professionals and
              ACM.
            </p>

            <p>
              Beyond engineering, I'm fluent in Spanish and enjoy staying
              current with developments in fintech, distributed systems, and the
              evolving AI/ML landscape.
            </p>
          </div>
        </FadeIn>

        {/* Skills */}
        <FadeInView className="mt-12">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border px-3 py-1 text-sm text-muted transition-colors hover:border-accent hover:text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </FadeInView>

        {/* Connect */}
        <FadeInView className="mt-12">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Connect</h2>
            <p className="mt-2 text-muted">
              Feel free to reach out for collaborations, opportunities, or just
              to chat about tech.
            </p>
            <div className="mt-4">
              <SocialLinks />
            </div>
            <p className="mt-4 text-sm text-muted">
              Email:{" "}
              <a
                href="mailto:cjnielson44@gmail.com"
                className="text-foreground transition-colors hover:text-accent"
              >
                cjnielson44@gmail.com
              </a>
            </p>
          </section>
        </FadeInView>
      </Container>
    </PageTransition>
  );
}
