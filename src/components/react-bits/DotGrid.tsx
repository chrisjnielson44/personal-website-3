"use client";

import { gsap } from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
} from "react";

gsap.registerPlugin(InertiaPlugin);

interface Dot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  inertiaApplied: boolean;
}

interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  speedTrigger?: number;
  shockRadius?: number;
  shockStrength?: number;
  maxSpeed?: number;
  resistance?: number;
  returnDuration?: number;
  className?: string;
  style?: CSSProperties;
}

function throttleMouseMove(
  callback: (event: MouseEvent) => void,
  limit: number,
) {
  let lastCall = 0;

  return (event: MouseEvent) => {
    const now = performance.now();

    if (now - lastCall >= limit) {
      lastCall = now;
      callback(event);
    }
  };
}

function hexToRgb(hex: string) {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);

  if (!match) {
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: Number.parseInt(match[1]!, 16),
    g: Number.parseInt(match[2]!, 16),
    b: Number.parseInt(match[3]!, 16),
  };
}

// Adapted from React Bits DotGrid: https://reactbits.dev/backgrounds/dot-grid
export function DotGrid({
  dotSize = 2,
  gap = 24,
  baseColor = "#4c1d95",
  activeColor = "#a78bfa",
  proximity = 140,
  speedTrigger = 120,
  shockRadius = 180,
  shockStrength = 2.6,
  maxSpeed = 3200,
  resistance = 900,
  returnDuration = 1.2,
  className = "",
  style,
}: DotGridProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const canvasSizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const prefersReducedMotion = useReducedMotion();
  const pointerRef = useRef({
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
  });

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);
  const circlePath = useMemo(() => {
    if (typeof window === "undefined" || !window.Path2D) {
      return null;
    }

    const path = new Path2D();
    path.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return path;
  }, [dotSize]);

  const buildGrid = useCallback(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas) {
      return;
    }

    const { width, height } = wrapper.getBoundingClientRect();

    if (width === 0 || height === 0) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvasSizeRef.current = { width, height, dpr };

    const cell = dotSize + gap;
    const columns = Math.floor((width + gap) / cell);
    const rows = Math.floor((height + gap) / cell);
    const gridWidth = cell * columns - gap;
    const gridHeight = cell * rows - gap;
    const startX = (width - gridWidth) / 2 + dotSize / 2;
    const startY = (height - gridHeight) / 2 + dotSize / 2;
    const dots: Dot[] = [];

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        dots.push({
          cx: startX + column * cell,
          cy: startY + row * cell,
          xOffset: 0,
          yOffset: 0,
          inertiaApplied: false,
        });
      }
    }

    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    if (!circlePath) {
      return;
    }

    let animationFrame = 0;
    const proximitySquared = proximity * proximity;

    const draw = () => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      const { width, height, dpr } = canvasSizeRef.current;
      const { x: pointerX, y: pointerY } = pointerRef.current;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      for (const dot of dotsRef.current) {
        const deltaX = dot.cx - pointerX;
        const deltaY = dot.cy - pointerY;
        const distanceSquared = deltaX * deltaX + deltaY * deltaY;
        let fill = baseColor;

        if (distanceSquared <= proximitySquared) {
          const intensity =
            1 - Math.sqrt(distanceSquared) / Math.max(proximity, 1);
          const red = Math.round(
            baseRgb.r + (activeRgb.r - baseRgb.r) * intensity,
          );
          const green = Math.round(
            baseRgb.g + (activeRgb.g - baseRgb.g) * intensity,
          );
          const blue = Math.round(
            baseRgb.b + (activeRgb.b - baseRgb.b) * intensity,
          );
          fill = `rgb(${red}, ${green}, ${blue})`;
        }

        context.save();
        context.translate(dot.cx + dot.xOffset, dot.cy + dot.yOffset);
        context.fillStyle = fill;
        context.fill(circlePath);
        context.restore();
      }

      if (!prefersReducedMotion && width > 0 && height > 0) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [
    activeRgb,
    baseColor,
    baseRgb,
    circlePath,
    prefersReducedMotion,
    proximity,
  ]);

  useEffect(() => {
    buildGrid();

    const wrapper = wrapperRef.current;

    if (!wrapper) {
      return;
    }

    const observer = new ResizeObserver(buildGrid);
    observer.observe(wrapper);

    return () => {
      observer.disconnect();
    };
  }, [buildGrid]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const now = performance.now();
      const pointer = pointerRef.current;
      const deltaTime = pointer.lastTime ? now - pointer.lastTime : 16;
      const deltaX = event.clientX - pointer.lastX;
      const deltaY = event.clientY - pointer.lastY;
      let velocityX = (deltaX / deltaTime) * 1000;
      let velocityY = (deltaY / deltaTime) * 1000;
      let speed = Math.hypot(velocityX, velocityY);

      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        velocityX *= scale;
        velocityY *= scale;
        speed = maxSpeed;
      }

      const rect = canvas.getBoundingClientRect();
      pointer.lastTime = now;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.vx = velocityX;
      pointer.vy = velocityY;
      pointer.speed = speed;
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;

      for (const dot of dotsRef.current) {
        const distance = Math.hypot(
          dot.cx - pointer.x,
          dot.cy - pointer.y,
        );

        if (
          speed > speedTrigger &&
          distance < proximity &&
          !dot.inertiaApplied
        ) {
          dot.inertiaApplied = true;
          gsap.killTweensOf(dot);
          gsap.to(dot, {
            inertia: {
              xOffset: dot.cx - pointer.x + velocityX * 0.004,
              yOffset: dot.cy - pointer.y + velocityY * 0.004,
              resistance,
            },
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration,
                ease: "elastic.out(1, 0.75)",
                onComplete: () => {
                  dot.inertiaApplied = false;
                },
              });
            },
          });
        }
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      for (const dot of dotsRef.current) {
        const distance = Math.hypot(dot.cx - clickX, dot.cy - clickY);

        if (distance < shockRadius && !dot.inertiaApplied) {
          const falloff = Math.max(0, 1 - distance / shockRadius);
          dot.inertiaApplied = true;
          gsap.killTweensOf(dot);
          gsap.to(dot, {
            xOffset: (dot.cx - clickX) * shockStrength * falloff,
            yOffset: (dot.cy - clickY) * shockStrength * falloff,
            duration: 0.18,
            ease: "power2.out",
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration,
                ease: "elastic.out(1, 0.75)",
                onComplete: () => {
                  dot.inertiaApplied = false;
                },
              });
            },
          });
        }
      }
    };

    const throttledMouseMove = throttleMouseMove(handleMouseMove, 32);
    window.addEventListener("mousemove", throttledMouseMove, {
      passive: true,
    });
    wrapper.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
      wrapper.removeEventListener("click", handleClick);
      gsap.killTweensOf(dotsRef.current);
    };
  }, [
    maxSpeed,
    prefersReducedMotion,
    proximity,
    resistance,
    returnDuration,
    shockRadius,
    shockStrength,
    speedTrigger,
  ]);

  return (
    <div
      ref={wrapperRef}
      className={`relative size-full overflow-hidden ${className}`}
      style={style}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full"
      />
    </div>
  );
}
