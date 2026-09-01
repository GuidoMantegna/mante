"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { SPLASH_IMAGES, SplashBackdrop } from "./splash-backdrop";
import { useSplashGate } from "./splash-gate";

export { SPLASH_IMAGES };

export const SPLASH_INTERVAL_MS = 3000;
export const SPLASH_CROSSFADE_MS = 1200;
export const SPLASH_HINT_DELAY_MS = 2000;
export const SPLASH_HINT_FADE_MS = 300;

export function SplashSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const { revealed } = useSplashGate();

  const crossfadeMs = prefersReducedMotion ? 0 : SPLASH_CROSSFADE_MS;
  const hintFadeMs = prefersReducedMotion ? 0 : SPLASH_HINT_FADE_MS;

  // El splash no se anima al revelar: lo tapa la cortina. Lo único que cambia
  // es que deja de rotar el fondo, para no gastar trabajo detrás del telón.
  useEffect(() => {
    if (revealed) return;

    const intervalId = setInterval(
      () => setActiveIndex((index) => (index + 1) % SPLASH_IMAGES.length),
      SPLASH_INTERVAL_MS,
    );

    return () => clearInterval(intervalId);
  }, [revealed]);

  return (
    <section
      data-testid="splash-section"
      data-state={revealed ? "covering" : "idle"}
      className="fixed inset-0 z-40 h-svh w-full overflow-hidden"
    >
      <SplashBackdrop activeIndex={activeIndex} crossfadeMs={crossfadeMs} />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          data-testid="splash-logo-layer"
          className="z-10 w-[88%] max-w-[1016px] md:w-[67%]"
        >
          <Image
            data-testid="splash-logo"
            src="/iso-logo-white.svg"
            alt="Manté"
            width={1016}
            height={280}
            priority
            unoptimized
            className="h-auto w-full object-contain"
          />
        </div>
      </div>

      <motion.div
        data-testid="splash-hint"
        data-delay-ms={SPLASH_HINT_DELAY_MS}
        data-visible={!revealed}
        className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex flex-col items-center gap-2 text-white/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 0 : 1 }}
        transition={
          revealed
            ? { duration: hintFadeMs / 1000, ease: "easeInOut" }
            : { delay: SPLASH_HINT_DELAY_MS / 1000, duration: 0.6 }
        }
      >
        <span className="text-xs uppercase tracking-[0.3em]">Deslizá</span>
        <motion.span
          animate={prefersReducedMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <FiChevronDown size={20} aria-hidden="true" />
        </motion.span>
      </motion.div>
    </section>
  );
}
