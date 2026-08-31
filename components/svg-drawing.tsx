"use client";

import { motion } from "motion/react";
import {
  DEFAULT_DRAW_DURATION_MS,
  useDrawSequence,
} from "@/hooks/useDrawSequence";

export interface Sketch {
  paths: readonly string[];
  viewBox: string;
  strokeWidth: number;
  title: string;
}

export type SketchPhase = "hidden" | "visible" | "erased";

export interface SvgDrawingProps extends Sketch {
  durationMs?: number;
  animate?: SketchPhase;
  className?: string;
}

export function SvgDrawing({
  paths,
  viewBox,
  strokeWidth,
  title,
  durationMs = DEFAULT_DRAW_DURATION_MS,
  animate,
  className,
}: SvgDrawingProps) {
  const { container, stroke, strokeDurationMs, staggerMs } = useDrawSequence(
    paths.length,
    durationMs,
  );

  const viewportProps = animate
    ? { animate }
    : { whileInView: "visible", viewport: { once: true, amount: 0.3 } };

  return (
    <motion.svg
      data-testid="svg-drawing"
      data-duration-ms={durationMs}
      data-stagger-ms={staggerMs}
      data-path-count={paths.length}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      role="img"
      aria-label={title}
      className={className}
      variants={container}
      initial="hidden"
      {...viewportProps}
    >
      {paths.map((d, index) => (
        <motion.path
          key={index}
          data-testid="svg-drawing-path"
          data-index={index}
          data-stroke-duration-ms={strokeDurationMs}
          d={d}
          variants={stroke}
          style={{ willChange: "stroke-dasharray" }}
        />
      ))}
    </motion.svg>
  );
}
