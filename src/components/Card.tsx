"use client";

import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { motion, gentleSpring } from "@/components/Motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      className={cn(
        "group relative flex flex-col border-t border-border bg-transparent py-6 transition-[background-color,padding] duration-200 hover:bg-card hover:px-5",
        className,
      )}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={gentleSpring}
    >
      {children}
    </motion.article>
  );
}

interface CardTitleProps {
  href?: string;
  children: React.ReactNode;
  external?: boolean;
}

function CardTitle({ href, children, external = false }: CardTitleProps) {
  const className =
    "text-xl font-normal leading-snug text-balance text-foreground transition-colors duration-150 group-hover:text-accent";

  if (href) {
    if (external) {
      return (
        <h2 className={className}>
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        </h2>
      );
    }

    return (
      <h2 className={className}>
        <Link to={href}>
          {children}
        </Link>
      </h2>
    );
  }

  return <h2 className={className}>{children}</h2>;
}

interface CardDescriptionProps {
  children: React.ReactNode;
}

function CardDescription({ children }: CardDescriptionProps) {
  return (
    <p className="mt-3 line-clamp-5 text-sm leading-6 text-pretty text-muted">
      {children}
    </p>
  );
}

interface CardEyebrowProps {
  children: React.ReactNode;
  as?: React.ElementType;
  dateTime?: string;
}

function CardEyebrow({
  children,
  as: Component = "p",
  dateTime,
}: CardEyebrowProps) {
  return (
    <Component
      className="mb-2 font-mono text-xs tabular-nums text-muted-foreground"
      {...(dateTime ? { dateTime } : {})}
    >
      {children}
    </Component>
  );
}

interface CardLinkProps {
  href: string;
  label: string;
  external?: boolean;
}

function CardLink({ href, label, external = true }: CardLinkProps) {
  return (
    <a
      href={href}
      className="relative z-10 mt-auto flex items-center gap-1.5 pt-6 text-xs font-semibold uppercase tracking-[0.08em] text-muted transition-colors duration-150 hover:text-accent"
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      <span>{label}</span>
      <ArrowUpRight className="size-3" />
    </a>
  );
}

interface CardTagsProps {
  tags: string[];
}

function CardTags({ tags }: CardTagsProps) {
  return (
    <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="border-l border-accent pl-2 text-[11px] font-medium text-muted"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Eyebrow = CardEyebrow;
Card.Link = CardLink;
Card.Tags = CardTags;
