import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SvgDrawing } from "@/components/svg-drawing";
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

  it("cada path dibuja con la duración total completa", () => {
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
      expect(p.dataset.strokeDurationMs).toBe("900");
    }
  });

  it("expone el desfase entre paths en data-stagger-ms", () => {
    render(
      <SvgDrawing
        paths={PATHS}
        viewBox="0 0 30 30"
        strokeWidth={2}
        title="Prueba"
        staggerMs={200}
      />,
    );

    expect(screen.getByTestId("svg-drawing")).toHaveAttribute(
      "data-stagger-ms",
      "200",
    );
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
