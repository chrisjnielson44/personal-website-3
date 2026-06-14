"use client";

import { cn } from "@/lib/utils";
import { useRef, type PointerEvent, type PropsWithChildren } from "react";

interface SpotlightCardProps extends PropsWithChildren {
  className?: string;
}

// Adapted from React Bits SpotlightCard:
// https://reactbits.dev/components/spotlight-card
export function SpotlightCard({
  children,
  className,
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={cn("spotlight-card", className)}
    >
      {children}
    </div>
  );
}
