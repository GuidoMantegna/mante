"use client";

import { motion } from "motion/react";
import Image, { getImageProps } from "next/image";

// Mismo corte que el breakpoint `md` de Tailwind.
const MOBILE_MEDIA = "(max-width: 767px)";

export interface CrossfadeGalleryProps {
  images: readonly string[];
  /** Variantes para mobile, alineadas por índice con `images`. */
  mobileImages?: readonly string[];
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
  mobileImages,
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
          {mobileImages?.[index] ? (
            <ArtDirectedImage
              src={src}
              mobileSrc={mobileImages[index]}
              sizes={sizes}
              priority={index === priorityIndex}
            />
          ) : (
            <Image
              src={src}
              alt=""
              fill
              sizes={sizes}
              priority={index === priorityIndex}
              className="object-cover rounded-lg"
            />
          )}
          <div className="absolute w-full h-full bg-black/20 backdrop-blur-[1px] mix-blend-overlay"/>
        </motion.div>
      ))}
    </div>
  );
}

interface ArtDirectedImageProps {
  src: string;
  mobileSrc: string;
  sizes: string;
  priority: boolean;
}

/** `<picture>` que sirve `mobileSrc` por debajo del breakpoint `md` y `src` por encima. */
function ArtDirectedImage({
  src,
  mobileSrc,
  sizes,
  priority,
}: ArtDirectedImageProps) {
  const common = { alt: "", fill: true, sizes, priority };
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...common, src: mobileSrc });
  const { props } = getImageProps({
    ...common,
    src,
    className: "object-cover rounded-lg",
  });

  return (
    <picture>
      <source media={MOBILE_MEDIA} srcSet={mobileSrcSet} />
      <img {...props} alt="" />
    </picture>
  );
}
