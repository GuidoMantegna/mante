import { readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SPLASH_IMAGES,
  SPLASH_INTERVAL_MS,
  SplashSection,
} from "@/components/splash-section";
import { SplashGateProvider } from "@/components/splash-gate";
import { setReducedMotion } from "./setup";

const COMPONENT_PATH = path.resolve(
  __dirname,
  "..",
  "components",
  "splash-section.tsx",
);

function readComponentSource(): string {
  return readFileSync(COMPONENT_PATH, "utf8");
}

function renderSplash() {
  return render(
    <SplashGateProvider>
      <SplashSection />
    </SplashGateProvider>,
  );
}

function getLayers(): HTMLElement[] {
  return screen.getAllByTestId("splash-layer");
}

function getActiveSrcs(): string[] {
  return getLayers()
    .filter((layer) => layer.dataset.active === "true")
    .map((layer) => layer.dataset.src ?? "");
}

function resolvedSrc(image: HTMLElement): string {
  return decodeURIComponent(image.getAttribute("src") ?? "");
}

function advance(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe("SplashSection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  // T12 — R1
  it("renderiza las tres capas de fondo en el orden canónico", () => {
    renderSplash();

    const layers = getLayers();

    expect(layers).toHaveLength(3);
    expect(layers.map((layer) => layer.dataset.src)).toEqual([
      "/images/splash-1.webp",
      "/images/splash-2.webp",
      "/images/splash-3.webp",
    ]);
  });

  // T13 — R6
  it("cada capa contiene la imagen de su data-src", () => {
    renderSplash();

    for (const layer of getLayers()) {
      const image = layer.querySelector("img");

      expect(image).not.toBeNull();
      expect(resolvedSrc(image as HTMLElement)).toContain(layer.dataset.src);
    }
  });

  // T14 — R2
  it("la primera capa activa es splash-1", () => {
    renderSplash();

    expect(getActiveSrcs()).toEqual(["/images/splash-1.webp"]);
  });

  // T15 — R5
  it("no cambia la capa activa antes de 3000 ms", () => {
    renderSplash();

    advance(SPLASH_INTERVAL_MS - 1);

    expect(getActiveSrcs()).toEqual(["/images/splash-1.webp"]);
  });

  // T16 — R3
  it("avanza a la siguiente capa cada 3000 ms", () => {
    renderSplash();

    advance(SPLASH_INTERVAL_MS);
    expect(getActiveSrcs()).toEqual(["/images/splash-2.webp"]);

    advance(SPLASH_INTERVAL_MS);
    expect(getActiveSrcs()).toEqual(["/images/splash-3.webp"]);
  });

  // T17 — R4
  it("vuelve a la primera capa tras la última (loop)", () => {
    renderSplash();

    advance(SPLASH_INTERVAL_MS * SPLASH_IMAGES.length);

    expect(getActiveSrcs()).toEqual(["/images/splash-1.webp"]);
  });

  // T18 — R7
  it("cancela el temporizador al desmontar", () => {
    const { unmount } = renderSplash();

    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  // T19 — R8
  it("la capa activa tiene opacidad 1 y las demás 0", () => {
    renderSplash();

    const [first, second, third] = getLayers();

    expect(first).toHaveStyle({ opacity: "1" });
    expect(second).toHaveStyle({ opacity: "0" });
    expect(third).toHaveStyle({ opacity: "0" });
  });

  // T20 — R9
  it("la animación viene de motion/react", () => {
    expect(readComponentSource()).toContain('from "motion/react"');
  });

  // T21 — R10
  it("no se importa framer-motion", () => {
    expect(readComponentSource()).not.toContain("framer-motion");
  });

  // T22 — R11
  it("sin movimiento reducido el crossfade dura más de 0 ms", () => {
    setReducedMotion(false);

    renderSplash();

    for (const layer of getLayers()) {
      expect(Number(layer.dataset.crossfadeMs)).toBeGreaterThan(0);
    }
  });

  // T23 — R12
  it("con movimiento reducido el crossfade dura 0 ms", () => {
    setReducedMotion(true);

    renderSplash();

    for (const layer of getLayers()) {
      expect(layer.dataset.crossfadeMs).toBe("0");
    }
  });

  // T24 — R13
  it("renderiza el logo iso-logo-white", () => {
    renderSplash();

    expect(resolvedSrc(screen.getByTestId("splash-logo"))).toContain(
      "/iso-logo-white.svg",
    );
  });

  // T25 — R14
  it("el logo expone el texto alternativo Manté", () => {
    renderSplash();

    expect(screen.getByAltText("Manté")).toBe(screen.getByTestId("splash-logo"));
  });

  // T26 — R15
  it("el logo se apila por encima del fondo", () => {
    renderSplash();

    expect(screen.getByTestId("splash-logo-layer")).toHaveClass("z-10");
  });

  // T27 — R16
  it("el logo es responsivo según los frames de Figma", () => {
    renderSplash();

    expect(screen.getByTestId("splash-logo-layer")).toHaveClass(
      "w-[88%]",
      "md:w-[67%]",
      "max-w-[1016px]",
    );
  });

  // T28 — R17
  it("el logo no se recorta", () => {
    renderSplash();

    expect(screen.getByTestId("splash-logo")).toHaveClass("object-contain");
  });

  // T29 — R18
  it("la sección ocupa el alto del viewport", () => {
    renderSplash();

    expect(screen.getByTestId("splash-section")).toHaveClass("h-svh");
  });

  // T30 — R19, R20
  it("la sección ocupa el ancho disponible sin provocar scroll horizontal", () => {
    renderSplash();

    const section = screen.getByTestId("splash-section");

    expect(section).toHaveClass("w-full");
    expect(section).not.toHaveClass("w-screen");
  });

  // T31 — R21
  it("la sección recorta el desbordamiento", () => {
    renderSplash();

    expect(screen.getByTestId("splash-section")).toHaveClass("overflow-hidden");
  });

  // T32 — R22
  it("el fondo cubre la sección", () => {
    renderSplash();

    for (const layer of getLayers()) {
      expect(layer.querySelector("img")).toHaveClass("object-cover");
    }
  });
});
