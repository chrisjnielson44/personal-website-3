"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FadeInView } from "@/components/Motion";

// ── numbered section ──────────────────────────────────────────────────────────
export function Section({
  num,
  title,
  lead,
  id,
  children,
}: {
  num: string;
  title: string;
  lead?: ReactNode;
  id: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto mt-20 max-w-3xl scroll-mt-24">
      <FadeInView>
        <div className="mb-2 font-mono text-xs tracking-wide text-accent">§{num}</div>
        <h2 className="font-display text-2xl font-medium leading-snug text-foreground sm:text-[1.75rem]">
          {title}
        </h2>
        {lead && (
          <p className="mt-3 text-[15px] leading-7 text-muted [text-wrap:pretty]">{lead}</p>
        )}
      </FadeInView>
      <div className="mt-6">{children}</div>
    </section>
  );
}

// Prose paragraph — justified, readable measure, the body voice of the note.
export function P({ children }: { children: ReactNode }) {
  return (
    <FadeInView>
      <p className="mt-4 text-[15px] leading-7 text-muted [text-wrap:pretty]">{children}</p>
    </FadeInView>
  );
}

// ── abstract ──────────────────────────────────────────────────────────────────
export function Abstract({ children }: { children: ReactNode }) {
  return (
    <div className="glass-panel p-6 sm:p-7">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
        Abstract
      </div>
      <div className="mt-3 text-[15px] leading-7 text-foreground/90 [text-wrap:pretty]">
        {children}
      </div>
    </div>
  );
}

// ── contributions / key results ────────────────────────────────────────────────
export function Contributions({ items }: { items: { stat: string; text: ReactNode }[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((it, i) => (
        <li key={i} className="glass-panel flex gap-3 p-4">
          <span className="font-display text-xl font-medium leading-none text-accent">
            {it.stat}
          </span>
          <span className="text-sm leading-6 text-muted">{it.text}</span>
        </li>
      ))}
    </ul>
  );
}

// ── observation callout ─────────────────────────────────────────────────────────
export function Observation({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <FadeInView>
      <div className="glass-panel relative overflow-hidden p-5 pl-6">
        <span className="absolute inset-y-0 left-0 w-[3px] bg-accent" />
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          Observation {n}
        </div>
        <div className="mt-1.5 font-display text-lg font-medium text-foreground">{title}</div>
        <p className="mt-2 text-sm leading-7 text-muted [text-wrap:pretty]">{children}</p>
      </div>
    </FadeInView>
  );
}

// ── figure / table caption ──────────────────────────────────────────────────────
export function Caption({
  n,
  kind = "Figure",
  children,
}: {
  n: number;
  kind?: "Figure" | "Table";
  children: ReactNode;
}) {
  return (
    <p className="mt-3 text-xs leading-6 text-muted-foreground [text-wrap:pretty]">
      <span className="font-semibold text-muted">
        {kind} {n}.
      </span>{" "}
      {children}
    </p>
  );
}

// ── methods note (monospace-flavored detail box) ─────────────────────────────────
export function MethodNote({ title, children }: { title: string; children: ReactNode }) {
  return (
    <FadeInView>
      <div className="glass-panel p-5">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </div>
        <div className="space-y-2 text-sm leading-7 text-muted [text-wrap:pretty]">
          {children}
        </div>
      </div>
    </FadeInView>
  );
}

// ── references / notes ──────────────────────────────────────────────────────────
export function References({ items }: { items: ReactNode[] }) {
  return (
    <ol className="space-y-2 text-xs leading-6 text-muted-foreground">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="font-mono text-muted">[{i + 1}]</span>
          <span>{it}</span>
        </li>
      ))}
    </ol>
  );
}

// ── scroll-spy table of contents (fixed left rail, xl+ only) ─────────────────────
export interface TocItem {
  id: string;
  num: string;
  label: string;
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Contents"
      className="fixed left-[max(1.5rem,calc(50%-44rem))] top-1/2 z-20 hidden -translate-y-1/2 2xl:block"
    >
      <ul className="space-y-1.5">
        {items.map((it) => {
          const on = it.id === active;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                className="group flex items-center gap-2 text-xs transition-colors"
                style={{ color: on ? "var(--color-accent)" : "var(--color-muted-foreground)" }}
              >
                <span
                  className="h-px transition-all"
                  style={{
                    width: on ? 22 : 12,
                    backgroundColor: on ? "var(--color-accent)" : "var(--color-border)",
                  }}
                />
                <span
                  className="font-mono opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ opacity: on ? 1 : undefined }}
                >
                  {it.num}
                </span>
                <span
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ opacity: on ? 1 : undefined }}
                >
                  {it.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
