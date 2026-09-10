import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MENU_OPEN_CLASS, Navbar, shouldHideOnScroll } from "@/components/ui/navbar";
import {
  SPLASH_CURTAIN_CLOSE_MS,
  SPLASH_CURTAIN_HOLD_MS,
  SplashGateProvider,
} from "@/components/splash-gate";

const CLOSE_TOTAL_MS = SPLASH_CURTAIN_CLOSE_MS + SPLASH_CURTAIN_HOLD_MS;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove(MENU_OPEN_CLASS);
  vi.useRealTimers();
});

/** Deja la cortina abierta y la home a la vista, igual que splash-transition.test.tsx. */
function renderRevealedNavbar() {
  const utils = render(
    <SplashGateProvider>
      <Navbar />
    </SplashGateProvider>,
  );

  act(() => {
    fireEvent.wheel(window);
  });
  act(() => {
    vi.advanceTimersByTime(CLOSE_TOTAL_MS);
  });

  return utils;
}

// jsdom no calcula layout real, así que scrollTop queda siempre clampeado a 0
// y no hay forma de simular un scroll real de punta a punta contra
// `useScroll`/`useMotionValueEvent`. Por eso la decisión de ocultar se aisló
// en `shouldHideOnScroll`, una función pura, y se testea directamente.
describe("shouldHideOnScroll", () => {
  it("hides when scrolling down past the threshold", () => {
    expect(shouldHideOnScroll(200, 100, 120)).toBe(true);
  });

  it("does not hide when scrolling down but still under the threshold", () => {
    expect(shouldHideOnScroll(100, 50, 120)).toBe(false);
  });

  it("does not hide when scrolling up", () => {
    expect(shouldHideOnScroll(100, 200, 120)).toBe(false);
  });

  it("does not hide when the scroll position doesn't change", () => {
    expect(shouldHideOnScroll(200, 200, 120)).toBe(false);
  });
});

describe("Navbar scroll visibility", () => {
  it("stays visible right after the splash reveal even without scrolling", () => {
    renderRevealedNavbar();

    expect(screen.getByTestId("navbar")).toHaveAttribute(
      "data-scroll-hidden",
      "false",
    );
  });
});

describe("Navbar mobile menu", () => {
  it("hides the desktop links below the lg breakpoint and shows the toggle instead", () => {
    render(<Navbar />);

    const desktopList = within(screen.getByTestId("navbar")).getByRole(
      "list",
    );
    expect(desktopList).toHaveClass("hidden", "lg:flex");
    expect(screen.getByTestId("menu-toggle").parentElement).toHaveClass(
      "lg:hidden",
    );
  });

  it("opens the mobile menu when the toggle is clicked", () => {
    renderRevealedNavbar();

    fireEvent.click(screen.getByTestId("menu-toggle"));

    expect(screen.getByTestId("menu-toggle")).toHaveAttribute(
      "data-open",
      "true",
    );
    expect(screen.getByTestId("mobile-menu")).toHaveAttribute(
      "data-open",
      "true",
    );
  });

  it("closes the mobile menu when the toggle is clicked again", () => {
    renderRevealedNavbar();

    fireEvent.click(screen.getByTestId("menu-toggle"));
    fireEvent.click(screen.getByTestId("menu-toggle"));

    expect(screen.getByTestId("mobile-menu")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("closes the mobile menu when a link is clicked", () => {
    renderRevealedNavbar();

    fireEvent.click(screen.getByTestId("menu-toggle"));
    fireEvent.click(
      within(screen.getByTestId("mobile-menu")).getByRole("link", {
        name: "PROYECTOS",
      }),
    );

    expect(screen.getByTestId("mobile-menu")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("closes the mobile menu on Escape", () => {
    renderRevealedNavbar();

    fireEvent.click(screen.getByTestId("menu-toggle"));
    expect(screen.getByTestId("mobile-menu")).toHaveAttribute(
      "data-open",
      "true",
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.getByTestId("mobile-menu")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("locks page scroll while the menu is open and releases it on close", () => {
    renderRevealedNavbar();

    fireEvent.click(screen.getByTestId("menu-toggle"));
    expect(document.documentElement.classList.contains(MENU_OPEN_CLASS)).toBe(
      true,
    );

    fireEvent.click(screen.getByTestId("menu-toggle"));
    expect(document.documentElement.classList.contains(MENU_OPEN_CLASS)).toBe(
      false,
    );
  });

  // La barra se oculta detrás del panel por z-index, no cambiando su propia
  // apariencia: si esto se rompiera, el borde/logo volverían a desincronizarse
  // de la animación del panel (bug reportado).
  it("stacks the bar behind the menu panel and the toggle above it, and never changes its own chrome", () => {
    renderRevealedNavbar();

    const nav = screen.getByTestId("navbar");
    const panel = screen.getByTestId("mobile-menu");
    const toggleWrapper = screen.getByTestId("menu-toggle").parentElement;

    expect(nav).toHaveClass("z-10", "border-b", "backdrop-blur-xs");
    expect(panel).toHaveClass("z-20");
    expect(toggleWrapper).toHaveClass("z-30");

    fireEvent.click(screen.getByTestId("menu-toggle"));

    expect(nav).toHaveClass("z-10", "border-b", "backdrop-blur-xs");
  });
});
