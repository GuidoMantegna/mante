"use client";

import { useReducedMotion, type Variants } from "motion/react";

export const DEFAULT_DRAW_DURATION_MS = 1500;
export const DEFAULT_DRAW_STAGGER_MS = 150;

interface DrawSequence {
  container: Variants;
  stroke: Variants;
  strokeDurationMs: number;
  staggerMs: number;
}

export function useDrawSequence(
  totalDurationMs: number = DEFAULT_DRAW_DURATION_MS,
  staggerMs: number = DEFAULT_DRAW_STAGGER_MS,
): DrawSequence {
  const prefersReducedMotion = useReducedMotion();
  const strokeDurationMs = prefersReducedMotion ? 0 : totalDurationMs;
  const strokeDurationSeconds = strokeDurationMs / 1000;
  const resolvedStaggerMs = prefersReducedMotion ? 0 : staggerMs;
  const staggerSeconds = resolvedStaggerMs / 1000;

  return {
    strokeDurationMs,
    staggerMs: resolvedStaggerMs,
    container: {
      hidden: {},
      visible: {
        transition: { staggerChildren: staggerSeconds },
      },
    },
    stroke: {
      hidden: { pathLength: 0 },
      visible: {
        pathLength: 1,
        transition: { duration: strokeDurationSeconds, ease: "easeInOut" },
      },
    },
  };
}
