"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  SPLASH_CURTAIN_CLOSE_MS,
  SPLASH_CURTAIN_OPEN_MS,
  useSplashGate,
} from "./splash-gate";

const CURTAIN_EASE = [0.83, 0, 0.17, 1] as const;

// Cada panel mide algo más de la mitad del viewport para que al cerrarse se
// solapen 2px en el centro: sin ese margen, un ancho impar deja una costura de
// subpíxel por la que se ve lo que hay debajo.
const PANELS = [
  { side: "left", anchor: "left-0", offset: "-100%" },
  { side: "right", anchor: "right-0", offset: "100%" },
] as const;

export function SplashCurtain() {
  const { phase } = useSplashGate();
  const prefersReducedMotion = useReducedMotion();

  const closed = phase === "closing";
  const durationMs = prefersReducedMotion
    ? 0
    : closed
      ? SPLASH_CURTAIN_CLOSE_MS
      : SPLASH_CURTAIN_OPEN_MS;

  return (
    <div
      data-testid="splash-curtain"
      data-phase={phase}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-svh w-full overflow-hidden"
    >
      {PANELS.map((panel) => (
        <motion.div
          key={panel.side}
          data-testid="splash-curtain-panel"
          data-side={panel.side}
          data-duration-ms={durationMs}
          className={`absolute inset-y-0 ${panel.anchor} w-[calc(50%+1px)] bg-dark`}
          initial={false}
          animate={{ x: closed ? "0%" : panel.offset }}
          transition={{ duration: durationMs / 1000, ease: CURTAIN_EASE }}
          style={{ willChange: "transform" }}
        />
      ))}
    </div>
  );
}
