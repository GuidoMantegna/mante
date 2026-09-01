"use client";

import { useEffect, useState } from "react";

export interface RotatingIndexOptions {
  length: number;
  intervalMs: number;
  active?: boolean;
  resetKey?: unknown;
}

export function useRotatingIndex({
  length,
  intervalMs,
  active = true,
  resetKey,
}: RotatingIndexOptions): number {
  const [index, setIndex] = useState(0);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  // Ajuste de estado durante el render: evita el frame intermedio en el que
  // se vería la imagen vieja del tipo nuevo antes del próximo commit.
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setIndex(0);
  }

  useEffect(() => {
    if (!active || length < 2) return;

    const intervalId = setInterval(
      () => setIndex((current) => (current + 1) % length),
      intervalMs,
    );

    return () => clearInterval(intervalId);
  }, [active, length, intervalMs, resetKey]);

  return index;
}
