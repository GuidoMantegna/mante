import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MenuToggle } from "@/components/ui/menu-toggle";
import { setReducedMotion } from "./setup";

afterEach(() => {
  cleanup();
});

function getToggle(): HTMLElement {
  return screen.getByTestId("menu-toggle");
}

describe("MenuToggle", () => {
  it("renders closed by default with aria-expanded false", () => {
    render(<MenuToggle open={false} onToggle={vi.fn()} />);

    expect(getToggle()).toHaveAttribute("aria-expanded", "false");
    expect(getToggle()).toHaveAttribute("data-open", "false");
    expect(getToggle()).toHaveAttribute("aria-label", "Abrir menú");
  });

  it("reflects the open state via props", () => {
    render(<MenuToggle open onToggle={vi.fn()} />);

    expect(getToggle()).toHaveAttribute("aria-expanded", "true");
    expect(getToggle()).toHaveAttribute("data-open", "true");
    expect(getToggle()).toHaveAttribute("aria-label", "Cerrar menú");
  });

  it("calls onToggle when clicked", () => {
    const onToggle = vi.fn();
    render(<MenuToggle open={false} onToggle={onToggle} />);

    fireEvent.click(getToggle());

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("is wired to the mobile-menu panel via aria-controls", () => {
    render(<MenuToggle open={false} onToggle={vi.fn()} />);

    expect(getToggle()).toHaveAttribute("aria-controls", "mobile-menu");
  });

  it("exposes non-zero animation durations by default", () => {
    render(<MenuToggle open={false} onToggle={vi.fn()} />);

    expect(Number(getToggle().dataset.collapseMs)).toBeGreaterThan(0);
    expect(Number(getToggle().dataset.rotateMs)).toBeGreaterThan(0);
  });

  it("collapses durations to 0 with reduced motion", () => {
    setReducedMotion(true);

    render(<MenuToggle open={false} onToggle={vi.fn()} />);

    expect(getToggle()).toHaveAttribute("data-collapse-ms", "0");
    expect(getToggle()).toHaveAttribute("data-rotate-ms", "0");

    setReducedMotion(false);
  });
});
