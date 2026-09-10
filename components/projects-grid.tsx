"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import {
  LIGHTBOX_RADIUS,
  lightboxLayoutId,
  type ProjectImage,
} from "@/components/image-lightbox";

export type { ProjectImage };

/** Mosaico 2×3 sobre 5 columnas: 2|3 · 3|2 · 2|3. Cada fila suma 5. */
export const TILE_SPANS = [2, 3, 3, 2, 2, 3] as const;

export type TileSpan = (typeof TILE_SPANS)[number];

// Tailwind escanea el texto fuente: `col-span-${n}` no se detectaría.
const TILE_SPAN_CLASS: Record<TileSpan, string> = {
  2: "col-span-2",
  3: "col-span-3",
};

export const TILE_SIZES: Record<TileSpan, string> = {
  2: "(min-width: 1280px) 300px, (min-width: 1024px) 25vw, 40vw",
  3: "(min-width: 1280px) 450px, (min-width: 1024px) 38vw, 58vw",
};

/** El `sizes` con el que se descargó el tile `index`. */
export function tileSizes(index: number): string {
  return TILE_SIZES[TILE_SPANS[index % TILE_SPANS.length]];
}

export interface ProjectsGridProps {
  images: readonly ProjectImage[];
  onSelect: (index: number) => void;
  priorityIndex?: number | null;
  /**
   * Imagen que en este momento vuela dentro del lightbox. Su tile deja de
   * renderizar el nodo compartido para que el `layoutId` tenga un único
   * miembro: así se agranda y se achica siempre la misma imagen, sin el
   * crossfade que Motion hace cuando el original sigue en pantalla.
   */
  hiddenSrc?: string | null;
  className?: string;
}

export function ProjectsGrid({
  images,
  onSelect,
  priorityIndex = null,
  hiddenSrc = null,
  className,
}: ProjectsGridProps) {
  // Cache de imágenes ya cargadas: no se vacía al cambiar de tipo, así volver a
  // un tipo visitado no vuelve a mostrar los esqueletos.
  const [loadedSrcs, setLoadedSrcs] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const markLoaded = useCallback((src: string) => {
    setLoadedSrcs((current) =>
      current.has(src) ? current : new Set(current).add(src),
    );
  }, []);

  const loadedCount = images.filter((image) => loadedSrcs.has(image.src)).length;

  return (
    <div
      data-testid="projects-grid"
      data-loading={loadedCount < images.length}
      data-loaded-count={loadedCount}
      className={`grid min-h-0 grid-cols-5 grid-rows-3 gap-2 ${className ?? ""}`}
    >
      {images.map((image, index) => {
        const span = TILE_SPANS[index % TILE_SPANS.length];
        const loaded = loadedSrcs.has(image.src);
        const priority = index === priorityIndex;
        const flying = image.src === hiddenSrc;

        return (
          <button
            // Keyear por src y no por índice: al cambiar de tipo se montan
            // <img> nuevos en vez de mutar el src de los existentes, así no hay
            // ningún frame con la foto de un tipo dentro del tile de otro.
            key={image.src}
            type="button"
            // El nombre accesible vive en el botón y no en la imagen: el nodo
            // compartido se desmonta mientras la foto está en el lightbox.
            aria-label={image.alt}
            data-testid="project-tile"
            data-index={index}
            data-src={image.src}
            data-span={span}
            data-loaded={loaded}
            data-flying={flying}
            onClick={() => onSelect(index)}
            // Sin `overflow-hidden`: recortaría el vuelo de vuelta del
            // lightbox, que Motion renderiza sobre este mismo tile.
            className={`relative min-h-0 cursor-zoom-in rounded-lg bg-cancel/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${TILE_SPAN_CLASS[span]}`}
          >
            {!loaded && !flying && (
              <span
                data-testid="project-tile-skeleton"
                aria-hidden
                className="absolute inset-0 animate-pulse rounded-lg bg-cancel/30"
              />
            )}
            {!flying && (
              <motion.span
                layoutId={lightboxLayoutId(image.src)}
                style={{ borderRadius: LIGHTBOX_RADIUS }}
                className="absolute inset-0 block overflow-hidden"
              >
                <Image
                  src={image.src}
                  alt=""
                  aria-hidden
                  fill
                  sizes={TILE_SIZES[span]}
                  priority={priority}
                  loading={priority ? undefined : "lazy"}
                  onLoad={() => markLoaded(image.src)}
                  className={`object-cover transition-opacity duration-300 ${
                    loaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              </motion.span>
            )}
          </button>
        );
      })}
    </div>
  );
}
