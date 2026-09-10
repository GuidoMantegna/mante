import Image from "next/image";
import { SketchSequence } from "@/components/sketch-sequence";
import { KITCHEN_SKETCH } from "@/components/sketchs/kitchen-sketch";
import { CLOSET_SKETCH } from "@/components/sketchs/closet-sketch";
import { ScrollReveal, REVEAL_STAGGER_MS } from "@/components/scroll-reveal";

export function HomeSection() {
  return (
    <main className="section-main" id="home">
      <section className="section-left">
        <div className="section-left-content">
          {/* SECTION TITLE */}
          <ScrollReveal>
            <div>
              <h1 className="section-title">Somos</h1>
              <h1 className="section-title text-cancel">
                Manté
              </h1>
            </div>
          </ScrollReveal>
          {/* MAIN TEXT */}
          <ScrollReveal delayMs={REVEAL_STAGGER_MS}>
            <div className="text-sm">
              {/* DIVIDER */}
              <div className="grid gap-2 w-full">
                <Image
                  alt="Logo Manté"
                  src="/logo-accent.svg"
                  width={25}
                  height={25}
                />
                <div className="border-b border-cancel" />
                <h2 className="text-[0.7rem] lg:text-xs">DISEÑAMOS . FABRICAMOS . INSTALAMOS . MOBILIARIO A MEDIDA</h2>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delayMs={REVEAL_STAGGER_MS}>
            <div className="text-sm">
              <p>Diseñamos espacios para ser vividos.</p>
              <br/>
              <p>
                Creemos que un buen mueble no solo tiene que verse bien. Tiene que
                resolver, durar y acompañar la forma de vivir de quienes lo usan
                todos los días.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <section className="section-right">
        <SketchSequence
          sketches={[KITCHEN_SKETCH, CLOSET_SKETCH]}
          className="h-auto max-h-full w-full py-4 text-dark"
        />
      </section>
    </main>
  );
}
