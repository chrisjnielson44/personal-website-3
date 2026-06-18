"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── CountUp ──────────────────────────────────────────────────────────────────
// Animates a number from 0 → `to` when it scrolls into view.
interface CountUpProps {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  locale?: boolean; // thousands separators
  className?: string;
}

function fmt(v: number, decimals: number, locale: boolean, prefix: string, suffix: string) {
  const n = locale
    ? Math.round(v).toLocaleString()
    : v.toFixed(decimals);
  return `${prefix}${n}${suffix}`;
}

export function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.2,
  locale = false,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (prefersReduced) {
      node.textContent = fmt(to, decimals, locale, prefix, suffix);
      return;
    }
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        node.textContent = fmt(v, decimals, locale, prefix, suffix);
      },
    });
    return () => controls.stop();
  }, [inView, to, decimals, locale, prefix, suffix, duration, prefersReduced]);

  return (
    <span ref={ref} className={cn("ce-numeral", className)}>
      {fmt(prefersReduced ? to : 0, decimals, locale, prefix, suffix)}
    </span>
  );
}

// ── SpotlightCard ─────────────────────────────────────────────────────────────
// Glass panel with a cursor-following accent glow (reuses .spotlight-card CSS).
interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  strong?: boolean;
}

export function SpotlightCard({ children, className, strong }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--spotlight-x", `${e.clientX - r.left}px`);
    el.style.setProperty("--spotlight-y", `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn("spotlight-card glass-panel", strong && "glass-panel-strong", className)}
    >
      {children}
    </div>
  );
}

// ── AnimatedBar ───────────────────────────────────────────────────────────────
// A horizontal bar whose width grows from 0 → pct% when scrolled into view.
interface AnimatedBarProps {
  pct: number;
  color: string;
  delay?: number;
  rounded?: string;
}

export function AnimatedBar({ pct, color, delay = 0, rounded = "rounded" }: AnimatedBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReduced = useReducedMotion();
  const width = prefersReduced || inView ? `${pct}%` : "0%";
  return (
    <div
      ref={ref}
      className={cn("h-full", rounded)}
      style={{
        width,
        backgroundColor: color,
        transition: prefersReduced
          ? undefined
          : `width 1s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    />
  );
}
