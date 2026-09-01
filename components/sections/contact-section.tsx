"use client";
import { useViewportSize } from "@/hooks/useViewportSize";
import Image from "next/image";
import { CiInstagram, CiMail, CiPhone } from "react-icons/ci";
import { Footer } from "@/components/ui/footer";

export function ContactSection() {
  const { width } = useViewportSize();

  return (
    <main className="h-svh w-full flex flex-col" id="contacto">
      <div className="flex px-8 pt-14 flex-1 justify-center items-center gap-20">
        <section className="flex flex-col gap-8 lg:gap-4">
          {/* SECTION TITLE */}
          <div>
            <Image
              alt="Logo Manté"
              src="/logo-accent.svg"
              width={30}
              height={30}
            />
            <h2 className="section-title">Contactanos</h2>
            <h2 className="section-title">Cotizá</h2>
            <h2 className="section-title text-cancel">Coordinemos</h2>
            <h2 className="section-title text-cancel">una visita.</h2>
          </div>
          {/* LOCATION TEXT */}
          <p className="mt-2">
            Encontranos en Maschwitz, Buenos aires. Realizamos trabajos en CABA
            y Zona Norte.
          </p>
          {/* REDES */}
          <ul className="text-xl">
            <li className="flex gap-2 items-center">
              <CiInstagram className="text-cancel" />
              <span>@mante.ar</span>
            </li>
            <li className="flex gap-2 items-center">
              <CiPhone className="text-cancel" />
              <span>+54 11 7843 1766</span>
            </li>
            <li className="flex gap-2 items-center">
              <CiMail className="text-cancel" />
              <span>mantemuebles@gmail.com</span>
            </li>
          </ul>
        </section>

        {/* FORM */}
        {width >= 1024 && (
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
        )}
      </div>
      <Footer />
    </main>
  );
}
