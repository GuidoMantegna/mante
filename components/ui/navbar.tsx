"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { SPLASH_CURTAIN_OPEN_MS, useSplashGate } from "@/components/splash-gate";

export const SECTIONS = [
  { id: "proyectos", label: "PROYECTOS" },
  { id: "nosotros", label: "NOSOTROS" },
  { id: "contacto", label: "CONTACTO" },
];

export function Navbar() {
  const { homeVisible: revealed } = useSplashGate();
  const prefersReducedMotion = useReducedMotion();
  const durationSeconds = prefersReducedMotion ? 0 : 0.5;
  // Entra por detrás de la cortina para estar ya puesto cuando ésta termina
  // de abrirse y descubre el borde superior de la página.
  const delaySeconds = prefersReducedMotion
    ? 0
    : Math.max(0, SPLASH_CURTAIN_OPEN_MS / 1000 - durationSeconds);

  return (
    <motion.nav
      data-testid="navbar"
      data-revealed={revealed}
      data-delay-seconds={delaySeconds}
      data-duration-seconds={durationSeconds}
      className={`fixed z-30 flex justify-between border-b w-full p-4 lg:px-8 backdrop-blur-xs text-black ${
        revealed ? "" : "pointer-events-none"
      }`}
      initial={false}
      animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : -16 }}
      transition={{
        delay: revealed ? delaySeconds : 0,
        duration: durationSeconds,
        ease: "easeOut",
      }}
    >
      <Link href="#home" className="w-[75px]">
        <Image src="/iso-logo-dark.svg" width={75} height={75} alt="Manté" />
      </Link>
      <ul className="flex gap-4">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <Link href={`#${section.id}`}>{section.label}</Link>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}
