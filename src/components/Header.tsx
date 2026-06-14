"use client";

import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Github, Network } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { motion, gentleSpring } from "@/components/Motion";

export default function Header() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isArticle = pathname.startsWith("/articles/");
  const isHome = pathname === "/";
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className={`site-header ${isHome ? "is-overlay" : ""}`}>
      <motion.nav
        className="site-header-inner"
        aria-label="Primary navigation"
        initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.3,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        <Link
          to="/"
          className="site-wordmark"
          aria-label="Christopher Nielson home"
        >
          <span className="site-name">Christopher Nielson</span>
          <span className="site-title">
            <Network className="size-3.5" />
            {isArticle ? "Career Graph / Article" : "Career Graph"}
          </span>
        </Link>

        <div className="site-header-actions">
          <motion.a
            href="/christopher-nielson-resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={prefersReducedMotion ? undefined : { y: -1 }}
            transition={gentleSpring}
          >
            Resume
            <ArrowUpRight className="size-3" />
          </motion.a>
          <motion.a
            href="https://github.com/chrisjnielson44"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Christopher Nielson on GitHub"
            whileHover={prefersReducedMotion ? undefined : { y: -1 }}
            transition={gentleSpring}
          >
            <Github className="size-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </motion.a>
        </div>
      </motion.nav>
    </header>
  );
}
