"use client";

import { motion } from "motion/react";
import Image from "next/image";

export const SPLASH_IMAGES = [
  "/images/splash-1.webp",
  "/images/splash-2.webp",
  "/images/splash-3.webp",
] as const;

export interface SplashBackdropProps {
  activeIndex: number;
  crossfadeMs: number;
  ariaHidden?: boolean;
}

export function SplashBackdrop({
  activeIndex,
  crossfadeMs,
  ariaHidden = false,
}: SplashBackdropProps) {
  return (
    <div aria-hidden={ariaHidden} className="absolute inset-0 bg-dark">
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
    </div>
  );
}
