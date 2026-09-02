import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { setReducedMotion } from "./setup";

const SECTIONS = [
  { id: "home", label: "INICIO" },
  { id: "proyectos", label: "PROYECTOS" },
  { id: "nosotros", label: "NOSOTROS" },
  { id: "contacto", label: "CONTACTO" },
];

afterEach(() => {
  cleanup();
});

function getPanel(): HTMLElement {
  return screen.getByTestId("mobile-menu");
}

describe("MobileMenu", () => {
  it("renders a link for every section with the right href", () => {
    render(<MobileMenu open onNavigate={vi.fn()} sections={SECTIONS} />);

    expect(screen.getByRole("link", { name: "INICIO" })).toHaveAttribute(
      "href",
      "#home",
    );
    expect(screen.getByRole("link", { name: "PROYECTOS" })).toHaveAttribute(
      "href",
      "#proyectos",
    );
    expect(screen.getByRole("link", { name: "NOSOTROS" })).toHaveAttribute(
      "href",
      "#nosotros",
    );
    expect(screen.getByRole("link", { name: "CONTACTO" })).toHaveAttribute(
      "href",
      "#contacto",
    );
  });

  it("is hidden from assistive tech and inert while closed", () => {
    render(<MobileMenu open={false} onNavigate={vi.fn()} sections={SECTIONS} />);

    expect(getPanel()).toHaveAttribute("data-open", "false");
    expect(getPanel()).toHaveAttribute("aria-hidden", "true");
    expect(getPanel()).toHaveAttribute("inert");
  });

  it("is exposed to assistive tech and not inert while open", () => {
    render(<MobileMenu open onNavigate={vi.fn()} sections={SECTIONS} />);

    expect(getPanel()).toHaveAttribute("data-open", "true");
    expect(getPanel()).toHaveAttribute("aria-hidden", "false");
    expect(getPanel()).not.toHaveAttribute("inert");
  });

  it("calls onNavigate when a link is clicked", () => {
    const onNavigate = vi.fn();
    render(<MobileMenu open onNavigate={onNavigate} sections={SECTIONS} />);

    fireEvent.click(screen.getByRole("link", { name: "PROYECTOS" }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("exposes non-zero animation durations by default", () => {
    render(<MobileMenu open onNavigate={vi.fn()} sections={SECTIONS} />);

    expect(Number(getPanel().dataset.panelMs)).toBeGreaterThan(0);
    expect(Number(getPanel().dataset.linkMs)).toBeGreaterThan(0);
    expect(Number(getPanel().dataset.staggerMs)).toBeGreaterThan(0);
  });

  it("collapses durations to 0 with reduced motion", () => {
    setReducedMotion(true);

    render(<MobileMenu open onNavigate={vi.fn()} sections={SECTIONS} />);

    expect(getPanel()).toHaveAttribute("data-panel-ms", "0");
    expect(getPanel()).toHaveAttribute("data-link-ms", "0");
    expect(getPanel()).toHaveAttribute("data-stagger-ms", "0");

    setReducedMotion(false);
  });
});
