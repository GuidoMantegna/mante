import { readFileSync } from "node:fs";
import path from "node:path";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ImageLightbox,
  LIGHTBOX_MS,
  LIGHTBOX_OPEN_CLASS,
  lightboxLayoutId,
  wrapIndex,
  type ProjectImage,
} from "@/components/image-lightbox";
import { setReducedMotion } from "./setup";

const SRC = "/images/projects/cocina-2.png";
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

const SET: ProjectImage[] = Array.from({ length: 6 }, (_, index) => ({
  src: `/images/projects/cocina-${index + 1}.png`,
  alt: `Cocina a medida ${index + 1}`,
}));

function Carousel({
  startIndex = 0,
  count = SET.length,
  onClose = () => {},
}: {
  startIndex?: number;
  count?: number;
  onClose?: () => void;
}) {
  const [index, setIndex] = useState(startIndex);

  return (
    <ImageLightbox
      image={SET[index]}
      thumbnailSizes={THUMBNAIL_SIZES}
      index={index}
      count={count}
      onNavigate={setIndex}
      onClose={onClose}
    />
  );
}

function renderCarousel(props: Parameters<typeof Carousel>[0] = {}) {
  return render(<Carousel {...props} />);
}

function currentSrc(): string {
  return getDialog().dataset.src ?? "";
}

function swipe(dx: number, dy = 0): void {
  const dialog = getDialog();
  fireEvent.pointerDown(dialog, { clientX: 300, clientY: 200 });
  fireEvent.pointerUp(dialog, { clientX: 300 + dx, clientY: 200 + dy });
  fireEvent.click(dialog);
}

describe("ImageLightbox — carrusel", () => {
  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove(LIGHTBOX_OPEN_CLASS);
  });

  it("wrapIndex se queda dentro del set: da la vuelta en los dos bordes", () => {
    expect(wrapIndex(0, 1, 6)).toBe(1);
    expect(wrapIndex(5, 1, 6)).toBe(0);
    expect(wrapIndex(0, -1, 6)).toBe(5);
    expect(wrapIndex(3, -1, 6)).toBe(2);
  });

  it("ofrece controles de anterior y siguiente con el set completo", () => {
    renderCarousel();

    expect(screen.getByRole("button", { name: "Imagen anterior" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Imagen siguiente" })).toBeInTheDocument();
    expect(screen.getByTestId("lightbox-counter")).toHaveTextContent("1 / 6");
  });

  it("sin controles cuando el tipo tiene una sola imagen", () => {
    renderCarousel({ count: 1 });

    expect(screen.queryByTestId("lightbox-prev")).not.toBeInTheDocument();
    expect(screen.queryByTestId("lightbox-next")).not.toBeInTheDocument();
    expect(screen.queryByTestId("lightbox-counter")).not.toBeInTheDocument();
  });

  it("el botón siguiente avanza a la foto siguiente del tipo", () => {
    renderCarousel();

    fireEvent.click(screen.getByTestId("lightbox-next"));

    expect(currentSrc()).toBe(SET[1].src);
    expect(screen.getByTestId("lightbox-counter")).toHaveTextContent("2 / 6");
  });

  it("el botón anterior desde la primera vuelve a la última", () => {
    renderCarousel();

    fireEvent.click(screen.getByTestId("lightbox-prev"));

    expect(currentSrc()).toBe(SET[5].src);
    expect(screen.getByTestId("lightbox-counter")).toHaveTextContent("6 / 6");
  });

  it("el botón siguiente desde la última vuelve a la primera", () => {
    renderCarousel({ startIndex: 5 });

    fireEvent.click(screen.getByTestId("lightbox-next"));

    expect(currentSrc()).toBe(SET[0].src);
  });

  it("nunca sale de las seis imágenes del tipo activo", () => {
    renderCarousel();
    const visited: string[] = [currentSrc()];

    for (let step = 0; step < 6; step += 1) {
      fireEvent.click(screen.getByTestId("lightbox-next"));
      visited.push(currentSrc());
    }

    // Siete pasos sobre seis fotos: la séptima es otra vez la primera.
    expect(visited).toEqual([...SET.map((image) => image.src), SET[0].src]);
  });

  it("los controles no cierran el modal", () => {
    const onClose = vi.fn();
    renderCarousel({ onClose });

    fireEvent.click(screen.getByTestId("lightbox-next"));
    fireEvent.click(screen.getByTestId("lightbox-prev"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("las flechas del teclado pasan de foto", () => {
    renderCarousel({ startIndex: 2 });

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(currentSrc()).toBe(SET[3].src);

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(currentSrc()).toBe(SET[1].src);
  });

  it("las flechas no cierran el modal", () => {
    const onClose = vi.fn();
    renderCarousel({ onClose });

    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("deslizar hacia la izquierda avanza y no cierra", () => {
    const onClose = vi.fn();
    renderCarousel({ onClose });

    swipe(-120);

    expect(currentSrc()).toBe(SET[1].src);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("deslizar hacia la derecha retrocede", () => {
    renderCarousel({ startIndex: 3 });

    swipe(120);

    expect(currentSrc()).toBe(SET[2].src);
  });

  it("un arrastre corto no pasa de foto y sigue cerrando", () => {
    const onClose = vi.fn();
    renderCarousel({ onClose });

    swipe(-10);

    expect(currentSrc()).toBe(SET[0].src);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("un arrastre vertical no pasa de foto", () => {
    renderCarousel();

    swipe(-60, -200);

    expect(currentSrc()).toBe(SET[0].src);
  });

  it("el tabulador circula entre los controles sin salir del diálogo", () => {
    renderCarousel();
    const prev = screen.getByTestId("lightbox-prev");
    const next = screen.getByTestId("lightbox-next");

    next.focus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(prev);

    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(next);
  });

  it("Escape sigue cerrando con el carrusel activo", () => {
    const onClose = vi.fn();
    renderCarousel({ onClose });

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("el contador se anuncia a los lectores de pantalla", () => {
    renderCarousel({ startIndex: 4 });

    const counter = screen.getByTestId("lightbox-counter");
    expect(counter).toHaveAttribute("aria-live", "polite");
    expect(counter).toHaveTextContent("5 / 6");
  });
});
