"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { CrossfadeGallery } from "@/components/crossfade-gallery";
import { SketchSwap } from "@/components/sketch-swap";
import { COCINAS_ICON_SKETCH } from "@/components/sketchs/cocinas-icon-sketch";
import { PLACARD_ICON_SKETCH } from "@/components/sketchs/placard-icon-sketch";
import { VESTIDOR_ICON_SKETCH } from "@/components/sketchs/vestidor-icon-sketch";
import { useRotatingIndex } from "@/hooks/useRotatingIndex";

export const PROJECTS_INTERVAL_MS = 3000;
export const PROJECTS_CROSSFADE_MS = 1200;

export const PROJECT_TYPES = [
  {
    id: "cocinas",
    label: "COCINAS",
    sketch: COCINAS_ICON_SKETCH,
    images: [
      "/images/projects/cocina-1.jpg",
      "/images/projects/cocina-2.jpg",
      "/images/projects/cocina-3.jpg",
    ],
  },
  {
    id: "placards",
    label: "PLACARDS",
    sketch: PLACARD_ICON_SKETCH,
    images: [
      "/images/projects/placard-1.webp",
      "/images/projects/placard-2.avif",
      "/images/projects/placard-3.jpg",
    ],
  },
  {
    id: "vestidores",
    label: "VESTIDORES",
    sketch: VESTIDOR_ICON_SKETCH,
    images: [
      "/images/projects/vestidor-1.jpg",
      "/images/projects/vestidor-2.jpg",
      "/images/projects/vestidor-3.webp",
    ],
  },
] as const;

type ProjectTypeId = (typeof PROJECT_TYPES)[number]["id"];

const PROJECT_IMAGES = PROJECT_TYPES.flatMap((type) => type.images);

// Offset de cada tipo dentro de la lista plana de capas montadas.
const TYPE_OFFSETS = PROJECT_TYPES.map((_, index) =>
  PROJECT_TYPES.slice(0, index).reduce(
    (total, type) => total + type.images.length,
    0,
  ),
);

export function ProjectsSection() {
  const [activeTypeId, setActiveTypeId] = useState<ProjectTypeId>(
    PROJECT_TYPES[0].id,
  );
  const galleryRef = useRef<HTMLElement>(null);
  const inView = useInView(galleryRef, { amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  const activeTypeIndex = PROJECT_TYPES.findIndex(
    (type) => type.id === activeTypeId,
  );
  const imageIndex = useRotatingIndex({
    length: PROJECT_TYPES[activeTypeIndex].images.length,
    intervalMs: PROJECTS_INTERVAL_MS,
    active: inView,
    resetKey: activeTypeId,
  });

  const crossfadeMs = prefersReducedMotion ? 0 : PROJECTS_CROSSFADE_MS;

  return (
    <main className="section-main" id="proyectos">
      <section className="section-left">
        <div className="section-left-content">
          {/* SECTION TITLE */}
          <div>
            <h2 className="section-title">Nuestros</h2>
            <h2 className="section-title text-cancel">Proyectos</h2>
          </div>
          {/* PROJECTS SELECTOR */}
          <div className="flex flex-col items-start gap-4">
            {/* DIVIDER */}
            <div className="text-xs flex flex-col items-end w-full mb-2">
              <SketchSwap
                sketch={PROJECT_TYPES[activeTypeIndex].sketch}
                className="mx-2 h-auto w-[280px] max-w-full text-dark"
              />
              <div className="border-b border-cancel w-full" />
            </div>
            <div
              role="group"
              aria-label="Tipo de proyecto"
              className="flex flex-col items-start gap-4"
            >
              {PROJECT_TYPES.map((type) => {
                const selected = type.id === activeTypeId;

                return (
                  <button
                    key={type.id}
                    type="button"
                    data-testid="project-type-button"
                    data-type={type.id}
                    aria-pressed={selected}
                    onClick={() => setActiveTypeId(type.id)}
                    className={`cursor-pointer text-2xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
                      selected
                        ? "font-bold text-accent"
                        : "hover:text-accent"
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <section
        ref={galleryRef}
        className="section-right"
        data-testid="projects-gallery"
      >
        <CrossfadeGallery
          images={PROJECT_IMAGES}
          activeIndex={TYPE_OFFSETS[activeTypeIndex] + imageIndex}
          crossfadeMs={crossfadeMs}
          layerTestId="project-layer"
          sizes="(min-width: 1024px) 65vw, 100vw"
        />
      </section>
    </main>
  );
}
