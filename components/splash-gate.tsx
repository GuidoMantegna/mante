"use client";

import { useReducedMotion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const SPLASH_LOCKED_CLASS = "splash-locked";

/** Tramos de la cortina, en ms. */
export const SPLASH_CURTAIN_CLOSE_MS = 300;
export const SPLASH_CURTAIN_HOLD_MS = 100;
export const SPLASH_CURTAIN_OPEN_MS = 500;
// export const SPLASH_CURTAIN_CLOSE_MS = 700;
// export const SPLASH_CURTAIN_HOLD_MS = 250;
// export const SPLASH_CURTAIN_OPEN_MS = 900;

const REVEAL_KEYS = new Set(["Space", "Enter", "PageDown", "ArrowDown"]);

/**
 * Fases de la transición splash → home:
 *
 * - `idle`    — splash a la vista, cortina fuera de pantalla.
 * - `closing` — la cortina se cierra sobre el splash (que no se altera) y lo tapa.
 * - `opening` — la cortina se abre hacia los lados y deja ver la home.
 * - `done`    — cortina desmontada, la home es definitiva.
 */
export type SplashPhase = "idle" | "closing" | "opening" | "done";

interface SplashGateValue {
  phase: SplashPhase;
  /** El usuario ya disparó la transición (la cortina arrancó). */
  revealed: boolean;
  /** La home ya está a la vista: la cortina empezó a abrirse. */
  homeVisible: boolean;
  reveal: () => void;
}

// El default deja el gate "ya resuelto": cualquier consumidor montado sin
// provider (tests unitarios de componentes sueltos, Storybook, etc.) se
// comporta como si el splash nunca hubiera existido.
const SplashGateContext = createContext<SplashGateValue>({
  phase: "done",
  revealed: true,
  homeVisible: true,
  reveal: () => {},
});

export function SplashGateProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<SplashPhase>("idle");
  const prefersReducedMotion = useReducedMotion();

  // `reveal` solo actúa desde `idle`: una vez arrancada la cortina, cualquier
  // disparador posterior es un no-op y la fase la manda el temporizador.
  const reveal = useCallback(
    () => setPhase((current) => (current === "idle" ? "closing" : current)),
    [],
  );

  const revealed = phase !== "idle";
  const homeVisible = phase === "opening" || phase === "done";

  useEffect(() => {
    if (revealed) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (REVEAL_KEYS.has(event.code)) reveal();
    };

    window.addEventListener("wheel", reveal, { passive: true });
    window.addEventListener("touchmove", reveal, { passive: true });
    window.addEventListener("pointerdown", reveal, { passive: true });
    window.addEventListener("scroll", reveal, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", reveal);
      window.removeEventListener("touchmove", reveal);
      window.removeEventListener("pointerdown", reveal);
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [revealed, reveal]);

  // Avance de la máquina de fases. Se usa un temporizador en vez de los
  // callbacks de fin de animación de Motion por el mismo motivo documentado en
  // `specs/sketch-sequence/design.md`: en jsdom no son deterministas.
  useEffect(() => {
    if (phase !== "closing" && phase !== "opening") return;

    const holdMs =
      phase === "closing"
        ? SPLASH_CURTAIN_CLOSE_MS + SPLASH_CURTAIN_HOLD_MS
        : SPLASH_CURTAIN_OPEN_MS;
    const next: SplashPhase = phase === "closing" ? "opening" : "done";
    const timeoutId = setTimeout(
      () => setPhase(next),
      prefersReducedMotion ? 0 : holdMs,
    );

    return () => clearTimeout(timeoutId);
  }, [phase, prefersReducedMotion]);

  // El scroll queda bloqueado hasta que la home aparece de verdad: durante el
  // cierre la página sigue tapada y no tendría sentido dejarla desplazarse.
  useEffect(() => {
    document.documentElement.classList.toggle(SPLASH_LOCKED_CLASS, !homeVisible);

    return () => {
      document.documentElement.classList.remove(SPLASH_LOCKED_CLASS);
    };
  }, [homeVisible]);

  const value = useMemo(
    () => ({ phase, revealed, homeVisible, reveal }),
    [phase, revealed, homeVisible, reveal],
  );

  return (
    <SplashGateContext.Provider value={value}>
      {children}
    </SplashGateContext.Provider>
  );
}

export function useSplashGate(): SplashGateValue {
  return useContext(SplashGateContext);
}
