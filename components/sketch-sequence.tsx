"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { SvgDrawing, type Sketch, type SketchPhase } from "@/components/svg-drawing";
import { useSplashGate } from "@/components/splash-gate";
import {
  DEFAULT_DRAW_DURATION_MS,
  resolveDrawTimings,
} from "@/hooks/useDrawSequence";

export const SKETCH_HOLD_MS = 2000;

export interface SketchSequenceProps {
  sketches: readonly Sketch[];
  holdMs?: number;
  durationMs?: number;
  className?: string;
}

interface SequenceState {
  index: number;
  phase: SketchPhase;
}

const INITIAL_STATE: SequenceState = { index: 0, phase: "hidden" };

export function SketchSequence({
  sketches,
  holdMs = SKETCH_HOLD_MS,
  durationMs = DEFAULT_DRAW_DURATION_MS,
  className,
}: SketchSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.3 });
  const { homeVisible } = useSplashGate();
  const active = homeVisible && inView;
  const prefersReducedMotion = useReducedMotion();
  const [state, setState] = useState<SequenceState>(INITIAL_STATE);
  const [prevActive, setPrevActive] = useState(active);

  // Arranque/reinicio de la secuencia al entrar/salir del viewport (o al abrirse la
  // cortina del splash): se ajusta durante el render (comparando contra el `active` del render
  // anterior, guardado en estado) en vez de en un efecto, siguiendo el patrón de React
  // para "ajustar estado cuando cambia una prop" (evita el round-trip de un efecto
  // adicional para algo que no depende de nada externo más que `active`). Los timeouts
  // de dibujado/desdibujado sí necesitan un efecto real, porque se sincronizan con un
  // temporizador externo.
  if (!prefersReducedMotion && active !== prevActive) {
    setPrevActive(active);
    setState(active ? { index: 0, phase: "visible" } : INITIAL_STATE);
  }

  // Un único timeout a la vez: cada rama de esta máquina de estados programa como
  // mucho uno, y el cleanup lo cancela si `inView`/`state` cambian antes de que dispare
  // (cubre el reinicio al salir del viewport y la limpieza al desmontar).
  useEffect(() => {
    if (prefersReducedMotion || !active || state.phase === "hidden") return;

    const isLastSketch = state.index === sketches.length - 1;
    const activePathCount = sketches[state.index].paths.length;

    if (state.phase === "visible") {
      if (isLastSketch) return;

      const { drawTotalMs } = resolveDrawTimings(activePathCount, durationMs);
      const timeoutId = setTimeout(() => {
        setState((current) => ({ ...current, phase: "erased" }));
      }, drawTotalMs + holdMs);

      return () => clearTimeout(timeoutId);
    }

    if (state.phase === "erased") {
      const { eraseTotalMs } = resolveDrawTimings(activePathCount, durationMs);
      const timeoutId = setTimeout(() => {
        setState((current) => ({
          index: current.index + 1,
          phase: "visible",
        }));
      }, eraseTotalMs);

      return () => clearTimeout(timeoutId);
    }
  }, [active, state, sketches, holdMs, durationMs, prefersReducedMotion]);

  if (prefersReducedMotion) {
    const lastIndex = sketches.length - 1;

    return (
      <div
        data-testid="sketch-sequence"
        data-active-index={lastIndex}
        data-phase="visible"
        data-hold-ms={holdMs}
        className={className}
      >
        <SvgDrawing
          {...sketches[lastIndex]}
          durationMs={durationMs}
          animate="visible"
          className={className}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-testid="sketch-sequence"
      data-active-index={state.index}
      data-phase={state.phase}
      data-hold-ms={holdMs}
      className={className}
    >
      <SvgDrawing
        key={state.index}
        {...sketches[state.index]}
        durationMs={durationMs}
        animate={state.phase}
        className={className}
      />
    </div>
  );
}
