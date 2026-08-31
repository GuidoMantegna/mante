"use client";

import { motion } from "motion/react";
import {
  DEFAULT_DRAW_DURATION_MS,
  DEFAULT_DRAW_STAGGER_MS,
  useDrawSequence,
} from "@/hooks/useDrawSequence";

export interface SvgDrawingProps {
  paths: readonly string[];
  viewBox: string;
  strokeWidth: number;
  title: string;
  durationMs?: number;
  staggerMs?: number;
  className?: string;
}

export function SvgDrawing({
  paths,
  viewBox,
  strokeWidth,
  title,
  durationMs = DEFAULT_DRAW_DURATION_MS,
  staggerMs = DEFAULT_DRAW_STAGGER_MS,
  className,
}: SvgDrawingProps) {
  const { container, stroke, strokeDurationMs } = useDrawSequence(
    durationMs,
    staggerMs,
  );

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
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
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
