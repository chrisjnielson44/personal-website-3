"use client";

import { motion, type Variants } from "motion/react";
import { type ReactNode } from "react";

// Animation variants - subtle movements
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 8 },
  visible: { opacity: 1, x: 0 },
};

// Stagger container for child animations - smooth timing
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

// Default transition settings - smooth and subtle
export const defaultTransition = {
  duration: 0.35,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

export const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

// Reusable animated components
interface AnimatedProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Simple fade in (no vertical movement)
export function FadeIn({ children, className, delay = 0 }: AnimatedProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ ...defaultTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade in when element enters viewport
export function FadeInView({ children, className, delay = 0 }: AnimatedProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      variants={fadeIn}
      transition={{ ...defaultTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale in animation
export function ScaleIn({ children, className, delay = 0 }: AnimatedProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleIn}
      transition={{ ...defaultTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered container for lists
interface StaggerProps {
  children: ReactNode;
  className?: string;
  fast?: boolean;
}

export function Stagger({ children, className, fast = false }: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fast ? staggerContainerFast : staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger that triggers on viewport entry
export function StaggerView({
  children,
  className,
  fast = false,
}: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      variants={fast ? staggerContainerFast : staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger item (use inside Stagger/StaggerView) - subtle slide up
export function StaggerItem({
  children,
  className,
}: Omit<AnimatedProps, "delay">) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={defaultTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Page transition wrapper - very subtle
export function PageTransition({
  children,
  className,
}: Omit<AnimatedProps, "delay">) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover lift effect for cards - minimal movement
interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}

export function HoverLift({ children, className, as = "div" }: HoverLiftProps) {
  const Component = motion[as];
  return (
    <Component
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={className}
    >
      {children}
    </Component>
  );
}

// Hover scale effect - barely noticeable
export function HoverScale({
  children,
  className,
}: Omit<AnimatedProps, "delay">) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.99 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Re-export motion for custom usage
export { motion };
