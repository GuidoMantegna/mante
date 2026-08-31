import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  CLOSET_SKETCH_PATHS,
  CLOSET_SKETCH_VIEW_BOX,
  ClosetSketch,
} from "@/components/closet-sketch";

afterEach(() => {
  cleanup();
});

describe("ClosetSketch", () => {
  it("expone las 46 rutas del boceto original", () => {
    expect(CLOSET_SKETCH_PATHS).toHaveLength(46);
  });

  it("cada ruta es una cadena `d` no vacía", () => {
    for (const d of CLOSET_SKETCH_PATHS) {
      expect(typeof d).toBe("string");
      expect(d.length).toBeGreaterThan(0);
    }
  });

  it("dibuja primero la estructura general del placard", () => {
    expect(CLOSET_SKETCH_PATHS[0]).toContain("M1274.24 2815.67V369.389");
  });

  it("renderiza con el viewBox del placard", () => {
    render(<ClosetSketch />);

    expect(screen.getByTestId("svg-drawing")).toHaveAttribute(
      "viewBox",
      CLOSET_SKETCH_VIEW_BOX,
    );
  });

  it("renderiza un path por cada entrada del boceto", () => {
    render(<ClosetSketch />);

    expect(screen.getAllByTestId("svg-drawing-path")).toHaveLength(
      CLOSET_SKETCH_PATHS.length,
    );
  });
});
