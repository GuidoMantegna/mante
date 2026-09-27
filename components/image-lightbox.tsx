"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export const LIGHTBOX_MS = 420;
export const LIGHTBOX_EASE = [0.22, 1, 0.36, 1] as const;
export const LIGHTBOX_OPEN_CLASS = "lightbox-open";
/** Lo comparten tile y marco: Motion corrige su distorsión al escalar. */
export const LIGHTBOX_RADIUS = 8;
export const LIGHTBOX_SIZES = "(min-width: 1280px) 1100px, 92vw";
/** Desplazamiento horizontal de la foto al pasar a la siguiente. */
export const LIGHTBOX_SLIDE_PX = 64;
/** Recorrido horizontal mínimo para que un arrastre cuente como swipe. */
export const LIGHTBOX_SWIPE_PX = 48;

/** Une el tile del grid con el marco del modal en una sola transición. */
export function lightboxLayoutId(src: string): string {
  return `project-image-${src}`;
}

/** El carrusel no sale del set activo: el índice da la vuelta en los bordes. */
export function wrapIndex(index: number, delta: number, count: number): number {
  return (((index + delta) % count) + count) % count;
}

export interface ProjectImage {
  src: string;
  alt: string;
}

export interface ImageLightboxProps {
  /** `null` con el modal cerrado. */
  image: ProjectImage | null;
  /**
   * El `sizes` del tile de origen. Pedir la misma derivada que el tile ya
   * descargó hace que el marco arranque el vuelo con la foto pintada.
   */
  thumbnailSizes?: string;
  /** Posición de `image` dentro del set activo. */
  index?: number;
  /** Tamaño del set activo. Con menos de 2 fotos no hay carrusel. */
  count?: number;
  onNavigate?: (index: number) => void;
  onClose: () => void;
}

interface LightboxPhotoProps {
  image: ProjectImage;
  thumbnailSizes?: string;
}

function LightboxPhoto({ image, thumbnailSizes }: LightboxPhotoProps) {
  const [fullLoaded, setFullLoaded] = useState(false);
  // Congelado en el montaje: al pasar de foto esta sigue en pantalla mientras
  // sale, y cambiarle el `sizes` le haría elegir otra derivada a mitad del
  // deslizamiento.
  const [ownThumbnailSizes] = useState(thumbnailSizes);
  // Sin miniatura en caché detrás no hay nada que mostrar mientras carga la
  // grande: en ese caso se pinta desde el principio aunque llegue progresiva.
  const fadeIn = ownThumbnailSizes !== undefined;

  return (
    <>
      {fadeIn && (
        // Misma URL optimizada que ya pintó el tile: sale de la caché del
        // navegador, así el vuelo nunca muestra un marco vacío.
        <Image
          src={image.src}
          alt=""
          aria-hidden
          fill
          sizes={ownThumbnailSizes}
          priority
          data-testid="lightbox-thumbnail"
          className="object-cover"
        />
      )}
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={LIGHTBOX_SIZES}
        priority
        onLoad={() => setFullLoaded(true)}
        data-testid="lightbox-photo"
        className={`object-cover transition-opacity duration-300 ${
          !fadeIn || fullLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

/**
 * Sólo se usan al cambiar de foto: al abrir, el `initial={false}` de
 * `AnimatePresence` deja entrar la primera ya centrada, sin pisar el vuelo
 * compartido con el tile.
 */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction * LIGHTBOX_SLIDE_PX,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction * -LIGHTBOX_SLIDE_PX,
    opacity: 0,
  }),
};

export function ImageLightbox({
  image,
  thumbnailSizes,
  index,
  count,
  onNavigate,
  onClose,
}: ImageLightboxProps) {
  const prefersReducedMotion = useReducedMotion();
  const durationMs = prefersReducedMotion ? 0 : LIGHTBOX_MS;
  const rootRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipedRef = useRef(false);
  const [direction, setDirection] = useState(0);
  const open = image !== null;

  const canNavigate =
    open &&
    onNavigate !== undefined &&
    index !== undefined &&
    count !== undefined &&
    count > 1;

  const go = useCallback(
    (delta: 1 | -1) => {
      if (!canNavigate) return;

      setDirection(delta);
      onNavigate(wrapIndex(index, delta, count));
    },
    [canNavigate, index, count, onNavigate],
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowRight") {
        go(1);
        return;
      }

      if (event.key === "ArrowLeft") {
        go(-1);
        return;
      }

      if (event.key !== "Tab") return;

      const root = rootRef.current;
      if (!root) return;

      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>("button:not([disabled])"),
      );

      // Sin controles alcanza con devolverle el foco al diálogo para que el
      // tabulador no se escape al contenido de atrás.
      if (focusables.length === 0) {
        event.preventDefault();
        root.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const outside = !active || !root.contains(active);

      if (event.shiftKey ? active === first || outside : active === last) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, go]);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    root.classList.add(LIGHTBOX_OPEN_CLASS);
    return () => root.classList.remove(LIGHTBOX_OPEN_CLASS);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement as HTMLElement | null;
    rootRef.current?.focus();

    return () => openerRef.current?.focus?.();
  }, [open]);

  const transition = { duration: durationMs / 1000, ease: LIGHTBOX_EASE };

  const navButtonClass =
    "absolute top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-dark/60 p-2 text-light transition-colors hover:bg-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    // `layoutRoot` es lo que le permite a Motion medir dentro de un contenedor
    // `fixed` teniendo en cuenta el scroll de la página.
    <motion.div
      ref={rootRef}
      layoutRoot
      role="dialog"
      aria-modal="true"
      aria-label={image?.alt ?? "Proyecto"}
      aria-hidden={!open}
      inert={!open || undefined}
      tabIndex={-1}
      onPointerDown={(event) => {
        swipedRef.current = false;
        swipeStartRef.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        const start = swipeStartRef.current;
        swipeStartRef.current = null;
        if (!start) return;

        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) < LIGHTBOX_SWIPE_PX || Math.abs(dx) <= Math.abs(dy)) {
          return;
        }

        // Al soltar, el navegador emite un `click`: sin esta marca el swipe
        // pasaría de foto y además cerraría el modal.
        swipedRef.current = true;
        go(dx < 0 ? 1 : -1);
      }}
      // Cierra desde cualquier punto de la pantalla, la foto incluida.
      onClick={() => {
        if (swipedRef.current) {
          swipedRef.current = false;
          return;
        }

        onClose();
      }}
      data-testid="image-lightbox"
      data-open={open}
      data-src={image?.src ?? ""}
      data-index={index ?? ""}
      data-count={count ?? ""}
      data-duration-ms={durationMs}
      className={`fixed inset-0 z-40 flex items-center justify-center outline-none ${
        open ? "cursor-zoom-out" : "pointer-events-none"
      }`}
    >
      <motion.div
        data-testid="lightbox-backdrop"
        className="absolute inset-0 bg-dark/90"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={transition}
        style={{ willChange: "opacity" }}
      />
      {/* Sólo el marco monta y desmonta: es lo que dispara el vuelo compartido
          con el tile del grid, de ida al abrir y de vuelta al cerrar. Al pasar
          de foto el marco se queda quieto y lo que se desliza es su
          contenido. */}
      {image && (
        <motion.div
          data-testid="lightbox-frame"
          layoutId={lightboxLayoutId(image.src)}
          transition={transition}
          style={{ borderRadius: LIGHTBOX_RADIUS, aspectRatio: "3 / 4" }}
          // Ancho fijo en 3:4: el alto sale del `aspectRatio` de arriba, así el
          // recorte nunca cambia entre dispositivos, solo la escala.
          className="relative w-[min(92vw,calc(86vh*0.75),800px)] overflow-hidden"
        >
          <AnimatePresence custom={direction} initial={false}>
            <motion.div
              key={image.src}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              style={{ willChange: "transform, opacity" }}
              data-testid="lightbox-slide"
              className="absolute inset-0"
            >
              <LightboxPhoto image={image} thumbnailSizes={thumbnailSizes} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
      {canNavigate && (
        <>
          <button
            type="button"
            aria-label="Imagen anterior"
            data-testid="lightbox-prev"
            onClick={(event) => {
              event.stopPropagation();
              go(-1);
            }}
            className={`${navButtonClass} left-2 sm:left-4`}
          >
            <FiChevronLeft aria-hidden className="size-6" />
          </button>
          <button
            type="button"
            aria-label="Imagen siguiente"
            data-testid="lightbox-next"
            onClick={(event) => {
              event.stopPropagation();
              go(1);
            }}
            className={`${navButtonClass} right-2 sm:right-4`}
          >
            <FiChevronRight aria-hidden className="size-6" />
          </button>
          <p
            aria-live="polite"
            data-testid="lightbox-counter"
            className="absolute bottom-4 z-10 text-sm tabular-nums text-light"
          >
            {index + 1} / {count}
          </p>
        </>
      )}
    </motion.div>
  );
}
