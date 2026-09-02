import { readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PROJECTS_INTERVAL_MS,
  ProjectsSection,
} from "@/components/sections/projects-section";
import { COCINAS_ICON_SKETCH } from "@/components/sketchs/cocinas-icon-sketch";
import {
  ICON_SKETCH_STROKE_WIDTH,
  ICON_SKETCH_VIEW_BOX,
} from "@/components/sketchs/icon-sketch";
import { PLACARD_ICON_SKETCH } from "@/components/sketchs/placard-icon-sketch";
import { VESTIDOR_ICON_SKETCH } from "@/components/sketchs/vestidor-icon-sketch";
import { DEFAULT_DRAW_DURATION_MS } from "@/hooks/useDrawSequence";
import { setReducedMotion, triggerIntersection } from "./setup";

const SKETCH_ERASE_MS = DEFAULT_DRAW_DURATION_MS / 2;

const COMPONENT_PATHS = [
  "sections/projects-section.tsx",
  "crossfade-gallery.tsx",
].map((file) => path.resolve(__dirname, "..", "components", file));

function readComponentSources(): string[] {
  return COMPONENT_PATHS.map((file) => readFileSync(file, "utf8"));
}

function getLayers(): HTMLElement[] {
  return screen.getAllByTestId("project-layer");
}

function getActiveSrc(): string {
  const [active] = getLayers().filter((layer) => layer.dataset.active === "true");
  return active?.dataset.src ?? "";
}

function resolvedSrc(image: HTMLElement): string {
  return decodeURIComponent(image.getAttribute("src") ?? "");
}

function advance(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function enterViewport(): void {
  const gallery = screen.getByTestId("projects-gallery");
  act(() => {
    triggerIntersection(gallery, true);
  });
}

function getSketch(): HTMLElement {
  return screen.getByTestId("sketch-swap");
}

function enterSketchViewport(): void {
  act(() => {
    triggerIntersection(getSketch(), true);
  });
}

async function advanceAsync(ms: number): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function getButton(label: string): HTMLElement {
  return screen.getByRole("button", { name: label });
}

describe("ProjectsSection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renderiza los tres botones de tipo de proyecto", () => {
    render(<ProjectsSection />);

    for (const label of ["COCINAS", "PLACARDS", "VESTIDORES"]) {
      const button = getButton(label);
      expect(button).toHaveAttribute("type", "button");
    }
  });

  it("monta las nueve capas en orden canónico", () => {
    render(<ProjectsSection />);

    const layers = getLayers();

    expect(layers).toHaveLength(9);
    expect(layers.map((layer) => layer.dataset.src)).toEqual([
      "/images/projects/cocina-1.png",
      "/images/projects/cocina-2.png",
      "/images/projects/cocina-3.png",
      "/images/projects/placard-1.webp",
      "/images/projects/placard-2.avif",
      "/images/projects/placard-3.jpg",
      "/images/projects/vestidor-1.jpg",
      "/images/projects/vestidor-2.jpg",
      "/images/projects/vestidor-3.webp",
    ]);
  });

  it("cada capa contiene la imagen de su data-src", () => {
    render(<ProjectsSection />);

    for (const layer of getLayers()) {
      const image = layer.querySelector("img");

      expect(image).not.toBeNull();
      expect(resolvedSrc(image as HTMLElement)).toContain(layer.dataset.src);
    }
  });

  it("arranca con COCINAS seleccionado y cocina-1 como capa activa", () => {
    render(<ProjectsSection />);

    expect(getButton("COCINAS")).toHaveAttribute("aria-pressed", "true");
    expect(getActiveSrc()).toBe("/images/projects/cocina-1.png");

    const [first, ...rest] = getLayers();
    expect(first).toHaveStyle({ opacity: "1" });
    for (const layer of rest) {
      expect(layer).toHaveStyle({ opacity: "0" });
    }
  });

  it("el botón seleccionado usa el tratamiento visual de selección", () => {
    render(<ProjectsSection />);

    expect(getButton("COCINAS")).toHaveClass(
      "font-bold",
      "underline",
      "text-accent",
    );
    expect(getButton("PLACARDS")).not.toHaveClass(
      "font-bold",
      "underline",
      "text-accent",
    );
    expect(getButton("PLACARDS")).toHaveClass("text-2xl");
  });

  it("al pulsar PLACARDS la capa activa pasa a placard-1", () => {
    render(<ProjectsSection />);

    fireEvent.click(getButton("PLACARDS"));

    expect(getButton("PLACARDS")).toHaveAttribute("aria-pressed", "true");
    expect(getActiveSrc()).toBe("/images/projects/placard-1.webp");
  });

  it("al pulsar VESTIDORES la capa activa pasa a vestidor-1", () => {
    render(<ProjectsSection />);

    fireEvent.click(getButton("VESTIDORES"));

    expect(getButton("VESTIDORES")).toHaveAttribute("aria-pressed", "true");
    expect(getActiveSrc()).toBe("/images/projects/vestidor-1.jpg");
  });

  it("no rota mientras la sección no está en el viewport", () => {
    render(<ProjectsSection />);

    expect(vi.getTimerCount()).toBe(0);

    advance(PROJECTS_INTERVAL_MS * 2);

    expect(getActiveSrc()).toBe("/images/projects/cocina-1.png");
  });

  it("no cambia la capa activa antes de 3000 ms", () => {
    render(<ProjectsSection />);
    enterViewport();

    advance(PROJECTS_INTERVAL_MS - 1);

    expect(getActiveSrc()).toBe("/images/projects/cocina-1.png");
  });

  it("avanza a la siguiente imagen cada 3000 ms", () => {
    render(<ProjectsSection />);
    enterViewport();

    advance(PROJECTS_INTERVAL_MS);
    expect(getActiveSrc()).toBe("/images/projects/cocina-2.png");

    advance(PROJECTS_INTERVAL_MS);
    expect(getActiveSrc()).toBe("/images/projects/cocina-3.png");
  });

  it("vuelve a la primera imagen tras la última (loop)", () => {
    render(<ProjectsSection />);
    enterViewport();

    advance(PROJECTS_INTERVAL_MS * 3);

    expect(getActiveSrc()).toBe("/images/projects/cocina-1.png");
  });

  it("cambiar de tipo reinicia la rotación en la primera imagen", () => {
    render(<ProjectsSection />);
    enterViewport();

    advance(PROJECTS_INTERVAL_MS);
    expect(getActiveSrc()).toBe("/images/projects/cocina-2.png");

    fireEvent.click(getButton("PLACARDS"));
    expect(getActiveSrc()).toBe("/images/projects/placard-1.webp");

    advance(PROJECTS_INTERVAL_MS - 1);
    expect(getActiveSrc()).toBe("/images/projects/placard-1.webp");

    advance(1);
    expect(getActiveSrc()).toBe("/images/projects/placard-2.avif");
  });

  it("cancela el temporizador al desmontar", () => {
    const { unmount } = render(<ProjectsSection />);
    enterViewport();

    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it("sin movimiento reducido el crossfade dura más de 0 ms", () => {
    setReducedMotion(false);

    render(<ProjectsSection />);

    for (const layer of getLayers()) {
      expect(Number(layer.dataset.crossfadeMs)).toBeGreaterThan(0);
    }
  });

  it("con movimiento reducido el crossfade dura 0 ms", () => {
    setReducedMotion(true);

    render(<ProjectsSection />);

    for (const layer of getLayers()) {
      expect(layer.dataset.crossfadeMs).toBe("0");
    }
  });

  it("las imágenes cubren la sección y declaran sizes responsivo", () => {
    render(<ProjectsSection />);

    for (const layer of getLayers()) {
      const image = layer.querySelector("img");

      expect(image).toHaveClass("object-cover");
      expect(image?.getAttribute("sizes")).toContain("(min-width: 1024px) 65vw");
    }
  });

  it("el boceto del tipo activo se dibuja como SVG inline", () => {
    render(<ProjectsSection />);
    enterSketchViewport();

    expect(getSketch()).toHaveAttribute("data-sketch", COCINAS_ICON_SKETCH.title);
    expect(getSketch()).toHaveAttribute("data-phase", "visible");
    expect(
      screen.getByRole("img", { name: COCINAS_ICON_SKETCH.title }),
    ).toHaveAttribute("viewBox", ICON_SKETCH_VIEW_BOX);
  });

  it("al cambiar de tipo desdibuja el ícono actual antes de dibujar el nuevo", async () => {
    render(<ProjectsSection />);
    enterSketchViewport();

    fireEvent.click(getButton("PLACARDS"));

    expect(getSketch()).toHaveAttribute("data-phase", "erased");
    expect(getSketch()).toHaveAttribute("data-sketch", COCINAS_ICON_SKETCH.title);

    await advanceAsync(SKETCH_ERASE_MS);

    expect(getSketch()).toHaveAttribute("data-phase", "visible");
    expect(getSketch()).toHaveAttribute("data-sketch", PLACARD_ICON_SKETCH.title);
  });

  it("cada tipo de proyecto tiene su propio ícono", async () => {
    render(<ProjectsSection />);
    enterSketchViewport();

    fireEvent.click(getButton("VESTIDORES"));
    await advanceAsync(SKETCH_ERASE_MS);

    expect(getSketch()).toHaveAttribute(
      "data-sketch",
      VESTIDOR_ICON_SKETCH.title,
    );
  });

  it("los tres íconos comparten caja y grosor de trazo", () => {
    const sketches = [
      COCINAS_ICON_SKETCH,
      PLACARD_ICON_SKETCH,
      VESTIDOR_ICON_SKETCH,
    ];

    for (const sketch of sketches) {
      expect(sketch.viewBox).toBe(ICON_SKETCH_VIEW_BOX);
      expect(sketch.strokeWidth).toBe(ICON_SKETCH_STROKE_WIDTH);
      expect(sketch.paths.length).toBeGreaterThan(0);
    }

    expect(new Set(sketches.map((sketch) => sketch.title)).size).toBe(3);
  });

  it("la animación viene de motion/react y no de framer-motion", () => {
    for (const source of readComponentSources()) {
      expect(source).not.toContain("framer-motion");
    }

    expect(
      readComponentSources().some((source) => source.includes('from "motion/react"')),
    ).toBe(true);
  });
});
