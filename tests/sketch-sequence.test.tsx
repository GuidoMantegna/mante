import { readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SketchSequence } from "@/components/sketch-sequence";
import type { Sketch } from "@/components/svg-drawing";
import { setReducedMotion, triggerIntersection } from "./setup";

const COMPONENT_PATH = path.resolve(
  __dirname,
  "..",
  "components",
  "sketch-sequence.tsx",
);

function readComponentSource(): string {
  return readFileSync(COMPONENT_PATH, "utf8");
}

const SKETCH_A: Sketch = {
  paths: ["M0 0L1 1", "M1 1L2 2"],
  viewBox: "0 0 10 10",
  strokeWidth: 1,
  title: "Boceto A",
};

const SKETCH_B: Sketch = {
  paths: ["M0 0L1 1", "M1 1L2 2", "M2 2L3 3"],
  viewBox: "0 0 20 20",
  strokeWidth: 1,
  title: "Boceto B",
};

const SKETCH_C: Sketch = {
  paths: ["M0 0L1 1"],
  viewBox: "0 0 30 30",
  strokeWidth: 1,
  title: "Boceto C",
};

const DURATION_MS = 1000;
const HOLD_MS = 500;
const ERASE_MS = DURATION_MS / 2;

function enterViewport(): HTMLElement {
  const container = screen.getByTestId("sketch-sequence");
  act(() => {
    triggerIntersection(container, true);
  });
  return container;
}

function leaveViewport(): HTMLElement {
  const container = screen.getByTestId("sketch-sequence");
  act(() => {
    triggerIntersection(container, false);
  });
  return container;
}

async function advance(ms: number): Promise<void> {
  // Se usa la variante async para que los timeouts encadenados (setTimeout ->
  // setState -> efecto -> nuevo setTimeout) se resuelvan dentro de un mismo avance,
  // en vez de quedar a mitad de camino por no ceder al microtask queue de React.
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

// El efecto que reprograma el siguiente temporizador se aplica en un flush de React
// (act) posterior al que dispara el timer anterior, así que un ciclo completo (dibujar
// + sostener -> desdibujar) necesita dos avances secuenciales en vez de uno combinado:
// de lo contrario el segundo temporizador se registra después de que el reloj falso ya
// pasó su horario y nunca dispara dentro del mismo avance.
async function advanceThroughCycle(): Promise<void> {
  await advance(DURATION_MS + HOLD_MS);
  await advance(ERASE_MS);
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("SketchSequence", () => {
  it("R1: al entrar en el viewport dibuja el primer boceto de la secuencia", () => {
    render(
      <SketchSequence
        sketches={[SKETCH_A, SKETCH_B]}
        durationMs={DURATION_MS}
        holdMs={HOLD_MS}
      />,
    );

    const container = enterViewport();

    expect(container).toHaveAttribute("data-active-index", "0");
    expect(container).toHaveAttribute("data-phase", "visible");
    expect(screen.getByTestId("svg-drawing")).toHaveAttribute(
      "viewBox",
      SKETCH_A.viewBox,
    );
  });

  it("R2: sostiene el boceto dibujado holdMs antes de empezar a desdibujarlo", async () => {
    render(
      <SketchSequence
        sketches={[SKETCH_A, SKETCH_B]}
        durationMs={DURATION_MS}
        holdMs={HOLD_MS}
      />,
    );
    const container = enterViewport();

    await advance(DURATION_MS + HOLD_MS - 1);
    expect(container).toHaveAttribute("data-phase", "visible");

    await advance(1);
    expect(container).toHaveAttribute("data-phase", "erased");
  });

  it("R5: terminado el desdibujado, avanza al siguiente boceto y lo dibuja", async () => {
    render(
      <SketchSequence
        sketches={[SKETCH_A, SKETCH_B]}
        durationMs={DURATION_MS}
        holdMs={HOLD_MS}
      />,
    );
    const container = enterViewport();

    await advanceThroughCycle();

    expect(container).toHaveAttribute("data-active-index", "1");
    expect(container).toHaveAttribute("data-phase", "visible");
    expect(screen.getByTestId("svg-drawing")).toHaveAttribute(
      "viewBox",
      SKETCH_B.viewBox,
    );
  });

  it("R6: el último boceto queda fijo, sin más transiciones ni temporizadores", async () => {
    render(
      <SketchSequence
        sketches={[SKETCH_A, SKETCH_B]}
        durationMs={DURATION_MS}
        holdMs={HOLD_MS}
      />,
    );
    const container = enterViewport();

    await advanceThroughCycle();
    await advance(DURATION_MS * 10);

    expect(container).toHaveAttribute("data-active-index", "1");
    expect(container).toHaveAttribute("data-phase", "visible");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("R8: al salir del viewport reinicia el estado y cancela el temporizador pendiente", async () => {
    render(
      <SketchSequence
        sketches={[SKETCH_A, SKETCH_B]}
        durationMs={DURATION_MS}
        holdMs={HOLD_MS}
      />,
    );
    enterViewport();
    await advance(100);

    const container = leaveViewport();

    expect(container).toHaveAttribute("data-active-index", "0");
    expect(container).toHaveAttribute("data-phase", "hidden");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("R9: al volver a entrar en el viewport la secuencia arranca de nuevo desde el primero", async () => {
    render(
      <SketchSequence
        sketches={[SKETCH_A, SKETCH_B]}
        durationMs={DURATION_MS}
        holdMs={HOLD_MS}
      />,
    );
    enterViewport();
    await advanceThroughCycle();
    leaveViewport();

    const container = enterViewport();

    expect(container).toHaveAttribute("data-active-index", "0");
    expect(container).toHaveAttribute("data-phase", "visible");
    expect(screen.getByTestId("svg-drawing")).toHaveAttribute(
      "viewBox",
      SKETCH_A.viewBox,
    );
  });

  it("R10: con prefers-reduced-motion se renderiza solo el último boceto, fijo y sin temporizadores", () => {
    setReducedMotion(true);

    render(
      <SketchSequence
        sketches={[SKETCH_A, SKETCH_B]}
        durationMs={DURATION_MS}
        holdMs={HOLD_MS}
      />,
    );

    const container = screen.getByTestId("sketch-sequence");

    expect(container).toHaveAttribute("data-active-index", "1");
    expect(container).toHaveAttribute("data-phase", "visible");
    expect(screen.getByTestId("svg-drawing")).toHaveAttribute(
      "viewBox",
      SKETCH_B.viewBox,
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it("R11: al desmontar no queda ningún temporizador activo", async () => {
    const { unmount } = render(
      <SketchSequence
        sketches={[SKETCH_A, SKETCH_B]}
        durationMs={DURATION_MS}
        holdMs={HOLD_MS}
      />,
    );
    enterViewport();
    await advance(100);

    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it("R12: la animación viene de motion/react y no de framer-motion", () => {
    expect(readComponentSource()).toContain('from "motion/react"');
    expect(readComponentSource()).not.toContain("framer-motion");
  });

  it("R13: recorre cualquier cantidad de bocetos en orden hasta quedar fijo en el último", async () => {
    render(
      <SketchSequence
        sketches={[SKETCH_A, SKETCH_B, SKETCH_C]}
        durationMs={DURATION_MS}
        holdMs={HOLD_MS}
      />,
    );
    const container = enterViewport();

    await advanceThroughCycle();
    expect(container).toHaveAttribute("data-active-index", "1");

    await advanceThroughCycle();
    expect(container).toHaveAttribute("data-active-index", "2");
    expect(container).toHaveAttribute("data-phase", "visible");
    expect(screen.getByTestId("svg-drawing")).toHaveAttribute(
      "viewBox",
      SKETCH_C.viewBox,
    );

    await advance(DURATION_MS * 5);
    expect(container).toHaveAttribute("data-active-index", "2");
    expect(vi.getTimerCount()).toBe(0);
  });
});
