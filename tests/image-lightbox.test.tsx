import { readFileSync } from "node:fs";
import path from "node:path";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ImageLightbox,
  LIGHTBOX_MS,
  LIGHTBOX_OPEN_CLASS,
  lightboxLayoutId,
} from "@/components/image-lightbox";
import { setReducedMotion } from "./setup";

const SRC = "/images/projects/new/cocina-2.jpg";
const ALT = "Cocina a medida 2";
const THUMBNAIL_SIZES = "(min-width: 1024px) 25vw, 40vw";

const COMPONENT_PATH = path.resolve(
  __dirname,
  "..",
  "components",
  "image-lightbox.tsx",
);

function renderLightbox(onClose = vi.fn()) {
  const result = render(
    <ImageLightbox
      image={{ src: SRC, alt: ALT }}
      thumbnailSizes={THUMBNAIL_SIZES}
      onClose={onClose}
    />,
  );
  return { ...result, onClose };
}

function renderClosed(onClose = vi.fn()) {
  const result = render(<ImageLightbox image={null} onClose={onClose} />);
  return { ...result, onClose };
}

function getDialog(): HTMLElement {
  return screen.getByTestId("image-lightbox");
}

/** `next/image` llama al `onLoad` del consumidor tras una cadena de promesas. */
async function loadPhoto(): Promise<void> {
  await act(async () => {
    fireEvent.load(screen.getByTestId("lightbox-photo"));
  });
}

describe("ImageLightbox", () => {
  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove(LIGHTBOX_OPEN_CLASS);
  });

  it("expone un diálogo modal cuyo nombre accesible es el alt de la imagen", () => {
    renderLightbox();

    const dialog = screen.getByRole("dialog", { name: ALT });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog.dataset.src).toBe(SRC);
  });

  it("usa el mismo encuadre que el tile para que el vuelo sea continuo", () => {
    renderLightbox();

    const image = screen.getByRole("img", { name: ALT });
    expect(image).toHaveClass("object-cover");
    expect(image).not.toHaveAttribute("loading", "lazy");
  });

  it("pinta debajo la derivada que ya descargó el tile", async () => {
    renderLightbox();

    const thumbnail = screen.getByTestId("lightbox-thumbnail");
    expect(thumbnail).toHaveAttribute("sizes", THUMBNAIL_SIZES);
    expect(thumbnail).toHaveAttribute("aria-hidden", "true");

    // La grande se revela recién cuando termina de cargar; hasta entonces se ve
    // la miniatura, nunca un marco vacío.
    expect(screen.getByTestId("lightbox-photo")).toHaveClass("opacity-0");

    await loadPhoto();

    expect(screen.getByTestId("lightbox-photo")).toHaveClass("opacity-100");
  });

  it("sin miniatura de origen muestra la foto grande desde el principio", () => {
    render(
      <ImageLightbox image={{ src: SRC, alt: ALT }} onClose={vi.fn()} />,
    );

    expect(screen.queryByTestId("lightbox-thumbnail")).not.toBeInTheDocument();
    expect(screen.getByTestId("lightbox-photo")).toHaveClass("opacity-100");
  });

  it("comparte el layoutId con el tile del grid", () => {
    renderLightbox();

    expect(lightboxLayoutId(SRC)).toBe(`project-image-${SRC}`);
    expect(screen.getByTestId("lightbox-frame")).toBeInTheDocument();
  });

  it("Escape cierra el modal", () => {
    const { onClose } = renderLightbox();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("el clic en el fondo cierra el modal", () => {
    const { onClose } = renderLightbox();

    fireEvent.click(screen.getByTestId("lightbox-backdrop"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("el clic sobre la propia imagen también cierra el modal", () => {
    const { onClose } = renderLightbox();

    fireEvent.click(screen.getByTestId("lightbox-frame"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("no ofrece un botón de cerrar: se cierra desde cualquier punto", () => {
    renderLightbox();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(getDialog()).toHaveClass("cursor-zoom-out");
  });

  it("otras teclas no cierran el modal", () => {
    const { onClose } = renderLightbox();

    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("cerrado no muestra la imagen ni recibe interacción", () => {
    renderClosed();

    const dialog = getDialog();
    expect(dialog.dataset.open).toBe("false");
    expect(dialog).toHaveAttribute("aria-hidden", "true");
    expect(dialog).toHaveAttribute("inert");
    expect(dialog).toHaveClass("pointer-events-none");
    expect(screen.queryByTestId("lightbox-frame")).not.toBeInTheDocument();
  });

  it("cerrado no bloquea el scroll del documento", () => {
    renderClosed();

    expect(document.documentElement).not.toHaveClass(LIGHTBOX_OPEN_CLASS);
  });

  it("bloquea el scroll mientras está abierto y lo libera al cerrarse", () => {
    const onClose = vi.fn();
    const { rerender } = renderLightbox(onClose);

    expect(document.documentElement).toHaveClass(LIGHTBOX_OPEN_CLASS);

    rerender(<ImageLightbox image={null} onClose={onClose} />);

    expect(document.documentElement).not.toHaveClass(LIGHTBOX_OPEN_CLASS);
  });

  it("mueve el foco al diálogo al abrirse", () => {
    renderLightbox();

    expect(document.activeElement).toBe(getDialog());
  });

  it("devuelve el foco al elemento que lo abrió", () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();

    const onClose = vi.fn();
    const { rerender } = renderLightbox(onClose);
    expect(document.activeElement).not.toBe(opener);

    rerender(<ImageLightbox image={null} onClose={onClose} />);

    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it("el tabulador mantiene el foco dentro del diálogo", () => {
    renderLightbox();
    const dialog = getDialog();
    (dialog as HTMLElement).blur();

    fireEvent.keyDown(window, { key: "Tab" });

    expect(document.activeElement).toBe(dialog);
  });

  it("deja de escuchar el teclado una vez cerrado", () => {
    const onClose = vi.fn();
    const { rerender } = renderLightbox(onClose);

    rerender(<ImageLightbox image={null} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("sin movimiento reducido la transición dura más de 0 ms", () => {
    setReducedMotion(false);

    renderLightbox();

    expect(Number(getDialog().dataset.durationMs)).toBe(LIGHTBOX_MS);
  });

  it("con movimiento reducido la transición dura 0 ms", () => {
    setReducedMotion(true);

    renderLightbox();

    expect(getDialog().dataset.durationMs).toBe("0");
  });

  it("la animación viene de motion/react y no de framer-motion", () => {
    const source = readFileSync(COMPONENT_PATH, "utf8");

    expect(source).toContain('from "motion/react"');
    expect(source).not.toContain("framer-motion");
  });
});
