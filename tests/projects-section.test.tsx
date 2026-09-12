import { readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PROJECTS_IMAGE_BASE,
  PROJECT_TYPES,
  ProjectsSection,
} from "@/components/sections/projects-section";
import { LIGHTBOX_OPEN_CLASS } from "@/components/image-lightbox";
import { COCINAS_ICON_SKETCH } from "@/components/sketchs/cocinas-icon-sketch";
import {
  ICON_SKETCH_STROKE_WIDTH,
  ICON_SKETCH_VIEW_BOX,
} from "@/components/sketchs/icon-sketch";
import { PLACARD_ICON_SKETCH } from "@/components/sketchs/placard-icon-sketch";
import { VESTIDOR_ICON_SKETCH } from "@/components/sketchs/vestidor-icon-sketch";
import { DEFAULT_DRAW_DURATION_MS } from "@/hooks/useDrawSequence";
import { triggerIntersection } from "./setup";

const SKETCH_ERASE_MS = DEFAULT_DRAW_DURATION_MS / 2;

const COMPONENT_PATHS = [
  "sections/projects-section.tsx",
  "projects-grid.tsx",
  "image-lightbox.tsx",
].map((file) => path.resolve(__dirname, "..", "components", file));

function readComponentSources(): string[] {
  return COMPONENT_PATHS.map((file) => readFileSync(file, "utf8"));
}

function expectedSrcs(typeId: string): string[] {
  const type = PROJECT_TYPES.find((candidate) => candidate.id === typeId);
  return (type?.images ?? []).map((file) => `${PROJECTS_IMAGE_BASE}/${file}`);
}

function getTiles(): HTMLElement[] {
  return screen.getAllByTestId("project-tile");
}

function getTileSrcs(): string[] {
  return getTiles().map((tile) => tile.dataset.src ?? "");
}

function getButton(label: string): HTMLElement {
  return screen.getByRole("button", { name: label });
}

function getSketch(): HTMLElement {
  return screen.getByTestId("sketch-swap");
}

function enterSketchViewport(): void {
  act(() => {
    triggerIntersection(getSketch(), true);
  });
}

describe("ProjectsSection", () => {
  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove(LIGHTBOX_OPEN_CLASS);
  });

  it("renderiza los tres botones de tipo de proyecto", () => {
    render(<ProjectsSection />);

    for (const label of ["COCINAS", "PLACARDS", "VESTIDORES"]) {
      expect(getButton(label)).toHaveAttribute("type", "button");
    }
  });

  it("arranca con COCINAS seleccionado", () => {
    render(<ProjectsSection />);

    expect(getButton("COCINAS")).toHaveAttribute("aria-pressed", "true");
    expect(getButton("PLACARDS")).toHaveAttribute("aria-pressed", "false");
  });

  it("el botón seleccionado usa el tratamiento visual de selección", () => {
    render(<ProjectsSection />);

    expect(getButton("COCINAS")).toHaveClass(
      "font-bold",
      "text-accent",
      "border-cancel",
    );
    expect(getButton("PLACARDS")).not.toHaveClass("text-cancel");
  });

  it("muestra las seis imágenes del tipo activo en un mosaico", () => {
    render(<ProjectsSection />);

    expect(getTiles()).toHaveLength(6);
    expect(getTileSrcs()).toEqual(expectedSrcs("cocinas"));
  });

  it("usa las imágenes nuevas de /images/projects/new", () => {
    render(<ProjectsSection />);

    for (const src of getTileSrcs()) {
      expect(src).toContain("/images/projects/new/");
    }
  });

  it("al pulsar PLACARDS muestra las seis imágenes de placards", () => {
    render(<ProjectsSection />);

    fireEvent.click(getButton("PLACARDS"));

    expect(getButton("PLACARDS")).toHaveAttribute("aria-pressed", "true");
    expect(getTileSrcs()).toEqual(expectedSrcs("placards"));
  });

  it("al pulsar VESTIDORES muestra las seis imágenes de vestidores", () => {
    render(<ProjectsSection />);

    fireEvent.click(getButton("VESTIDORES"));

    expect(getTileSrcs()).toEqual(expectedSrcs("vestidores"));
  });

  it("cada imagen describe su tipo de proyecto en el alt", () => {
    render(<ProjectsSection />);

    expect(
      screen.getByRole("button", { name: "Cocina a medida 1" }),
    ).toBeInTheDocument();

    fireEvent.click(getButton("VESTIDORES"));

    expect(
      screen.getByRole("button", { name: "Vestidor a medida 6" }),
    ).toBeInTheDocument();
  });

  it("sólo la primera imagen del tipo inicial se precarga", () => {
    render(<ProjectsSection />);

    const images = getTiles().map((tile) => tile.querySelector("img"));
    expect(images[0]).not.toHaveAttribute("loading");
    for (const image of images.slice(1)) {
      expect(image).toHaveAttribute("loading", "lazy");
    }
  });

  it("al cambiar de tipo ninguna imagen se precarga", () => {
    render(<ProjectsSection />);

    fireEvent.click(getButton("PLACARDS"));

    for (const tile of getTiles()) {
      expect(tile.querySelector("img")).toHaveAttribute("loading", "lazy");
    }
  });

  it("ya no rota sola: no deja temporizadores corriendo", () => {
    vi.useFakeTimers();
    try {
      render(<ProjectsSection />);

      expect(vi.getTimerCount()).toBe(0);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(getTileSrcs()).toEqual(expectedSrcs("cocinas"));
    } finally {
      vi.useRealTimers();
    }
  });

  it("arranca con el lightbox cerrado", () => {
    render(<ProjectsSection />);

    expect(screen.getByTestId("image-lightbox").dataset.open).toBe("false");
    expect(screen.queryByTestId("lightbox-frame")).not.toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass(LIGHTBOX_OPEN_CLASS);
  });

  it("al pulsar un tile abre el lightbox con esa imagen", () => {
    render(<ProjectsSection />);

    fireEvent.click(getTiles()[2]);

    const dialog = screen.getByTestId("image-lightbox");
    expect(dialog.dataset.open).toBe("true");
    expect(dialog.dataset.src).toBe(expectedSrcs("cocinas")[2]);
    expect(document.documentElement).toHaveClass(LIGHTBOX_OPEN_CLASS);
  });

  it("el tile abierto suelta su imagen: vuela una sola", () => {
    render(<ProjectsSection />);

    fireEvent.click(getTiles()[2]);

    expect(getTiles()[2].dataset.flying).toBe("true");
    expect(getTiles()[2].querySelector("img")).toBeNull();
  });

  it("el lightbox reutiliza la derivada que ya descargó el tile", () => {
    render(<ProjectsSection />);
    const tileSizes = getTiles()[1].querySelector("img")?.getAttribute("sizes");

    fireEvent.click(getTiles()[1]);

    expect(screen.getByTestId("lightbox-thumbnail")).toHaveAttribute(
      "sizes",
      tileSizes,
    );
  });

  it("cerrar el lightbox lo oculta y devuelve el foco al tile", () => {
    render(<ProjectsSection />);
    const tile = getTiles()[1];

    // jsdom no mueve el foco al hacer click; el navegador sí enfoca el botón.
    tile.focus();
    fireEvent.click(tile);
    fireEvent.click(screen.getByTestId("lightbox-backdrop"));

    expect(screen.getByTestId("image-lightbox").dataset.open).toBe("false");
    expect(screen.queryByTestId("lightbox-frame")).not.toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass(LIGHTBOX_OPEN_CLASS);
    expect(document.activeElement).toBe(tile);
  });

  it("cambiar de tipo con el lightbox abierto lo cierra", () => {
    render(<ProjectsSection />);

    fireEvent.click(getTiles()[0]);
    expect(screen.getByTestId("lightbox-frame")).toBeInTheDocument();

    fireEvent.click(getButton("VESTIDORES"));

    expect(screen.getByTestId("image-lightbox").dataset.open).toBe("false");
    expect(screen.queryByTestId("lightbox-frame")).not.toBeInTheDocument();
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
    vi.useFakeTimers();
    try {
      render(<ProjectsSection />);
      enterSketchViewport();

      fireEvent.click(getButton("PLACARDS"));

      expect(getSketch()).toHaveAttribute("data-phase", "erased");
      expect(getSketch()).toHaveAttribute(
        "data-sketch",
        COCINAS_ICON_SKETCH.title,
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(SKETCH_ERASE_MS);
      });

      expect(getSketch()).toHaveAttribute("data-phase", "visible");
      expect(getSketch()).toHaveAttribute(
        "data-sketch",
        PLACARD_ICON_SKETCH.title,
      );
    } finally {
      vi.useRealTimers();
    }
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
      readComponentSources().some((source) =>
        source.includes('from "motion/react"'),
      ),
    ).toBe(true);
  });
});
