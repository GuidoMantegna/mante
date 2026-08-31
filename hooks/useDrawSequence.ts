"use client";

import { useReducedMotion, type Variants } from "motion/react";

export const DEFAULT_DRAW_DURATION_MS = 3000;
export const DRAW_STAGGER_RATIO = 0.1;
export const ERASE_SPEED_RATIO = 0.5;

interface DrawTimings {
  strokeDurationMs: number;
  staggerMs: number;
  drawTotalMs: number;
  eraseTotalMs: number;
}

// El desfase es proporcional a la duración de un trazo (DRAW_STAGGER_RATIO), así que
// el total del boceto es constante sin importar cuántos paths tenga: total = trazo *
// (1 + DRAW_STAGGER_RATIO * (n - 1)).
export function resolveDrawTimings(
  pathCount: number,
  totalDurationMs: number,
): DrawTimings {
  const strokeDurationMs =
    totalDurationMs / (1 + DRAW_STAGGER_RATIO * Math.max(pathCount - 1, 0));

  return {
    strokeDurationMs,
    staggerMs: strokeDurationMs * DRAW_STAGGER_RATIO,
    drawTotalMs: totalDurationMs,
    eraseTotalMs: totalDurationMs * ERASE_SPEED_RATIO,
  };
}

interface DrawSequence {
  container: Variants;
  stroke: Variants;
  strokeDurationMs: number;
  staggerMs: number;
}

export function useDrawSequence(
  pathCount: number,
  totalDurationMs: number = DEFAULT_DRAW_DURATION_MS,
): DrawSequence {
  const prefersReducedMotion = useReducedMotion();
  const { strokeDurationMs, staggerMs } = resolveDrawTimings(
    pathCount,
    totalDurationMs,
  );

  const resolvedStrokeDurationMs = prefersReducedMotion ? 0 : strokeDurationMs;
  const resolvedStaggerMs = prefersReducedMotion ? 0 : staggerMs;
  const strokeDurationSeconds = resolvedStrokeDurationMs / 1000;
  const staggerSeconds = resolvedStaggerMs / 1000;
  const eraseStrokeDurationSeconds = strokeDurationSeconds * ERASE_SPEED_RATIO;
  const eraseStaggerSeconds = staggerSeconds * ERASE_SPEED_RATIO;

  return {
    strokeDurationMs: resolvedStrokeDurationMs,
    staggerMs: resolvedStaggerMs,
    container: {
      hidden: {},
      visible: {
        transition: { staggerChildren: staggerSeconds },
      },
      erased: {
        transition: {
          staggerChildren: eraseStaggerSeconds,
          staggerDirection: -1,
        },
      },
    },
    stroke: {
      hidden: { pathLength: 0 },
      visible: {
        pathLength: 1,
        transition: { duration: strokeDurationSeconds, ease: "easeInOut" },
      },
      erased: {
        pathLength: 0,
        transition: { duration: eraseStrokeDurationSeconds, ease: "easeInOut" },
      },
    },
  };
}
