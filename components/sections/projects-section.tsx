"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ImageLightbox } from "@/components/image-lightbox";
import { ProjectsGrid, tileSizes } from "@/components/projects-grid";
import { ScrollReveal, REVEAL_STAGGER_MS } from "@/components/scroll-reveal";
import { SketchSwap } from "@/components/sketch-swap";
import { COCINAS_ICON_SKETCH } from "@/components/sketchs/cocinas-icon-sketch";
import { PLACARD_ICON_SKETCH } from "@/components/sketchs/placard-icon-sketch";
import { VESTIDOR_ICON_SKETCH } from "@/components/sketchs/vestidor-icon-sketch";

export const PROJECTS_IMAGE_BASE = "/images/projects/new";

export const PROJECT_TYPES = [
  {
    id: "cocinas",
    label: "COCINAS",
    singular: "Cocina",
    sketch: COCINAS_ICON_SKETCH,
    images: [
      "cocina-1.png",
      "cocina-2.png",
      "cocina-3.png",
      "cocina-4.png",
      "cocina-5.png",
      "cocina-6.png",
    ],
  },
  {
    id: "placards",
    label: "PLACARDS",
    singular: "Placard",
    sketch: PLACARD_ICON_SKETCH,
    images: [
      "placard-1.png",
      "placard-2.png",
      "placard-3.png",
      "placard-4.png",
      "placard-5.png",
      "placard-6.png",
    ],
  },
  {
    id: "vestidores",
    label: "VESTIDORES",
    singular: "Vestidor",
    sketch: VESTIDOR_ICON_SKETCH,
    images: [
      "vestidor-1.jpg",
      "vestidor-2.png",
      "vestidor-3.png",
      "vestidor-4.png",
      "vestidor-5.jpg",
      "vestidor-6.png",
    ],
  },
] as const;

type ProjectTypeId = (typeof PROJECT_TYPES)[number]["id"];

export function ProjectsSection() {
  const [activeTypeId, setActiveTypeId] = useState<ProjectTypeId>(
    PROJECT_TYPES[0].id,
  );
  const [selected, setSelected] = useState<number | null>(null);

  const activeTypeIndex = PROJECT_TYPES.findIndex(
    (type) => type.id === activeTypeId,
  );
  const activeType = PROJECT_TYPES[activeTypeIndex];

  const activeImages = useMemo(
    () =>
      activeType.images.map((file, index) => ({
        src: `${PROJECTS_IMAGE_BASE}/${file}`,
        alt: `${activeType.singular} a medida ${index + 1}`,
      })),
    [activeType],
  );

  const selectedImage = selected === null ? null : activeImages[selected];

  return (
    <main className="section-main" id="proyectos">
      <section className="section-left">
        <div className="section-left-content">
          {/* SECTION TITLE */}
          <ScrollReveal>
            <div>
              <h2 className="section-title">Nuestros</h2>
              <h2 className="section-title text-cancel">Proyectos</h2>
            </div>
          </ScrollReveal>
          {/* MAIN TEXT */}
          <ScrollReveal delayMs={REVEAL_STAGGER_MS}>
            <div className="text-sm">
              {/* DIVIDER */}
              <div className="text-xs grid gap-2 w-full mb-2">
                <Image
                  alt="Logo Manté"
                  src="/logo-accent.svg"
                  width={25}
                  height={25}
                />
                <div className="border-b border-cancel" />
              </div>
              <p>Conocé alguno de nuestros projectos realizados.</p>
              <p>Para ver más, visitá nuestro instagram <a href="https://www.instagram.com/mante.ar" target="_blank" rel="noopener noreferrer" className="font-bold">@mante.ar</a></p>
            </div>
          </ScrollReveal>
          {/* PROJECTS SELECTOR */}
          <ScrollReveal delayMs={REVEAL_STAGGER_MS}>
            <div className="flex flex-col items-start">
              {/* DIVIDER */}
              <div className="text-xs flex flex-col items-end w-full mb-1">
                <SketchSwap
                  sketch={activeType.sketch}
                  durationMs={1500}
                  className="h-auto w-[180px] lg:w-[200px] max-w-full text-dark"
                />
              </div>
              <div
                role="group"
                aria-label="Tipo de proyecto"
                className="flex w-full"
              >
                {PROJECT_TYPES.map((type, index) => {
                  const isSelected = type.id === activeTypeId;

                  return (
                    <button
                      key={type.id}
                      type="button"
                      data-testid="project-type-button"
                      data-type={type.id}
                      aria-pressed={isSelected}
                      onClick={() => {
                        // El índice abierto apunta al set del tipo anterior.
                        setSelected(null);
                        setActiveTypeId(type.id);
                      }}
                      className={`flex-1 border p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
                        isSelected
                          ? "text-cancel border-cancel border-b-2 font-bold border-inherit"
                          : "text-dark hover:bg-dark/10 border-dark border-b-3 font-semibold cursor-pointer"}
                        ${index === 0 ? "rounded-l-md" : index === PROJECT_TYPES.length - 1 ? "rounded-r-md" : ""}
                      `}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <section className="section-right" data-testid="projects-gallery">
        {/* Sin `overflow-hidden`: el vuelo de vuelta del lightbox se renderiza
            sobre el tile y quedaría recortado a la caja de la galería. */}
        <ScrollReveal variant="scale" className="w-full flex-1 min-h-0">
          <ProjectsGrid
            images={activeImages}
            onSelect={setSelected}
            priorityIndex={activeTypeId === PROJECT_TYPES[0].id ? 0 : null}
            hiddenSrc={selectedImage?.src ?? null}
            className="h-full w-full"
          />
        </ScrollReveal>
      </section>
      {/* Fuera de todo ScrollReveal: su `transform` sería el bloque contenedor
          del `fixed inset-0` del lightbox y lo encerraría en la sección. */}
      <ImageLightbox
        image={selectedImage}
        thumbnailSizes={selected === null ? undefined : tileSizes(selected)}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}
