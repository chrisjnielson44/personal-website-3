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
        title: "Christopher Nielson - Software Engineer",
      },
      {
        name: "description",
        content:
          "Software Engineer at BNY. Building ML-driven solutions for financial risk analysis. CMU Graduate Certificate, FSU CS Graduate.",
      },
      {
        name: "author",
        content: "Christopher Nielson",
      },
      {
        property: "og:title",
        content: "Christopher Nielson - Software Engineer",
      },
      {
        property: "og:description",
        content:
          "Software Engineer at BNY. Building ML-driven solutions for financial risk analysis.",
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
          "Christopher Nielson - Software Engineer · Production AI & Financial Risk",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Christopher Nielson - Software Engineer",
      },
      {
        name: "twitter:description",
        content:
          "Software Engineer at BNY. Building ML-driven solutions for financial risk analysis.",
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
  const prefersReducedMotion = useReducedMotion();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-dvh flex-col bg-background text-foreground antialiased">
        <Header />
        <main
          className={cn(
            "page-shell flex-1",
            isGraphHome
              ? "min-h-[calc(100dvh-3.5rem)]"
              : "pt-10 sm:pt-16",
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
