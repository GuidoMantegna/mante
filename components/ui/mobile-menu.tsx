"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";

/** Tramo 1: el panel entra con un wipe de izquierda a derecha. */
export const MENU_PANEL_MS = 300;
/** Tramo 2: cada link aparece, escalonado, de izquierda a derecha. */
export const MENU_LINK_MS = 180;
export const MENU_LINK_STAGGER_MS = 60;

export interface MobileMenuSection {
  id: string;
  label: string;
}

export interface MobileMenuProps {
  open: boolean;
  onNavigate: () => void;
  sections: MobileMenuSection[];
}

export function MobileMenu({ open, onNavigate, sections }: MobileMenuProps) {
  const prefersReducedMotion = useReducedMotion();
  const panelSeconds = prefersReducedMotion ? 0 : MENU_PANEL_MS / 1000;
  const linkSeconds = prefersReducedMotion ? 0 : MENU_LINK_MS / 1000;
  const staggerSeconds = prefersReducedMotion ? 0 : MENU_LINK_STAGGER_MS / 1000;

  const panelVariants: Variants = {
    closed: {
      clipPath: "inset(0 100% 0 0)",
      transition: {
        duration: panelSeconds,
        delay: staggerSeconds * (sections.length - 1) + linkSeconds,
      },
    },
    open: {
      clipPath: "inset(0 0% 0 0)",
      transition: { duration: panelSeconds, delay: 0 },
    },
  };

  const listVariants: Variants = {
    closed: {
      transition: { staggerChildren: staggerSeconds, staggerDirection: -1 },
    },
    open: {
      transition: { delayChildren: panelSeconds, staggerChildren: staggerSeconds },
    },
  };

  const linkVariants: Variants = {
    closed: { opacity: 0, x: -24, transition: { duration: linkSeconds } },
    open: { opacity: 1, x: 0, transition: { duration: linkSeconds } },
  };

  return (
    <motion.div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      aria-hidden={!open}
      inert={!open || undefined}
      data-testid="mobile-menu"
      data-open={open}
      data-panel-ms={prefersReducedMotion ? 0 : MENU_PANEL_MS}
      data-link-ms={prefersReducedMotion ? 0 : MENU_LINK_MS}
      data-stagger-ms={prefersReducedMotion ? 0 : MENU_LINK_STAGGER_MS}
      initial={false}
      animate={open ? "open" : "closed"}
      variants={panelVariants}
      style={{ willChange: "clip-path" }}
      className={`fixed inset-0 z-20 overflow-hidden bg-dark lg:hidden ${
        open ? "" : "pointer-events-none"
      }`}
    >
      <motion.ul
        initial={false}
        animate={open ? "open" : "closed"}
        variants={listVariants}
        className="flex flex-col items-start gap-[25px] whitespace-nowrap pt-[129px] pl-[30px] leading-none text-white"
      >
        {sections.map((section) => (
          <motion.li key={section.id} variants={linkVariants}>
            <a
              href={`#${section.id}`}
              onClick={onNavigate}
              className="text-[min(13.7vw,55px)]"
            >
              {section.label}
            </a>
          </motion.li>
        ))}
      </motion.ul>
      <Image
        src="/logo-accent.svg"
        width={58}
        height={60}
        alt=""
        className="absolute bottom-[37px] left-1/2 -translate-x-1/2"
      />
    </motion.div>
  );
}
