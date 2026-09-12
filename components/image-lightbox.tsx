"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export const LIGHTBOX_MS = 420;
export const LIGHTBOX_EASE = [0.22, 1, 0.36, 1] as const;
export const LIGHTBOX_OPEN_CLASS = "lightbox-open";
/** Lo comparten tile y marco: Motion corrige su distorsión al escalar. */
export const LIGHTBOX_RADIUS = 8;
export const LIGHTBOX_SIZES = "(min-width: 1280px) 1100px, 92vw";

/** Une el tile del grid con el marco del modal en una sola transición. */
export function lightboxLayoutId(src: string): string {
  return `project-image-${src}`;
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
  onClose: () => void;
}

interface LightboxPhotoProps {
  image: ProjectImage;
  thumbnailSizes?: string;
}

function LightboxPhoto({ image, thumbnailSizes }: LightboxPhotoProps) {
  const [fullLoaded, setFullLoaded] = useState(false);
  // Sin miniatura en caché detrás no hay nada que mostrar mientras carga la
  // grande: en ese caso se pinta desde el principio aunque llegue progresiva.
  const fadeIn = thumbnailSizes !== undefined;

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
          sizes={thumbnailSizes}
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

export function ImageLightbox({
  image,
  thumbnailSizes,
  onClose,
}: ImageLightboxProps) {
  const prefersReducedMotion = useReducedMotion();
  const durationMs = prefersReducedMotion ? 0 : LIGHTBOX_MS;
  const rootRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const open = image !== null;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      // El diálogo no tiene controles: alcanza con devolverle el foco para que
      // el tabulador no se escape al contenido de atrás.
      if (event.key === "Tab") {
        event.preventDefault();
        rootRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

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
      // Cierra desde cualquier punto de la pantalla, la foto incluida.
      onClick={onClose}
      data-testid="image-lightbox"
      data-open={open}
      data-src={image?.src ?? ""}
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
          con el tile del grid, de ida al abrir y de vuelta al cerrar. */}
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
          <LightboxPhoto
            key={image.src}
            image={image}
            thumbnailSizes={thumbnailSizes}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
