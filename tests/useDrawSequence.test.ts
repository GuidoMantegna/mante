import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TargetAndTransition, Variant } from "motion/react";
import {
  DRAW_STAGGER_RATIO,
  ERASE_SPEED_RATIO,
  resolveDrawTimings,
  useDrawSequence,
} from "@/hooks/useDrawSequence";

// Las variants del hook siempre son objetos (nunca resolvers dinámicos), así que se
// castea para acceder a `transition` sin repetir la comprobación en cada test.
function asTarget(variant: Variant): TargetAndTransition {
  return variant as TargetAndTransition;
}

describe("resolveDrawTimings", () => {
  it("deriva un desfase proporcional a la duración de un trazo", () => {
    const { strokeDurationMs, staggerMs } = resolveDrawTimings(5, 1000);

    expect(staggerMs).toBeCloseTo(strokeDurationMs * DRAW_STAGGER_RATIO);
  });

  it("el tiempo total de dibujado (trazo + desfases) es constante sin importar la cantidad de trazos", () => {
    const total = (pathCount: number) => {
      const { strokeDurationMs, staggerMs } = resolveDrawTimings(pathCount, 3000);
      return strokeDurationMs + staggerMs * (pathCount - 1);
    };

    expect(total(1)).toBeCloseTo(3000);
    expect(total(19)).toBeCloseTo(3000);
    expect(total(46)).toBeCloseTo(3000);
  });

  it("eraseTotalMs es la mitad de drawTotalMs", () => {
    const { drawTotalMs, eraseTotalMs } = resolveDrawTimings(10, 3000);

    expect(eraseTotalMs).toBeCloseTo(drawTotalMs * ERASE_SPEED_RATIO);
  });
});

describe("useDrawSequence", () => {
  it("la variante erased de cada trazo dura la mitad que la variante visible", () => {
    const { result } = renderHook(() => useDrawSequence(4, 900));

    const visibleDuration = asTarget(result.current.stroke.visible).transition!
      .duration as number;
    const erasedDuration = asTarget(result.current.stroke.erased).transition!
      .duration as number;

    expect(erasedDuration).toBeCloseTo(visibleDuration * ERASE_SPEED_RATIO);
  });

  it("la variante erased del contenedor invierte el orden con staggerDirection -1", () => {
    const { result } = renderHook(() => useDrawSequence(4, 900));

    expect(
      asTarget(result.current.container.visible).transition?.staggerDirection,
    ).toBeUndefined();
    expect(
      asTarget(result.current.container.erased).transition?.staggerDirection,
    ).toBe(-1);
  });

  it("el desfase entre trazos de la variante erased también es la mitad que en visible", () => {
    const { result } = renderHook(() => useDrawSequence(4, 900));

    const visibleStagger = asTarget(result.current.container.visible).transition!
      .staggerChildren as number;
    const erasedStagger = asTarget(result.current.container.erased).transition!
      .staggerChildren as number;

    expect(erasedStagger).toBeCloseTo(visibleStagger * ERASE_SPEED_RATIO);
  });
});
