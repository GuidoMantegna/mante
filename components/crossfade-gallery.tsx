"use client";

import { motion } from "motion/react";
import Image from "next/image";

export interface CrossfadeGalleryProps {
  images: readonly string[];
  activeIndex: number;
  crossfadeMs: number;
  layerTestId?: string;
  sizes?: string;
  priorityIndex?: number | null;
  ariaHidden?: boolean;
  className?: string;
}

export function CrossfadeGallery({
  images,
  activeIndex,
  crossfadeMs,
  layerTestId = "crossfade-layer",
  sizes = "100vw",
  priorityIndex = 0,
  ariaHidden = false,
  className = "absolute inset-0",
}: CrossfadeGalleryProps) {
  return (
    <div aria-hidden={ariaHidden} className={className}>
      {images.map((src, index) => (
        <motion.div
          key={src}
          data-testid={layerTestId}
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
            sizes={sizes}
            priority={index === priorityIndex}
            className="object-cover"
          />
        </motion.div>
      ))}
    </div>
  );
}
