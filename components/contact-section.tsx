"use client";
import { useViewportSize } from "@/hooks/useViewportSize";
import Image from "next/image";
import { CiInstagram, CiMail, CiPhone, CiLocationOn } from "react-icons/ci";
import { Footer } from "./footer";

export function ContactSection() {
  const { width } = useViewportSize();

  return (
    <div className="h-svh w-full flex flex-col">
        <main className="flex px-8 pt-14 flex-1 justify-center items-center gap-20">

        
        <section className="">
          <div className="w-full h-full flex flex-col gap-8 lg:gap-4">
            
            <div className="flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-20">
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
                {/* <form className="hidden lg:flex flex-col gap-4 w-full max-w-sm">
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
                    <button className="bg-accent text-white p-1 rounded-xs font-semibold">
                    Enviar
                    </button>
                </form> */}
            </div>
              {/* MAIN TEXT */}
              <div className="mt-2">
                {/* <CiLocationOn size={50} /> */}
                {/* <div className="border-b border-cancel" /> */}
                <p className="">
                  Encontranos en Maschwitz, Buenos aires. Realizamos trabajos en
                  CABA y Zona Norte.
                </p>
              </div>
              {/* REDES */}
            <ul className="text-xl">
              <li className="flex gap-2 items-center">
                <CiInstagram className="text-cancel"/>
                <span>@mante.ar</span>
              </li>
              <li className="flex gap-2 items-center">
                <CiPhone className="text-cancel"/>
                <span>+54 11 7843 1766</span>
              </li>
              <li className="flex gap-2 items-center">
                <CiMail className="text-cancel"/>
                <span>mantemuebles@gmail.com</span>
              </li>
            </ul>
          </div>
        </section>
        {width >= 1024 && (
          <section className="flex flex-col justify-center gap-4">
            {/* <ul className="text-xl">
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
            </ul> */}
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
                />{" "}
              </fieldset>
              <button className="border border-accent border-b-3 p-1 rounded-xs font-semibold">Enviar</button>
            </form>
          </section>
        )}
        </main>
      <Footer />
    </div>
  );
}
