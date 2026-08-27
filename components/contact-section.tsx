"use client";
import { useViewportSize } from "@/hooks/useViewportSize";
import Image from "next/image";
import { CiInstagram, CiMail, CiPhone, CiLocationOn } from "react-icons/ci";
import { Footer } from "./footer";

export function ContactSection() {
  const { width } = useViewportSize();

  return (
    <div className="h-svh w-full flex flex-col">
      <main className="flex-1 flex">
        {width >= 1024 && (
          <section className="section-left">
            <form className="flex flex-col gap-6 w-full max-w-sm my-0 mx-auto">
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
                />{" "}
              </fieldset>
              <button className="bg-accent text-white p-1 rounded-xs font-semibold">Enviar</button>
            </form>
          </section>
        )}
        <section className="section-right section-contact">
          <div className="w-full h-full flex flex-col justify-center gap-10">
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
            {/* MAIN TEXT */}
            <div className="mt-10">
              {/* <CiLocationOn size={50} /> */}
              <div className="border-b border-cancel" />
              <p className="">
                Encontranos en Maschwitz, Buenos aires. Realizamos trabajos en
                CABA y Zona Norte.
              </p>
            </div>
            </div>
            {/* REDES */}
            <ul className="text-2xl">
              <li className="flex gap-2 items-center">
                <CiInstagram />
                <span>@mante.ar</span>
              </li>
              <li className="flex gap-2 items-center">
                <CiPhone />
                <span>+54 11 7843 1766</span>
              </li>
              <li className="flex gap-2 items-center">
                <CiMail />
                <span>mantemuebles@gmail.com</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
