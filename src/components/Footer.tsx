"use client";

import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Github, Linkedin, Mail, Network, Twitter } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { socialLinks } from "@/data/social";
import { FadeInView, motion, gentleSpring } from "@/components/Motion";

const iconMap = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  mail: Mail,
} as const;

export function Footer() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <footer className="mt-24 border-t border-border bg-surface text-foreground">
      <FadeInView
        amount={0.3}
        className="mx-auto max-w-[var(--spacing-content)] px-5 py-12 sm:px-7 lg:px-10"
      >
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link to="/" className="group inline-flex items-center gap-2.5">
              <span className="font-display text-2xl tracking-[-0.01em]">
                Christopher Nielson
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted">
              Software engineering for reliable AI systems, financial risk, and
              knowledge-rich products.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {socialLinks.map((link) => {
              const Icon = iconMap[link.icon as keyof typeof iconMap];
              return (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-9 place-items-center rounded-[5px] border border-border text-muted transition-[color,background-color,border-color] duration-150 hover:border-accent hover:bg-card hover:text-accent"
                  aria-label={link.name}
                  whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                  whileTap={prefersReducedMotion ? undefined : { y: 0 }}
                  transition={gentleSpring}
                >
                  <Icon className="size-4" />
                </motion.a>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} Christopher Nielson
          </p>
          <nav
            aria-label="Footer"
            className="flex items-center gap-5 font-mono text-xs"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-muted transition-colors duration-150 hover:text-accent"
            >
              <Network className="size-3.5" />
              Career Graph
            </Link>
            <a
              href="/christopher-nielson-resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted transition-colors duration-150 hover:text-accent"
            >
              Resume
              <ArrowUpRight className="size-3" />
            </a>
          </nav>
        </div>
      </FadeInView>
    </footer>
  );
}
