import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import { useReducedMotion } from "motion/react";

import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { motion } from "../components/Motion";
import { cn } from "../lib/utils";

import appCss from "../styles.css?url";

// Canonical production origin. Open Graph / Twitter image URLs must be
// absolute, so we build them from here. Regenerate og-image.png with
// `npm run og`.
const SITE_URL = "https://cjnielson.com";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Christopher Nielson - Full Stack Software Engineer",
      },
      {
        name: "description",
        content:
          "Full-stack software engineer on BNY's Risk Engineering team, building production AI agent infrastructure, evaluation systems, and governed AI workflows. CMU Graduate Certificate, FSU CS graduate.",
      },
      {
        name: "author",
        content: "Christopher Nielson",
      },
      {
        property: "og:title",
        content: "Christopher Nielson - Full Stack Software Engineer",
      },
      {
        property: "og:description",
        content:
          "Full-stack software engineer building production AI agent infrastructure on BNY's Risk Engineering team. Explore my work as an interactive knowledge graph.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: "Christopher Nielson",
      },
      {
        property: "og:url",
        content: SITE_URL,
      },
      {
        property: "og:image",
        content: OG_IMAGE,
      },
      {
        property: "og:image:width",
        content: "1200",
      },
      {
        property: "og:image:height",
        content: "630",
      },
      {
        property: "og:image:alt",
        content:
          "Christopher Nielson - Full Stack SWE · Production AI & Financial Risk",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Christopher Nielson - Full Stack Software Engineer",
      },
      {
        name: "twitter:description",
        content:
          "Full-stack software engineer building production AI agent infrastructure on BNY's Risk Engineering team. Explore my work as an interactive knowledge graph.",
      },
      {
        name: "twitter:image",
        content: OG_IMAGE,
      },
      {
        name: "twitter:creator",
        content: "@chrisjnielson",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: SITE_URL,
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "alternate icon",
        href: "/favicon.ico",
      },
    ],
  }),

  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isGraphHome = pathname === "/";
  // The benchmark page is a self-contained, full-bleed landing — no top chrome.
  const isBenchmark = pathname === "/context-engine";
  const hideHeader = isGraphHome || isBenchmark;
  const prefersReducedMotion = useReducedMotion();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-dvh flex-col bg-background text-foreground antialiased">
        {/* The graph home is full-bleed and self-identifying (welcome card +
            the central profile node), so it drops the top header. Every other
            route keeps it for branding and the link back to the graph. */}
        {hideHeader ? null : <Header />}
        <main
          className={cn(
            "page-shell flex-1",
            isGraphHome ? "min-h-dvh" : isBenchmark ? "" : "pt-10 sm:pt-16",
          )}
        >
          {/* The graph home self-animates (D3 + CSS), so it renders without a
              page transition. Other routes fade/slide in, keyed on pathname so
              graph search-param changes (?types=...) never replay a transition. */}
          {isGraphHome ? (
            <Outlet />
          ) : (
            <motion.div
              key={pathname}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.25,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <Outlet />
            </motion.div>
          )}
        </main>
        {isGraphHome ? null : <Footer />}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
