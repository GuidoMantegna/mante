import { CiHeart } from "react-icons/ci";
import { ScrollReveal, REVEAL_STAGGER_MS } from "./scroll-reveal";
import Image from "next/image";

export function Reviews() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-10">
      <div className="flex flex-col lg:flex-row w-full lg:border-y border-cancel lg:gap-8 lg:py-8 text-sm text-center">
        <ScrollReveal className="flex-1" delayMs={REVEAL_STAGGER_MS}>
          <div className="flex flex-col justify-between h-full gap-4 p-4">
            <p className="italic">
              "Excelente experiencia! Súper puntuales, prolijos y te dan una
              confianza total. Te asesoran, cumplen con todo y los muebles
              quedaron impecables, de primera calidad. ¡Súper recomendables!"
              <CiHeart className="text-accent mx-auto mt-2" />
            </p>
            <div className="flex items-center justify-center">
              <div className="relative w-[40px] h-[40px]">
                <Image
                  src="/images/avatars/avatar-nadia.jpg"
                  alt="Avatar Review"
                  fill
                  sizes="100%"
                  className="rounded-full"
                />
              </div>
              <div className="flex flex-col text-left ml-2">
                <span className="font-bold">Nadia Devani</span>
                <a
                  href="https://www.instagram.com/mante.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @mante.ar
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal className="flex-1" delayMs={REVEAL_STAGGER_MS}>
          <div className="flex flex-col justify-between h-full gap-4 p-4 border-y lg:border-x lg:border-y-transparent border-cancel">
            <p className="italic">
              "Estamos muy conformes con el resultado. Se nota la prolijidad en
              cada mueble, especialmente en la cocina laqueada. Todo quedó muy
              bien terminado y cuidado hasta el último detalle."
              <CiHeart className="text-accent mx-auto mt-2" />
            </p>
            <div className="flex items-center justify-center">
              <div className="relative w-[40px] h-[40px]">
                <Image
                  src="/images/avatars/avatar-gaston.jpg"
                  alt="Avatar Review"
                  fill
                  sizes="100%"
                  className="rounded-full"
                />
              </div>
              <div className="flex flex-col text-left ml-2">
                <span className="font-bold">Gastón Markowicz</span>
                <a
                  href="https://www.instagram.com/mante.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @mante.ar
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal className="flex-1" delayMs={REVEAL_STAGGER_MS}>
          <div className="flex flex-col justify-between h-full gap-4 p-4">
            <p className="italic">
              "Los contactamos por recomendación de unos vecinos para hacer el
              bajo mesada y terminamos haciendo todos los muebles de la casa.
              ¡Excelente trabajo, súper prolijos y, sobre todo, destacamos el
              trato y la amabilidad! Los volveríamos a elegir sin dudas. Súper
              recomendables."
              <CiHeart className="text-accent mx-auto mt-2" />
            </p>
            <div className="flex items-center justify-center">
              <div className="relative w-[40px] h-[40px]">
                <Image
                  src="/images/avatars/avatar-lucia.jpg"
                  alt="Avatar Review"
                  fill
                  sizes="100%"
                  className="rounded-full"
                />
              </div>
              <div className="flex flex-col text-left ml-2">
                <span className="font-bold">Lucia Martinez</span>
                <a
                  href="https://www.instagram.com/mante.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @mante.ar
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
