import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  KITCHEN_SKETCH_PATHS,
  KITCHEN_SKETCH_VIEW_BOX,
  KitchenSketch,
} from "@/components/kitchen-sketch";

afterEach(() => {
  cleanup();
});

describe("KitchenSketch", () => {
  it("expone las 19 rutas del boceto original", () => {
    expect(KITCHEN_SKETCH_PATHS).toHaveLength(19);
  });

  it("cada ruta es una cadena `d` no vacía", () => {
    for (const d of KITCHEN_SKETCH_PATHS) {
      expect(typeof d).toBe("string");
      expect(d.length).toBeGreaterThan(0);
    }
  });

  it("dibuja primero la estructura: paredes, mesada e isla", () => {
    expect(KITCHEN_SKETCH_PATHS[0]).toContain("M1264.62 8.5H5009.63");
    expect(KITCHEN_SKETCH_PATHS[1]).toContain("M2616.5 1960.5H5099.5");
    expect(KITCHEN_SKETCH_PATHS[2]).toContain("M2665.5 2079.5");
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
