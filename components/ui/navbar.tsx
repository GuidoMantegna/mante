"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SPLASH_CURTAIN_OPEN_MS, useSplashGate } from "@/components/splash-gate";
import { MenuToggle } from "@/components/ui/menu-toggle";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { WaButton } from "./wa-button";

export const MENU_OPEN_CLASS = "menu-open";

export const SECTIONS = [
  { id: "proyectos", label: "PROYECTOS" },
  { id: "nosotros", label: "NOSOTROS" },
  { id: "contacto", label: "CONTACTO" },
];

export const MENU_SECTIONS = [
  { id: "home", label: "INICIO" },
  ...SECTIONS,
];

// Compartida por la barra y la fila del toggle para que ambas midan y
// se recorten exactamente igual (mismo padding, mismo ancho) sin importar
// el breakpoint: son dos filas fixed independientes, no una sola, así que
// esta es la única forma de que no se desalineen entre sí.
const NAV_ROW_CLASS = "fixed w-full py-2";

// Recién pasado este scroll se empieza a ocultar la barra: evita que
// parpadee por micro-scrolls cerca del borde superior de la página.
const SCROLL_HIDE_THRESHOLD_PX = 120;
const SCROLL_HIDE_DURATION_SECONDS = 0.3;

/** Extraída para poder testearla sin depender de layout real de scroll (jsdom no lo simula). */
export function shouldHideOnScroll(
  current: number,
  previous: number,
  thresholdPx: number = SCROLL_HIDE_THRESHOLD_PX,
): boolean {
  return current > previous && current > thresholdPx;
}

export function Navbar() {
  const { homeVisible: revealed, phase } = useSplashGate();
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolledDown, setScrolledDown] = useState(false);
  const durationSeconds = prefersReducedMotion ? 0 : 0.5;
  // Entra por detrás de la cortina para estar ya puesto cuando ésta termina
  // de abrirse y descubre el borde superior de la página.
  const delaySeconds = prefersReducedMotion
    ? 0
    : Math.max(0, SPLASH_CURTAIN_OPEN_MS / 1000 - durationSeconds);
  // Una vez la cortina terminó de abrirse la barra ya está en su lugar: a
  // partir de ahí, cualquier cambio de visibilidad lo maneja el scroll, no
  // la entrada de splash (que ya corrió y no debe repetirse ni demorarse).
  const entranceDone = phase === "done";

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolledDown(shouldHideOnScroll(current, previous));
  });

  const hiddenByScroll = entranceDone && scrolledDown;
  // Reveal compartido por la barra y el toggle: ambos son "la navbar" a
  // efectos de la entrada por detrás de la cortina y del ocultado por
  // scroll, aunque estén separados en el DOM para poder apilarlos por
  // encima del panel del menú.
  const revealAnimate = {
    opacity: revealed && !hiddenByScroll ? 1 : 0,
    y: !revealed ? -16 : hiddenByScroll ? "-100%" : 0,
  };
  const revealTransition = entranceDone
    ? {
        duration: prefersReducedMotion ? 0 : SCROLL_HIDE_DURATION_SECONDS,
        ease: "easeInOut" as const,
      }
    : {
        delay: revealed ? delaySeconds : 0,
        duration: durationSeconds,
        ease: "easeOut" as const,
      };

  // El menú no tiene sentido antes de que la home sea visible (la navbar
  // está oculta/no interactiva en ese momento).
  const open = menuOpen && revealed;

  useEffect(() => {
    document.documentElement.classList.toggle(MENU_OPEN_CLASS, open);

    return () => {
      document.documentElement.classList.remove(MENU_OPEN_CLASS);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Orden de apilamiento (de atrás hacia adelante): la barra, el panel del
  // menú, y el botón. La barra nunca cambia su propio aspecto para
  // ocultarse: el panel opaco la tapa físicamente al abrirse y la descubre
  // al cerrarse, en el mismo tiempo que dura su propia animación de wipe —
  // no hay una segunda transición que sincronizar a mano.
  //
  // El botón vive en su propia fila `fixed`, hermana de <motion.nav>, en vez
  // de ser su hijo: `position: fixed` siempre crea su propio stacking
  // context (con o sin transform/opacity animados), así que cualquier
  // z-index puesto en un descendiente de la barra queda atrapado adentro y
  // nunca puede ganarle a un hermano externo (el panel) sin importar el
  // número. Para que esa fila separada no se desalinee de la barra, comparte
  // `NAV_ROW_CLASS` (mismo ancho y padding) y usa `justify-end` — flexbox
  // real, no un offset en píxeles adivinado — para pegarse al mismo borde
  // derecho que ocuparía dentro de la barra.
  return (
    <>
      <motion.nav
        data-testid="navbar"
        data-revealed={revealed}
        data-scroll-hidden={hiddenByScroll}
        data-delay-seconds={delaySeconds}
        data-duration-seconds={durationSeconds}
        className={`${NAV_ROW_CLASS} z-10 flex justify-center border-b bg-light ${
        // className={`${NAV_ROW_CLASS} z-10 flex justify-between items-center border-b backdrop-blur-xs ${
          revealed && !hiddenByScroll ? "" : "pointer-events-none"
        }`}
        initial={false}
        animate={revealAnimate}
        transition={revealTransition}
      >
        <div className="w-full px-4 lg:px-10 flex justify-between items-center max-w-[1280px]">
          <Link href="#home" className="w-[90px] h-[44px] flex">
            <Image src="/iso-logo-dark.svg" width={90} height={90} alt="Manté" />
          </Link>
          <ul className="hidden gap-4 lg:flex items-center">
            {SECTIONS.map((section) => (
              <li key={section.id} className="nav-link font-semibold hover:text-black transition-all duration-100">
                <Link href={`#${section.id}`}>{section.label}</Link>
              </li>
            ))}
            <WaButton />
          </ul>
        </div>
      </motion.nav>
      <MobileMenu
        open={open}
        onNavigate={() => setMenuOpen(false)}
        sections={MENU_SECTIONS}
      />
      <motion.div
        className={`${NAV_ROW_CLASS} z-30 px-4 flex justify-end pointer-events-none lg:hidden`}
        initial={false}
        animate={revealAnimate}
        transition={revealTransition}
      >
        <MenuToggle
          className={revealed && !hiddenByScroll ? "pointer-events-auto" : ""}
          open={open}
          onToggle={() => setMenuOpen((current) => !current)}
        />
      </motion.div>
    </>
  );
}
