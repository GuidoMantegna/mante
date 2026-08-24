"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

export const SPLASH_IMAGES = [
  "/images/splash-1.webp",
  "/images/splash-2.webp",
  "/images/splash-3.webp",
] as const;

export const SPLASH_INTERVAL_MS = 3000;

export const SPLASH_CROSSFADE_MS = 1200;

export function SplashSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const crossfadeMs = prefersReducedMotion ? 0 : SPLASH_CROSSFADE_MS;

  useEffect(() => {
    const intervalId = setInterval(
      () => setActiveIndex((index) => (index + 1) % SPLASH_IMAGES.length),
      SPLASH_INTERVAL_MS,
    );

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section
      data-testid="splash-section"
      className="relative h-svh w-full shrink-0 overflow-hidden"
    >
      {SPLASH_IMAGES.map((src, index) => (
        <motion.div
          key={src}
          data-testid="splash-layer"
          data-src={src}
          data-active={index === activeIndex}
          data-crossfade-ms={crossfadeMs}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: index === activeIndex ? 1 : 0 }}
          transition={{ duration: crossfadeMs / 1000, ease: "easeInOut" }}
          style={{ willChange: "opacity" }}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="100vw"
            priority={index === 0}
            className="object-cover"
          />
        </motion.div>
      ))}

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
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
    </section>
  );
}
