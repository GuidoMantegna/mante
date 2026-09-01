import { readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SketchSwap } from "@/components/sketch-swap";
import type { Sketch } from "@/components/svg-drawing";
import { setReducedMotion, triggerIntersection } from "./setup";

const COMPONENT_PATH = path.resolve(
  __dirname,
  "..",
  "components",
  "sketch-swap.tsx",
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

const DURATION_MS = 1000;
const ERASE_MS = DURATION_MS / 2;

function enterViewport(): HTMLElement {
  const container = screen.getByTestId("sketch-swap");
  act(() => {
    triggerIntersection(container, true);
  });
  return container;
}

function leaveViewport(): HTMLElement {
  const container = screen.getByTestId("sketch-swap");
  act(() => {
    triggerIntersection(container, false);
  });
  return container;
}

async function advance(ms: number): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("SketchSwap", () => {
  it("no dibuja hasta entrar en el viewport", () => {
    render(<SketchSwap sketch={SKETCH_A} durationMs={DURATION_MS} />);

    expect(screen.getByTestId("sketch-swap")).toHaveAttribute(
      "data-phase",
      "hidden",
    );
  });

  it("dibuja el boceto al entrar en el viewport", () => {
    render(<SketchSwap sketch={SKETCH_A} durationMs={DURATION_MS} />);

    const container = enterViewport();

    expect(container).toHaveAttribute("data-phase", "visible");
    expect(container).toHaveAttribute("data-sketch", SKETCH_A.title);
    expect(screen.getByTestId("svg-drawing")).toHaveAttribute(
      "viewBox",
      SKETCH_A.viewBox,
    );
  });

  it("al pedir otro boceto desdibuja el actual antes de cambiarlo", () => {
    const { rerender } = render(
      <SketchSwap sketch={SKETCH_A} durationMs={DURATION_MS} />,
    );
    enterViewport();

    rerender(<SketchSwap sketch={SKETCH_B} durationMs={DURATION_MS} />);

    const container = screen.getByTestId("sketch-swap");
    expect(container).toHaveAttribute("data-phase", "erased");
    expect(container).toHaveAttribute("data-sketch", SKETCH_A.title);
  });

  it("dibuja el boceto nuevo cuando termina de desdibujarse el anterior", async () => {
    const { rerender } = render(
      <SketchSwap sketch={SKETCH_A} durationMs={DURATION_MS} />,
    );
    enterViewport();
    rerender(<SketchSwap sketch={SKETCH_B} durationMs={DURATION_MS} />);

    await advance(ERASE_MS - 1);
    expect(screen.getByTestId("sketch-swap")).toHaveAttribute(
      "data-sketch",
      SKETCH_A.title,
    );

    await advance(1);

    const container = screen.getByTestId("sketch-swap");
    expect(container).toHaveAttribute("data-phase", "visible");
    expect(container).toHaveAttribute("data-sketch", SKETCH_B.title);
    expect(screen.getByTestId("svg-drawing")).toHaveAttribute(
      "viewBox",
      SKETCH_B.viewBox,
    );
  });

  it("el desdibujado dura la mitad que el dibujado", () => {
    render(<SketchSwap sketch={SKETCH_A} durationMs={DURATION_MS} />);
    enterViewport();

    const [firstPath] = screen.getAllByTestId("svg-drawing-path");
    const strokeDurationMs = Number(firstPath.dataset.strokeDurationMs);

    expect(Number(screen.getByTestId("svg-drawing").dataset.durationMs)).toBe(
      DURATION_MS,
    );
    expect(strokeDurationMs).toBeGreaterThan(0);
  });

  it("un cambio de boceto durante el desdibujado no lo reinicia y gana el último pedido", async () => {
    const { rerender } = render(
      <SketchSwap sketch={SKETCH_A} durationMs={DURATION_MS} />,
    );
    enterViewport();

    rerender(<SketchSwap sketch={SKETCH_B} durationMs={DURATION_MS} />);
    await advance(ERASE_MS / 2);
    rerender(<SketchSwap sketch={SKETCH_A} durationMs={DURATION_MS} />);

    expect(screen.getByTestId("sketch-swap")).toHaveAttribute(
      "data-phase",
      "erased",
    );

    await advance(ERASE_MS / 2);

    const container = screen.getByTestId("sketch-swap");
    expect(container).toHaveAttribute("data-phase", "visible");
    expect(container).toHaveAttribute("data-sketch", SKETCH_A.title);
  });

  it("al salir del viewport se esconde y vuelve a dibujarse al reentrar", () => {
    render(<SketchSwap sketch={SKETCH_A} durationMs={DURATION_MS} />);
    enterViewport();

    expect(leaveViewport()).toHaveAttribute("data-phase", "hidden");
    expect(enterViewport()).toHaveAttribute("data-phase", "visible");
  });

  it("fuera del viewport adopta el boceto pedido sin desdibujar", () => {
    const { rerender } = render(
      <SketchSwap sketch={SKETCH_A} durationMs={DURATION_MS} />,
    );

    rerender(<SketchSwap sketch={SKETCH_B} durationMs={DURATION_MS} />);

    const container = screen.getByTestId("sketch-swap");
    expect(container).toHaveAttribute("data-phase", "hidden");
    expect(container).toHaveAttribute("data-sketch", SKETCH_B.title);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cancela el temporizador de desdibujado al desmontar", () => {
    const { rerender, unmount } = render(
      <SketchSwap sketch={SKETCH_A} durationMs={DURATION_MS} />,
    );
    enterViewport();
    rerender(<SketchSwap sketch={SKETCH_B} durationMs={DURATION_MS} />);

    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it("con movimiento reducido muestra el boceto pedido sin temporizadores", () => {
    setReducedMotion(true);

    const { rerender } = render(
      <SketchSwap sketch={SKETCH_A} durationMs={DURATION_MS} />,
    );

    expect(screen.getByTestId("sketch-swap")).toHaveAttribute(
      "data-phase",
      "visible",
    );

    rerender(<SketchSwap sketch={SKETCH_B} durationMs={DURATION_MS} />);

    expect(screen.getByTestId("sketch-swap")).toHaveAttribute(
      "data-sketch",
      SKETCH_B.title,
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it("la animación viene de motion/react y no de framer-motion", () => {
    const source = readComponentSource();

    expect(source).not.toContain("framer-motion");
    expect(source).toContain('from "motion/react"');
  });
});
