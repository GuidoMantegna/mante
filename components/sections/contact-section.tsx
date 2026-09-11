"use client";
import { useViewportSize } from "@/hooks/useViewportSize";
import { CiInstagram, CiMail, CiPhone } from "react-icons/ci";
import { Footer } from "@/components/ui/footer";
import { ScrollReveal, REVEAL_STAGGER_MS } from "@/components/scroll-reveal";

export function ContactSection() {
  const { width } = useViewportSize();

  return (
    <main className="h-svh w-full flex flex-col" id="contacto">
      <div className="flex px-8 flex-1 justify-between items-center gap-20 max-w-[1280px] mx-auto w-full lg:px-10">
        <section className="flex flex-col gap-8 lg:gap-4">
          {/* SECTION TITLE */}
          <ScrollReveal>
            <div>
              <h2 className="section-title">Contactanos</h2>
              <h2 className="section-title">Cotizá</h2>
              <h2 className="section-title text-cancel">Coordinemos</h2>
              <h2 className="section-title text-cancel">una visita.</h2>
            </div>
          </ScrollReveal>
          {/* LOCATION TEXT */}
          <ScrollReveal delayMs={REVEAL_STAGGER_MS}>
            <p className="mt-2">
              Encontranos en Maschwitz, Buenos aires. Realizamos trabajos en CABA
              y Zona Norte.
            </p>
          </ScrollReveal>
          {/* REDES */}
          <ScrollReveal delayMs={REVEAL_STAGGER_MS * 2}>
            <ul className="text-xl">
              <li className="flex gap-2 items-center">
                <CiInstagram className="text-cancel" />
                <a href="https://www.instagram.com/mante.ar" target="_blank" rel="noopener noreferrer" >@mante.ar</a>
              </li>
              <li className="flex gap-2 items-center">
                <CiPhone className="text-cancel" />
                <a href={`https://wa.me/5491178431766?text=${encodeURIComponent("Hola 👋! Los contacto desde la página y quisiera obtener más información sobre sus servicios.")}`} target="_blank" rel="noopener noreferrer">
                  +54 9 11 7843 1766
                </a>
              </li>
              <li className="flex gap-2 items-center">
                <CiMail className="text-cancel" />
                <a href="mailto:mantemuebles@gmail.com" target="_blank" rel="noopener noreferrer">
                  mantemuebles@gmail.com
                </a>
              </li>
            </ul>
          </ScrollReveal>
        </section>

        {/* FORM */}
        {width >= 1024 && (
          <ScrollReveal delayMs={REVEAL_STAGGER_MS * 3}>
            <section className="flex flex-col justify-center gap-4">
              <form className="flex flex-col gap-6 w-full w-sm">
                <fieldset>
                  <label htmlFor="mail">Mail</label>
                  <input
                    type="email"
                    placeholder="tumail@mail.com"
                    id="mail"
                  />{" "}
                </fieldset>
                <fieldset>
                  <label htmlFor="message">Consulta</label>
                  <textarea
                    placeholder="Contanos el motivo de tu consulta"
                    id="message"
                    rows={4}
                  />{" "}
                </fieldset>
                <button className="border border-accent border-b-3 p-1 rounded-xs font-semibold">
                  Enviar
                </button>
              </form>
            </section>
          </ScrollReveal>
        )}
      </div>
      <Footer />
    </main>
  );
}
