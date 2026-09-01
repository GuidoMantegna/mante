"use client";

import { SplashCurtain } from "./splash-curtain";
import { useSplashGate } from "./splash-gate";
import { SplashSection } from "./splash-section";

export function SplashOverlay() {
  const { phase } = useSplashGate();

  if (phase === "done") return null;

  return (
    <>
      {/* En `opening` el splash ya está tapado por la cortina cerrada, así que
          desmontarlo ahí es invisible y evita animar dos capas a la vez. */}
      {phase !== "opening" && <SplashSection />}
      <SplashCurtain />
    </>
  );
}
