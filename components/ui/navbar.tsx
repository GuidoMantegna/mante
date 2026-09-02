"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SPLASH_CURTAIN_OPEN_MS, useSplashGate } from "@/components/splash-gate";
import { MenuToggle } from "@/components/ui/menu-toggle";
import { MobileMenu } from "@/components/ui/mobile-menu";

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
const NAV_ROW_CLASS = "fixed w-full py-2 px-4 lg:px-8";

export function Navbar() {
  const { homeVisible: revealed } = useSplashGate();
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const durationSeconds = prefersReducedMotion ? 0 : 0.5;
  // Entra por detrás de la cortina para estar ya puesto cuando ésta termina
  // de abrirse y descubre el borde superior de la página.
  const delaySeconds = prefersReducedMotion
    ? 0
    : Math.max(0, SPLASH_CURTAIN_OPEN_MS / 1000 - durationSeconds);
  // Reveal compartido por la barra y el toggle: ambos son "la navbar" a
  // efectos de la entrada por detrás de la cortina, aunque estén separados
  // en el DOM para poder apilarlos por encima del panel del menú.
  const revealAnimate = { opacity: revealed ? 1 : 0, y: revealed ? 0 : -16 };
  const revealTransition = {
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
        data-delay-seconds={delaySeconds}
        data-duration-seconds={durationSeconds}
        className={`${NAV_ROW_CLASS} z-10 flex justify-between items-center border-b backdrop-blur-xs ${
          revealed ? "" : "pointer-events-none"
        }`}
        initial={false}
        animate={revealAnimate}
        transition={revealTransition}
      >
        <Link href="#home" className="w-[90px] h-[44px] flex">
          <Image src="/iso-logo-dark.svg" width={90} height={90} alt="Manté" />
        </Link>
        <ul className="hidden gap-4 lg:flex">
          {SECTIONS.map((section) => (
            <li key={section.id} className="nav-link font-semibold hover:text-black transition-all duration-100">
              <Link href={`#${section.id}`}>{section.label}</Link>
            </li>
          ))}
        </ul>
      </motion.nav>
      <MobileMenu
        open={open}
        onNavigate={() => setMenuOpen(false)}
        sections={MENU_SECTIONS}
      />
      <motion.div
        className={`${NAV_ROW_CLASS} z-30 flex justify-end pointer-events-none lg:hidden`}
        initial={false}
        animate={revealAnimate}
        transition={revealTransition}
      >
        <MenuToggle
          className={revealed ? "pointer-events-auto" : ""}
          open={open}
          onToggle={() => setMenuOpen((current) => !current)}
        />
      </motion.div>
    </>
  );
}
