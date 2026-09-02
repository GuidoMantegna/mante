import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  REVEAL_DURATION_MS,
  REVEAL_SCALE_DURATION_MS,
  ScrollReveal,
} from "@/components/scroll-reveal";
import {
  SPLASH_CURTAIN_CLOSE_MS,
  SPLASH_CURTAIN_HOLD_MS,
  SplashGateProvider,
} from "@/components/splash-gate";
import { setReducedMotion, triggerIntersection } from "./setup";

const CLOSE_TOTAL_MS = SPLASH_CURTAIN_CLOSE_MS + SPLASH_CURTAIN_HOLD_MS;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function getReveal(): HTMLElement {
  return screen.getByTestId("scroll-reveal");
}

describe("ScrollReveal", () => {
  it("hides the content until it intersects the viewport", () => {
    render(
      <ScrollReveal>
        <p>Contenido</p>
      </ScrollReveal>,
    );

    expect(getReveal()).toHaveAttribute("data-revealed", "false");
  });

  it("reveals the content once it intersects the viewport", () => {
    render(
      <ScrollReveal>
        <p>Contenido</p>
      </ScrollReveal>,
    );

    act(() => {
      triggerIntersection(getReveal(), true);
    });

    expect(getReveal()).toHaveAttribute("data-revealed", "true");
  });

  it("stays revealed after leaving the viewport again (once semantics)", () => {
    render(
      <ScrollReveal>
        <p>Contenido</p>
      </ScrollReveal>,
    );

    act(() => {
      triggerIntersection(getReveal(), true);
    });
    act(() => {
      triggerIntersection(getReveal(), false);
    });

    expect(getReveal()).toHaveAttribute("data-revealed", "true");
  });

  it("does not reveal while the splash curtain has not opened yet", () => {
    render(
      <SplashGateProvider>
        <ScrollReveal>
          <p>Contenido</p>
        </ScrollReveal>
      </SplashGateProvider>,
    );

    act(() => {
      triggerIntersection(getReveal(), true);
    });

    expect(getReveal()).toHaveAttribute("data-revealed", "false");
  });

  it("reveals once the splash curtain finishes opening", () => {
    render(
      <SplashGateProvider>
        <ScrollReveal>
          <p>Contenido</p>
        </ScrollReveal>
      </SplashGateProvider>,
    );

    act(() => {
      triggerIntersection(getReveal(), true);
    });
    act(() => {
      fireEvent.wheel(window);
    });

    expect(getReveal()).toHaveAttribute("data-revealed", "false");

    act(() => {
      vi.advanceTimersByTime(CLOSE_TOTAL_MS);
    });

    expect(getReveal()).toHaveAttribute("data-revealed", "true");
  });

  it("defaults to the rise variant", () => {
    render(
      <ScrollReveal>
        <p>Contenido</p>
      </ScrollReveal>,
    );

    expect(getReveal()).toHaveAttribute("data-variant", "rise");
    expect(getReveal()).toHaveAttribute(
      "data-duration-ms",
      String(REVEAL_DURATION_MS),
    );
  });

  it("exposes the scale variant with its own default duration", () => {
    render(
      <ScrollReveal variant="scale">
        <p>Contenido</p>
      </ScrollReveal>,
    );

    expect(getReveal()).toHaveAttribute("data-variant", "scale");
    expect(getReveal()).toHaveAttribute(
      "data-duration-ms",
      String(REVEAL_SCALE_DURATION_MS),
    );
  });

  it("shows the content already revealed and without duration when reduced motion is on", () => {
    setReducedMotion(true);

    render(
      <ScrollReveal>
        <p>Contenido</p>
      </ScrollReveal>,
    );

    expect(getReveal()).toHaveAttribute("data-revealed", "true");
    expect(getReveal()).toHaveAttribute("data-duration-ms", "0");
    expect(getReveal()).toHaveAttribute("data-delay-ms", "0");

    setReducedMotion(false);
  });
});
