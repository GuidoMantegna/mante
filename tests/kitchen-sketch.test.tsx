import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  KITCHEN_SKETCH_PATHS,
  KITCHEN_SKETCH_VIEW_BOX,
  KitchenSketch,
} from "@/components/sketchs/kitchen-sketch";

afterEach(() => {
  cleanup();
});

describe("KitchenSketch", () => {
  it("expone las 34 rutas del boceto original", () => {
    expect(KITCHEN_SKETCH_PATHS).toHaveLength(34);
  });

  it("cada ruta es una cadena `d` no vacía", () => {
    for (const d of KITCHEN_SKETCH_PATHS) {
      expect(typeof d).toBe("string");
      expect(d.length).toBeGreaterThan(0);
    }
  });

  it("dibuja primero los muebles de bajomesada", () => {
    expect(KITCHEN_SKETCH_PATHS[0]).toContain("M8.5 3108.07V1972.21");
    expect(KITCHEN_SKETCH_PATHS[1]).toContain("M818.5 3108.07V1972.21");
    expect(KITCHEN_SKETCH_PATHS[2]).toContain("M1629.5 1209.03V233.946");
  });

  it("renderiza con el viewBox de la cocina", () => {
    render(<KitchenSketch />);

    expect(screen.getByTestId("svg-drawing")).toHaveAttribute(
      "viewBox",
      KITCHEN_SKETCH_VIEW_BOX,
    );
  });

  it("renderiza un path por cada entrada del boceto", () => {
    render(<KitchenSketch />);

    expect(screen.getAllByTestId("svg-drawing-path")).toHaveLength(
      KITCHEN_SKETCH_PATHS.length,
    );
  });
});
