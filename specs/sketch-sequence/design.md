# Design — `sketch-sequence`

## Archivos afectados

- `hooks/useDrawSequence.ts` (modificar)
- `components/svg-drawing.tsx` (modificar)
- `components/sketch-sequence.tsx` (nuevo)
- `components/kitchen-sketch.tsx` (modificar)
- `components/closet-sketch.tsx` (modificar)
- `components/home-section.tsx` (modificar)
- `tests/sketch-sequence.test.tsx` (nuevo)
- `tests/svg-drawing.test.tsx` (actualizar)
- `tests/closet-sketch.test.tsx` (nuevo)

## Modelo de tiempos (fuente única de verdad)

`hooks/useDrawSequence.ts` expone una función pura, usada tanto por las `variants` de
Motion como por los temporizadores de `SketchSequence`, para no duplicar la aritmética
entre ambos consumidores:

```ts
export const DEFAULT_DRAW_DURATION_MS = 3000; // total por boceto (antes: por trazo)
export const DRAW_STAGGER_RATIO = 0.1;        // desfase = 10% de la duración de un trazo
export const ERASE_SPEED_RATIO = 0.5;         // desdibujar = mitad de tiempo que dibujar

export function resolveDrawTimings(pathCount: number, totalDurationMs: number) {
  // totalDurationMs = strokeDurationMs + staggerMs * (pathCount - 1)
  // con staggerMs = strokeDurationMs * DRAW_STAGGER_RATIO
  const strokeDurationMs = totalDurationMs / (1 + DRAW_STAGGER_RATIO * (pathCount - 1));
  return {
    strokeDurationMs,
    staggerMs: strokeDurationMs * DRAW_STAGGER_RATIO,
    drawTotalMs: totalDurationMs,
    eraseTotalMs: totalDurationMs * ERASE_SPEED_RATIO,
  };
}
```

Con `durationMs = 3000`: cocina (19 paths) → trazo ≈ 1071 ms / desfase ≈ 107 ms; placard
(46 paths) → trazo ≈ 545 ms / desfase ≈ 55 ms. Ciclo completo con `holdMs = 2000`:
3000 (dibuja cocina) + 2000 (sostenido) + 1500 (desdibuja cocina) + 3000 (dibuja
placard) = 9500 ms, y el placard queda fijo (R6).

Esto cubre R3 (mitad de tiempo) y R7 (tiempo total constante por boceto,
independiente de `pathCount`).

## `hooks/useDrawSequence.ts`

- Nueva firma: `useDrawSequence(pathCount: number, totalDurationMs = DEFAULT_DRAW_DURATION_MS)`.
  `durationMs` pasa a significar **tiempo total del boceto** (antes era tiempo por
  trazo); desaparece el parámetro `staggerMs` porque ahora se deriva.
- `container` gana la variante `erased`:
  - `visible.transition = { staggerChildren: staggerMs / 1000 }` (sin cambios de
    semántica respecto a hoy).
  - `erased.transition = { staggerChildren: (staggerMs * ERASE_SPEED_RATIO) / 1000, staggerDirection: -1 }`
    — cubre R4 (orden inverso). Verificado contra el código instalado de
    `motion-dom@13.1.1` (`animation/utils/calc-child-stagger.mjs`): `staggerChildren` +
    `staggerDirection: -1` siguen soportados en variants y producen exactamente el
    orden inverso por índice de hijo.
- `stroke` gana la variante `erased`:
  `{ pathLength: 0, transition: { duration: (strokeDurationMs * ERASE_SPEED_RATIO) / 1000, ease: "easeInOut" } }`.
- `prefersReducedMotion` sigue colapsando `strokeDurationMs` y `staggerMs` (y por lo
  tanto sus derivados de `erased`) a `0`.

## `components/svg-drawing.tsx`

- Se extrae `export interface Sketch { paths: readonly string[]; viewBox: string; strokeWidth: number; title: string }`.
  `SvgDrawingProps extends Sketch { durationMs?; className? }` (se quita `staggerMs`,
  ahora derivado).
- Prop nueva `animate?: "hidden" | "visible" | "erased"`.
  - Si se pasa: `<motion.svg variants={container} initial="hidden" animate={animate} />`
    (controlado externamente por `SketchSequence`).
  - Si no se pasa: se conserva el comportamiento actual,
    `whileInView="visible"` + `viewport={{ once: true, amount: 0.3 }}`, para que
    `KitchenSketch`/`ClosetSketch` sigan siendo usables sueltos (y sus tests actuales no
    se rompen).
- `data-stroke-duration-ms` / `data-stagger-ms` pasan a exponer los valores ya
  **derivados** por `resolveDrawTimings` en vez del prop crudo.

## `components/sketch-sequence.tsx` (nuevo)

```ts
"use client";
export interface SketchSequenceProps {
  sketches: readonly Sketch[];
  holdMs?: number;      // default SKETCH_HOLD_MS = 2000
  durationMs?: number;  // default DEFAULT_DRAW_DURATION_MS = 3000
  className?: string;
}
```

- Estado: `{ index: number; phase: "hidden" | "visible" | "erased" }`.
- `const inView = useInView(containerRef, { amount: 0.3 })` (de `motion/react`).
- Un único `useEffect` reacciona a `[inView, index, phase]` y programa **como mucho un**
  `setTimeout`, limpiado en el cleanup:
  - `!inView` → si el estado no es ya `{0, "hidden"}`, resetea a `{0, "hidden"}`. Cubre R8.
  - `inView && phase === "hidden"` → pasa a `{0, "visible"}` (arranca dibujado). Cubre R1, R9.
  - `phase === "visible"` y `index < sketches.length - 1` → `setTimeout(() => setPhase("erased"), drawTotalMs + holdMs)`. Cubre R2.
  - `phase === "visible"` y `index === sketches.length - 1` → no programa nada (R6).
  - `phase === "erased"` → `setTimeout(() => { index++; phase = "visible" }, eraseTotalMs)`. Cubre R5.
- Con `prefersReducedMotion` (de `useReducedMotion`, `motion/react`): no se ejecuta la
  máquina de estados; se renderiza directo `sketches.at(-1)` con `animate="visible"`
  (R10).
- Render (caso animado):
  ```tsx
  <div ref={containerRef} data-testid="sketch-sequence" data-active-index={index} data-phase={phase} data-hold-ms={holdMs} className={className}>
    <SvgDrawing key={index} {...sketches[index]} durationMs={durationMs} animate={phase} />
  </div>
  ```
  `key={index}` fuerza un remount al cambiar de boceto: cada `SvgDrawing` nuevo entra en
  `initial="hidden"` (`pathLength: 0`) y anima a `"visible"`, sin arrastrar estado del
  boceto anterior.
- `sketches` admite cualquier longitud ≥ 1 (R13): la condición "es el último" es
  `index === sketches.length - 1`, no un valor hardcodeado.

## `components/kitchen-sketch.tsx` / `components/closet-sketch.tsx`

- Cada uno exporta su descriptor `Sketch`:
  `export const KITCHEN_SKETCH: Sketch = { paths: KITCHEN_SKETCH_PATHS, viewBox: KITCHEN_SKETCH_VIEW_BOX, strokeWidth: KITCHEN_SKETCH_STROKE_WIDTH, title: "Boceto de cocina" }`
  (ídem `CLOSET_SKETCH`).
- Los componentes `KitchenSketch` / `ClosetSketch` quedan como
  `<SvgDrawing {...KITCHEN_SKETCH} className={className} />` — compatibilidad con los
  tests existentes que los renderizan sueltos.

## `components/home-section.tsx`

Reemplaza las líneas actuales de `KitchenSketch`/`ClosetSketch` comentado por:

```tsx
<SketchSequence
  sketches={[KITCHEN_SKETCH, CLOSET_SKETCH]}
  className="h-auto max-h-full w-full max-w-[560px] text-dark"
/>
```

Sigue siendo Server Component: importa un componente cliente (`SketchSequence`), según
`docs/architecture.md` §Server vs Client Components. Agregar un boceto nuevo a futuro es
agregar un elemento más a ese array (R13), sin tocar `SketchSequence`.

## Alternativa descartada

**`AnimatePresence mode="wait"` + variante `exit` + `onAnimationComplete`.** Se descartó
por dos motivos:
1. En jsdom (entorno de test) un `SVGPathElement` no implementa `getTotalLength`, por lo
   que la resolución de `pathLength` puede no completar nunca en el entorno de test, y
   los tests que dependieran de `onAnimationComplete` quedarían indefinidamente
   pendientes en vez de fallar rápido.
2. Encadenar fases (dibujar → sostener → desdibujar → siguiente) vía callbacks anidados
   de `onAnimationComplete` es más difícil de testear determinísticamente que una
   máquina de estados basada en `setTimeout`, que se controla con `vi.useFakeTimers()` y
   `vi.advanceTimersByTime()`.

La máquina de estados por temporizadores, con los tiempos calculados una sola vez por
`resolveDrawTimings`, es determinista, no duplica aritmética entre las `variants` de
Motion y la orquestación, y es directamente testeable.
