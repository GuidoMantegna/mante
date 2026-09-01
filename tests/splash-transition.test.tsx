import { readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "@/components/ui/navbar";
import {
  SPLASH_CURTAIN_CLOSE_MS,
  SPLASH_CURTAIN_HOLD_MS,
  SPLASH_CURTAIN_OPEN_MS,
  SplashGateProvider,
} from "@/components/splash-gate";
import { SplashOverlay } from "@/components/splash-overlay";
import { SketchSequence } from "@/components/sketch-sequence";
import type { Sketch } from "@/components/svg-drawing";
import { setReducedMotion, triggerIntersection } from "./setup";

const COMPONENT_PATHS = [
  "splash-gate.tsx",
  "splash-backdrop.tsx",
  "splash-curtain.tsx",
  "splash-overlay.tsx",
  "splash-section.tsx",
  "ui/navbar.tsx",
].map((file) => path.resolve(__dirname, "..", "components", file));

function readComponentSources(): string[] {
  return COMPONENT_PATHS.map((file) => readFileSync(file, "utf8"));
}

const SKETCH: Sketch = {
  paths: ["M0 0L1 1", "M1 1L2 2"],
  viewBox: "0 0 10 10",
  strokeWidth: 1,
  title: "Boceto",
};

const CLOSE_TOTAL_MS = SPLASH_CURTAIN_CLOSE_MS + SPLASH_CURTAIN_HOLD_MS;

function renderApp() {
  return render(
    <SplashGateProvider>
      <Navbar />
      <SplashOverlay />
      <SketchSequence sketches={[SKETCH]} />
    </SplashGateProvider>,
  );
}

function getPanel(side: "left" | "right"): HTMLElement {
  return screen
    .getAllByTestId("splash-curtain-panel")
    .find((panel) => panel.dataset.side === side) as HTMLElement;
}

function advance(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

/** Dispara la transición y deja la cortina cerrándose sobre el splash. */
function close(): void {
  act(() => {
    fireEvent.wheel(window);
  });
}

/** Cierra la cortina y la abre: la home queda a la vista. */
function open(): void {
  close();
  advance(CLOSE_TOTAL_MS);
}

describe("Splash → Home transition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  // R1
  it("el splash se renderiza como overlay fijo cubriendo el viewport", () => {
    renderApp();

    const section = screen.getByTestId("splash-section");

    expect(section).toHaveClass("fixed", "inset-0", "h-svh", "w-full");
  });

  // R2
  it("bloquea el scroll del documento mientras no se revela", () => {
    renderApp();

    expect(document.documentElement).toHaveClass("splash-locked");
  });

  // R3
  it("un wheel en window cierra la cortina", () => {
    renderApp();

    close();

    expect(screen.getByTestId("splash-curtain")).toHaveAttribute(
      "data-phase",
      "closing",
    );
  });

  // R3
  it("un pointerdown en window cierra la cortina", () => {
    renderApp();

    act(() => {
      fireEvent.pointerDown(window);
    });

    expect(screen.getByTestId("splash-curtain")).toHaveAttribute(
      "data-phase",
      "closing",
    );
  });

  // R3
  it("un touchmove en window cierra la cortina", () => {
    renderApp();

    act(() => {
      fireEvent.touchMove(window);
    });

    expect(screen.getByTestId("splash-curtain")).toHaveAttribute(
      "data-phase",
      "closing",
    );
  });

  // R3
  it("un scroll en window cierra la cortina", () => {
    renderApp();

    act(() => {
      fireEvent.scroll(window);
    });

    expect(screen.getByTestId("splash-curtain")).toHaveAttribute(
      "data-phase",
      "closing",
    );
  });

  // R3
  it("una tecla de avance (Space) cierra la cortina", () => {
    renderApp();

    act(() => {
      fireEvent.keyDown(window, { code: "Space" });
    });

    expect(screen.getByTestId("splash-curtain")).toHaveAttribute(
      "data-phase",
      "closing",
    );
  });

  // R4
  it("una tecla irrelevante (Tab) no dispara la transición", () => {
    renderApp();

    act(() => {
      fireEvent.keyDown(window, { code: "Tab" });
    });

    expect(screen.getByTestId("splash-curtain")).toHaveAttribute(
      "data-phase",
      "idle",
    );
  });

  // R5
  it("mantiene el scroll bloqueado mientras la cortina se cierra y lo libera al abrirse", () => {
    renderApp();

    close();
    expect(document.documentElement).toHaveClass("splash-locked");

    advance(CLOSE_TOTAL_MS);

    expect(document.documentElement).not.toHaveClass("splash-locked");
  });

  // R6
  it("un disparador posterior no reinicia la secuencia", () => {
    renderApp();

    open();

    act(() => {
      fireEvent.wheel(window);
      fireEvent.pointerDown(window);
    });

    expect(screen.getByTestId("splash-curtain")).toHaveAttribute(
      "data-phase",
      "opening",
    );
  });

  // R7
  it("el splash renderiza un único fondo sin dividir", () => {
    renderApp();

    expect(screen.getAllByTestId("splash-layer")).toHaveLength(3);
    expect(screen.queryAllByTestId("splash-door")).toHaveLength(0);
  });

  // R8
  it("la cortina son dos paneles opacos por encima del splash y ocultos a lectores", () => {
    renderApp();

    const curtain = screen.getByTestId("splash-curtain");

    expect(curtain).toHaveAttribute("aria-hidden", "true");
    expect(curtain).toHaveClass("fixed", "inset-0", "z-50");
    expect(screen.getByTestId("splash-section")).toHaveClass("z-40");
    expect(screen.getAllByTestId("splash-curtain-panel")).toHaveLength(2);
    expect(getPanel("left")).toHaveClass("bg-curtain", "left-0");
    expect(getPanel("right")).toHaveClass("bg-curtain", "right-0");
  });

  // R9
  it("el splash permanece intacto bajo la cortina y solo se desmonta al quedar tapado", () => {
    renderApp();

    close();

    expect(screen.getByTestId("splash-section")).toHaveAttribute(
      "data-state",
      "covering",
    );
    expect(screen.getAllByTestId("splash-layer")).toHaveLength(3);
    expect(screen.queryByTestId("splash-logo-layer")).not.toBeNull();

    advance(CLOSE_TOTAL_MS);

    expect(screen.queryByTestId("splash-section")).toBeNull();
  });

  // R10
  it("con movimiento reducido la duración de la cortina es 0", () => {
    setReducedMotion(true);
    renderApp();

    expect(getPanel("left")).toHaveAttribute("data-duration-ms", "0");
    expect(getPanel("right")).toHaveAttribute("data-duration-ms", "0");
  });

  // R10
  it("con movimiento reducido el navbar aparece sin retardo ni duración", () => {
    setReducedMotion(true);
    renderApp();

    expect(screen.getByTestId("navbar")).toHaveAttribute(
      "data-delay-seconds",
      "0",
    );
    expect(screen.getByTestId("navbar")).toHaveAttribute(
      "data-duration-seconds",
      "0",
    );
  });

  // R11
  it("el hint queda visible con el retardo configurado y se oculta al disparar", () => {
    renderApp();

    const hint = screen.getByTestId("splash-hint");

    expect(hint).toHaveAttribute("data-visible", "true");
    expect(hint).toHaveAttribute("data-delay-ms", "2000");

    close();

    expect(hint).toHaveAttribute("data-visible", "false");
  });

  // R12
  it("SketchSequence no dibuja mientras la cortina no se abrió", () => {
    renderApp();

    const container = screen.getByTestId("sketch-sequence");
    act(() => {
      triggerIntersection(container, true);
    });
    close();

    expect(container).toHaveAttribute("data-phase", "hidden");
  });

  // R13
  it("SketchSequence dibuja cuando la cortina se abre estando en el viewport", () => {
    renderApp();

    const container = screen.getByTestId("sketch-sequence");
    act(() => {
      triggerIntersection(container, true);
    });
    open();

    expect(container).toHaveAttribute("data-phase", "visible");
  });

  // R14
  it("el navbar sigue oculto mientras la cortina se cierra", () => {
    renderApp();

    expect(screen.getByTestId("navbar")).toHaveAttribute(
      "data-revealed",
      "false",
    );

    close();

    expect(screen.getByTestId("navbar")).toHaveAttribute(
      "data-revealed",
      "false",
    );
  });

  // R15
  it("el navbar pasa a data-revealed true cuando la cortina se abre", () => {
    renderApp();

    open();

    expect(screen.getByTestId("navbar")).toHaveAttribute(
      "data-revealed",
      "true",
    );
  });

  // R17
  it("recorre las fases idle → closing → opening → done y desmonta la cortina", () => {
    renderApp();

    expect(screen.getByTestId("splash-curtain")).toHaveAttribute(
      "data-phase",
      "idle",
    );

    close();
    expect(screen.getByTestId("splash-curtain")).toHaveAttribute(
      "data-phase",
      "closing",
    );

    advance(CLOSE_TOTAL_MS - 1);
    expect(screen.getByTestId("splash-curtain")).toHaveAttribute(
      "data-phase",
      "closing",
    );

    advance(1);
    expect(screen.getByTestId("splash-curtain")).toHaveAttribute(
      "data-phase",
      "opening",
    );

    advance(SPLASH_CURTAIN_OPEN_MS - 1);
    expect(screen.queryByTestId("splash-curtain")).not.toBeNull();

    advance(1);
    expect(screen.queryByTestId("splash-curtain")).toBeNull();
    expect(screen.queryByTestId("splash-section")).toBeNull();
  });

  // R16
  it("los módulos del gate importan de motion/react y no de framer-motion", () => {
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
