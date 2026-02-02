"use client";

import { motion, type Variants } from "motion/react";
import { type ReactNode } from "react";

// Simple fade animation
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Default transition - smooth and subtle
const defaultTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

interface AnimatedProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Simple fade in with optional delay
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

// Page transition wrapper
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

// Re-export motion for custom usage
export { motion };
