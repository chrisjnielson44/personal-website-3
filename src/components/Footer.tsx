"use client";

import { Github, Linkedin, Mail, Twitter } from "lucide-react";
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
    <footer className="mt-20 border-t border-border bg-surface py-10 text-foreground">
      <FadeInView
        amount={0.3}
        className="mx-auto flex max-w-[var(--spacing-content)] flex-col gap-8 px-5 sm:flex-row sm:items-end sm:justify-between sm:px-7 lg:px-10"
      >
        <div>
          <p className="font-display text-2xl">
            Christopher Nielson
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">
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
      </FadeInView>
    </footer>
  );
}
