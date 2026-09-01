"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import {
  SvgDrawing,
  type Sketch,
  type SketchPhase,
} from "@/components/svg-drawing";
import { useSplashGate } from "@/components/splash-gate";
import {
  DEFAULT_DRAW_DURATION_MS,
  resolveDrawTimings,
} from "@/hooks/useDrawSequence";

export interface SketchSwapProps {
  sketch: Sketch;
  durationMs?: number;
  className?: string;
}

interface SwapState {
  shown: Sketch;
  phase: SketchPhase;
}

export function SketchSwap({
  sketch,
  durationMs = DEFAULT_DRAW_DURATION_MS,
  className,
}: SketchSwapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.3 });
  const { homeVisible } = useSplashGate();
  const active = homeVisible && inView;
  const prefersReducedMotion = useReducedMotion();
  const [state, setState] = useState<SwapState>({
    shown: sketch,
    phase: "hidden",
  });
  const [prevActive, setPrevActive] = useState(active);

  // El boceto pedido puede cambiar mientras el actual se desdibuja, así que el
  // timeout lee el último desde una ref en vez de capturarlo: clics rápidos no
  // reinician el desdibujado ni dibujan un boceto ya descartado.
  const targetRef = useRef(sketch);

  useEffect(() => {
    targetRef.current = sketch;
  }, [sketch]);

  // Ajuste de estado durante el render (mismo patrón que SketchSequence): entrar
  // o salir del viewport reinicia el boceto, y pedir otro estando visible arranca
  // el desdibujado. Solo el tramo desdibujado -> dibujado necesita temporizador.
  if (!prefersReducedMotion) {
    if (active !== prevActive) {
      setPrevActive(active);
      setState({ shown: sketch, phase: active ? "visible" : "hidden" });
    } else if (sketch !== state.shown) {
      if (state.phase === "visible") {
        setState({ shown: state.shown, phase: "erased" });
      } else if (state.phase === "hidden") {
        setState({ shown: sketch, phase: "hidden" });
      }
    }
  }

  useEffect(() => {
    if (prefersReducedMotion || state.phase !== "erased") return;

    const { eraseTotalMs } = resolveDrawTimings(
      state.shown.paths.length,
      durationMs,
    );
    const timeoutId = setTimeout(() => {
      setState({ shown: targetRef.current, phase: "visible" });
    }, eraseTotalMs);

    return () => clearTimeout(timeoutId);
  }, [state, durationMs, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div
        data-testid="sketch-swap"
        data-sketch={sketch.title}
        data-phase="visible"
        className={className}
      >
        <SvgDrawing
          {...sketch}
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
      data-testid="sketch-swap"
      data-sketch={state.shown.title}
      data-phase={state.phase}
      className={className}
    >
      <SvgDrawing
        key={state.shown.title}
        {...state.shown}
        durationMs={durationMs}
        animate={state.phase}
        className={className}
      />
    </div>
  );
}
