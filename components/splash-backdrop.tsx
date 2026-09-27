"use client";

import { CrossfadeGallery } from "./crossfade-gallery";

export const SPLASH_IMAGES = [
  "/images/splash/splash-1.jpg",
  "/images/splash/splash-2.jpg",
  "/images/splash/splash-3.jpg",
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
    <CrossfadeGallery
      images={SPLASH_IMAGES}
      activeIndex={activeIndex}
      crossfadeMs={crossfadeMs}
      ariaHidden={ariaHidden}
      layerTestId="splash-layer"
      sizes="100vw"
      className="absolute inset-0 bg-dark"
    />
  );
}
