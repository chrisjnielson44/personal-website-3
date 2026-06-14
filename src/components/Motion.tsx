"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from "motion/react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Shared constants — tuned to the site's calm, subtle baseline.
// ---------------------------------------------------------------------------

// Default slide distance for fades/staggers (px). Small on purpose.
const DEFAULT_OFFSET = 8;

// Smooth, subtle tween for entrance animations.
const defaultTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

// Fast spring with minimal overshoot — for hover/tap micro-interactions.
const gentleSpring = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.6,
} as const;

// Simple fade animation
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

interface AnimatedProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

type Direction = "up" | "down" | "left" | "right";

// The hidden-state offset for a given travel direction.
function offsetForDirection(direction: Direction, offset: number) {
  switch (direction) {
    case "up":
      return { y: offset };
    case "down":
      return { y: -offset };
    case "left":
      return { x: offset };
    case "right":
      return { x: -offset };
  }
}

// Polymorphic motion element map (keeps JSX type-safe without prop unions).
const motionTags = {
  div: motion.div,
  span: motion.span,
  a: motion.a,
  button: motion.button,
  article: motion.article,
};
type MotionTag = keyof typeof motionTags;

// ---------------------------------------------------------------------------
// FadeIn — mount fade with optional delay (unchanged baseline primitive).
// ---------------------------------------------------------------------------
export function FadeIn({ children, className, delay = 0 }: AnimatedProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? "visible" : "hidden"}
      animate="visible"
      variants={fadeIn}
      transition={{
        ...defaultTransition,
        duration: prefersReducedMotion ? 0 : defaultTransition.duration,
        delay: prefersReducedMotion ? 0 : delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// FadeInView — reveal on scroll into view, with optional direction.
// ---------------------------------------------------------------------------
interface FadeInViewProps extends AnimatedProps {
  offset?: number;
  amount?: number;
  once?: boolean;
  direction?: Direction;
}

export function FadeInView({
  children,
  className,
  delay = 0,
  offset = DEFAULT_OFFSET,
  amount = 0.2,
  once = true,
  direction = "up",
}: FadeInViewProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, ...offsetForDirection(direction, offset) },
    visible: { opacity: 1, x: 0, y: 0 },
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={{
        ...defaultTransition,
        duration: prefersReducedMotion ? 0 : defaultTransition.duration,
        delay: prefersReducedMotion ? 0 : delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stagger / StaggerItem — sequence children in on mount or on view.
// ---------------------------------------------------------------------------
interface StaggerProps extends AnimatedProps {
  staggerDelay?: number;
  trigger?: "mount" | "view";
  amount?: number;
  once?: boolean;
}

export function Stagger({
  children,
  className,
  delay = 0,
  staggerDelay = 0.06,
  trigger = "mount",
  amount = 0.2,
  once = true,
}: StaggerProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
        delayChildren: prefersReducedMotion ? 0 : delay,
      },
    },
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? "visible" : "hidden"}
      animate={trigger === "mount" ? "visible" : undefined}
      whileInView={trigger === "view" ? "visible" : undefined}
      viewport={trigger === "view" ? { once, amount } : undefined}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  offset?: number;
}

export function StaggerItem({
  children,
  className,
  offset = DEFAULT_OFFSET,
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : offset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ...defaultTransition,
        duration: prefersReducedMotion ? 0 : defaultTransition.duration,
      },
    },
  };

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// HoverLift — subtle springy lift on hover (baseline micro-interaction).
// ---------------------------------------------------------------------------
interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  lift?: number;
  as?: MotionTag;
}

export function HoverLift({
  children,
  className,
  lift = 2,
  as = "div",
}: HoverLiftProps) {
  const prefersReducedMotion = useReducedMotion();
  const Component = motionTags[as] as typeof motion.div;

  if (prefersReducedMotion) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      className={className}
      whileHover={{ y: -lift }}
      whileTap={{ y: -lift / 2 }}
      transition={gentleSpring}
    >
      {children}
    </Component>
  );
}

// ---------------------------------------------------------------------------
// HoverScale — springy scale on hover/tap (dynamic accent for icons/buttons).
// ---------------------------------------------------------------------------
interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  tapScale?: number;
  as?: MotionTag;
}

export function HoverScale({
  children,
  className,
  scale = 1.05,
  tapScale = 0.96,
  as = "div",
}: HoverScaleProps) {
  const prefersReducedMotion = useReducedMotion();
  const Component = motionTags[as] as typeof motion.div;

  if (prefersReducedMotion) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: tapScale }}
      transition={gentleSpring}
    >
      {children}
    </Component>
  );
}

// ---------------------------------------------------------------------------
// ReadingProgress — fixed top scroll-progress bar (article pages).
// ---------------------------------------------------------------------------
interface ReadingProgressProps {
  className?: string;
}

export function ReadingProgress({ className }: ReadingProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  // Hooks must run unconditionally; pick which value drives the bar after.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });
  const scaleX = prefersReducedMotion ? scrollYProgress : smooth;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className={cn(
        "fixed inset-x-0 top-0 z-[90] h-[2px] origin-left bg-accent",
        className,
      )}
    />
  );
}

// Page transition wrapper
export function PageTransition({
  children,
  className,
}: Omit<AnimatedProps, "delay">) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Re-export motion + AnimatePresence for custom usage
export { motion, AnimatePresence, gentleSpring, defaultTransition };
