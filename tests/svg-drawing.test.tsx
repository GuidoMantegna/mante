import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SvgDrawing } from "@/components/svg-drawing";
import { resolveDrawTimings } from "@/hooks/useDrawSequence";
import { setReducedMotion } from "./setup";

const COMPONENT_PATH = path.resolve(
  __dirname,
  "..",
  "components",
  "svg-drawing.tsx",
);

const PATHS = ["M0 0L10 10", "M10 10L20 20", "M20 20L30 30"] as const;

function readComponentSource(): string {
  return readFileSync(COMPONENT_PATH, "utf8");
}

afterEach(() => {
  cleanup();
});

describe("SvgDrawing", () => {
  it("renderiza un path por cada entrada en orden", () => {
    render(
      <SvgDrawing paths={PATHS} viewBox="0 0 30 30" strokeWidth={2} title="Prueba" />,
    );

    const paths = screen.getAllByTestId("svg-drawing-path");

    expect(paths).toHaveLength(PATHS.length);
    expect(paths.map((p) => p.getAttribute("d"))).toEqual(PATHS);
  });

  it("expone la duración total en data-duration-ms", () => {
    render(
      <SvgDrawing
        paths={PATHS}
        viewBox="0 0 30 30"
        strokeWidth={2}
        title="Prueba"
        durationMs={900}
      />,
    );

    expect(screen.getByTestId("svg-drawing")).toHaveAttribute(
      "data-duration-ms",
      "900",
    );
  });

  it("cada path dibuja con la duración por trazo derivada de la duración total", () => {
    const { strokeDurationMs } = resolveDrawTimings(PATHS.length, 900);

    render(
      <SvgDrawing
        paths={PATHS}
        viewBox="0 0 30 30"
        strokeWidth={2}
        title="Prueba"
        durationMs={900}
      />,
    );

    for (const p of screen.getAllByTestId("svg-drawing-path")) {
      expect(p.dataset.strokeDurationMs).toBe(String(strokeDurationMs));
    }
  });

  it("expone el desfase derivado entre paths en data-stagger-ms", () => {
    const { staggerMs } = resolveDrawTimings(PATHS.length, 900);

    render(
      <SvgDrawing
        paths={PATHS}
        viewBox="0 0 30 30"
        strokeWidth={2}
        title="Prueba"
        durationMs={900}
      />,
    );

    expect(screen.getByTestId("svg-drawing")).toHaveAttribute(
      "data-stagger-ms",
      String(staggerMs),
    );
  });

  it("el tiempo total de dibujado es igual sin importar la cantidad de trazos", () => {
    const fewPaths = ["M0 0L10 10"] as const;
    const manyPaths = Array.from({ length: 10 }, (_, i) => `M${i} 0L${i + 1} 1`);

    const { strokeDurationMs: fewStroke, staggerMs: fewStagger } =
      resolveDrawTimings(fewPaths.length, 900);
    const { strokeDurationMs: manyStroke, staggerMs: manyStagger } =
      resolveDrawTimings(manyPaths.length, 900);

    const fewTotal = fewStroke + fewStagger * (fewPaths.length - 1);
    const manyTotal = manyStroke + manyStagger * (manyPaths.length - 1);

    expect(fewTotal).toBeCloseTo(900);
    expect(manyTotal).toBeCloseTo(900);
  });

  it("usa el title como aria-label", () => {
    render(
      <SvgDrawing
        paths={PATHS}
        viewBox="0 0 30 30"
        strokeWidth={2}
        title="Boceto de prueba"
      />,
    );

    expect(screen.getByRole("img", { name: "Boceto de prueba" })).toBeInTheDocument();
  });

  it("con movimiento reducido la duración por trazo es 0", () => {
    setReducedMotion(true);

    render(
      <SvgDrawing
        paths={PATHS}
        viewBox="0 0 30 30"
        strokeWidth={2}
        title="Prueba"
        durationMs={900}
      />,
    );

    for (const p of screen.getAllByTestId("svg-drawing-path")) {
      expect(p.dataset.strokeDurationMs).toBe("0");
    }
  });

  it("la animación viene de motion/react", () => {
    expect(readComponentSource()).toContain('from "motion/react"');
  });

  it("no se importa framer-motion", () => {
    expect(readComponentSource()).not.toContain("framer-motion");
  });
});
