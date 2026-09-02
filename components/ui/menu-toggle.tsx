"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

/** Tramo 1: las líneas convergen/se separan del centro vertical. */
export const MENU_ICON_COLLAPSE_MS = 140;
/** Tramo 2: las líneas superior/inferior rotan para formar/deshacer la X. */
export const MENU_ICON_ROTATE_MS = 160;

const MENU_ICON_OFFSET_PX = 10;
const MENU_ICON_X_SCALE = 1.24;

const LINE_OFFSETS = [-MENU_ICON_OFFSET_PX, 0, MENU_ICON_OFFSET_PX];

export interface MenuToggleProps {
  open: boolean;
  onToggle: () => void;
  className?: string;
}

export function MenuToggle({ open, onToggle, className }: MenuToggleProps) {
  const prefersReducedMotion = useReducedMotion();
  const collapseSeconds = prefersReducedMotion ? 0 : MENU_ICON_COLLAPSE_MS / 1000;
  const rotateSeconds = prefersReducedMotion ? 0 : MENU_ICON_ROTATE_MS / 1000;

  const lineVariants: Variants = {
    closed: (offset: number) => ({
      y: offset,
      rotate: 0,
      scaleX: 1,
      transition: {
        rotate: { duration: rotateSeconds, delay: 0 },
        scaleX: { duration: rotateSeconds, delay: 0 },
        y: { duration: collapseSeconds, delay: rotateSeconds },
      },
    }),
    open: (offset: number) => ({
      y: 0,
      rotate: offset === 0 ? 0 : offset < 0 ? 45 : -45,
      scaleX: MENU_ICON_X_SCALE,
      transition: {
        y: { duration: collapseSeconds, delay: 0 },
        rotate: { duration: rotateSeconds, delay: collapseSeconds },
        scaleX: { duration: rotateSeconds, delay: collapseSeconds },
      },
    }),
  };

  const middleLineVariants: Variants = {
    closed: {
      opacity: 1,
      transition: { duration: collapseSeconds, delay: rotateSeconds },
    },
    open: {
      opacity: 0,
      transition: { duration: collapseSeconds, delay: 0 },
    },
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? "Cerrar menú" : "Abrir menú"}
      data-testid="menu-toggle"
      data-open={open}
      data-collapse-ms={prefersReducedMotion ? 0 : MENU_ICON_COLLAPSE_MS}
      data-rotate-ms={prefersReducedMotion ? 0 : MENU_ICON_ROTATE_MS}
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center ${className ?? ""}`}
    >
      <span className="relative h-[23px] w-[38px]">
        {LINE_OFFSETS.map((offset, index) => (
          <motion.span
            key={offset}
            custom={offset}
            initial={false}
            animate={open ? "open" : "closed"}
            variants={index === 1 ? middleLineVariants : lineVariants}
            style={{ top: "50%", marginTop: -1.5, willChange: "transform" }}
            className="absolute left-0 h-[3px] w-full origin-center bg-cancel"
          />
        ))}
      </span>
    </button>
  );
}
