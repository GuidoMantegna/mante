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
  // no hay una segunda transición que sincronizar a mano. El botón vive
  // fuera del <motion.nav> porque éste anima `opacity`/`y` y por lo tanto
  // crea su propio stacking context: un z-index más alto adentro no puede
  // ganarle a un hermano (el panel) que está afuera.
  return (
    <>
      <motion.nav
        data-testid="navbar"
        data-revealed={revealed}
        data-delay-seconds={delaySeconds}
        data-duration-seconds={durationSeconds}
        className={`fixed z-10 flex w-full justify-between border-b p-4 text-black backdrop-blur-xs lg:px-8 ${
          revealed ? "" : "pointer-events-none"
        }`}
        initial={false}
        animate={revealAnimate}
        transition={revealTransition}
      >
        <Link href="#home" className="w-[75px]">
          <Image src="/iso-logo-dark.svg" width={75} height={75} alt="Manté" />
        </Link>
        <ul className="hidden gap-4 lg:flex">
          {SECTIONS.map((section) => (
            <li key={section.id}>
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
        className={`fixed top-4 right-4 z-30 lg:hidden ${
          revealed ? "" : "pointer-events-none"
        }`}
        initial={false}
        animate={revealAnimate}
        transition={revealTransition}
      >
        <MenuToggle
          open={open}
          onToggle={() => setMenuOpen((current) => !current)}
        />
      </motion.div>
    </>
  );
}
