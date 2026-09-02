"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useSplashGate } from "@/components/splash-gate";

export const REVEAL_DURATION_MS = 700;
export const REVEAL_SCALE_DURATION_MS = 900;
export const REVEAL_STAGGER_MS = 120;
export const REVEAL_RISE_PX = 32;
export const REVEAL_SCALE_FROM = 1.06;
export const REVEAL_AMOUNT = 0.3;
export const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

export type ScrollRevealVariant = "rise" | "scale";

const HIDDEN_TRANSFORM: Record<ScrollRevealVariant, string> = {
  rise: `translateY(${REVEAL_RISE_PX}px)`,
  scale: `scale(${REVEAL_SCALE_FROM})`,
};

const VISIBLE_TRANSFORM: Record<ScrollRevealVariant, string> = {
  rise: "translateY(0px)",
  scale: "scale(1)",
};

const DEFAULT_DURATION_MS: Record<ScrollRevealVariant, number> = {
  rise: REVEAL_DURATION_MS,
  scale: REVEAL_SCALE_DURATION_MS,
};

export interface ScrollRevealProps {
  children: ReactNode;
  variant?: ScrollRevealVariant;
  delayMs?: number;
  durationMs?: number;
  amount?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  variant = "rise",
  delayMs = 0,
  durationMs,
  amount = REVEAL_AMOUNT,
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount, once: true });
  const { homeVisible } = useSplashGate();
  const prefersReducedMotion = useReducedMotion();

  // Con reduced motion se muestra el estado final sin depender del
  // IntersectionObserver: ocultar hasta la intersección solo tendría sentido
  // como preludio de una animación que aquí no va a correr.
  const revealed = prefersReducedMotion || (inView && homeVisible);
  const resolvedDurationMs = prefersReducedMotion
    ? 0
    : (durationMs ?? DEFAULT_DURATION_MS[variant]);
  const resolvedDelayMs = prefersReducedMotion ? 0 : delayMs;

  return (
    <motion.div
      ref={ref}
      data-testid="scroll-reveal"
      data-variant={variant}
      data-revealed={revealed}
      data-duration-ms={resolvedDurationMs}
      data-delay-ms={resolvedDelayMs}
      className={className}
      initial={false}
      animate={{
        opacity: revealed ? 1 : 0,
        transform: revealed
          ? VISIBLE_TRANSFORM[variant]
          : HIDDEN_TRANSFORM[variant],
      }}
      transition={{
        duration: resolvedDurationMs / 1000,
        delay: resolvedDelayMs / 1000,
        ease: REVEAL_EASE,
      }}
    >
      {children}
    </motion.div>
  );
}
