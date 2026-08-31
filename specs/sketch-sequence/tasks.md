# Tasks — `sketch-sequence`

- [x] T1 — En `hooks/useDrawSequence.ts`: agregar `DRAW_STAGGER_RATIO`, `ERASE_SPEED_RATIO`
      y la función pura `resolveDrawTimings(pathCount, totalDurationMs)`; cambiar la
      firma de `useDrawSequence` a `(pathCount, totalDurationMs = DEFAULT_DRAW_DURATION_MS)`
      derivando `strokeDurationMs`/`staggerMs` de `resolveDrawTimings`; agregar las
      variantes `erased` a `container` y `stroke` (con `staggerDirection: -1` y duración
      `ERASE_SPEED_RATIO` en `container.erased`/`stroke.erased`). Cubre: R3, R4, R7.

- [x] T2 — En `components/svg-drawing.tsx`: extraer `export interface Sketch`, hacer
      `SvgDrawingProps extends Sketch`, agregar prop `animate?: "hidden" | "visible" | "erased"`
      que, si está presente, reemplaza `whileInView`/`viewport` por
      `initial="hidden" animate={animate}`; actualizar `data-stroke-duration-ms` /
      `data-stagger-ms` para exponer los valores derivados. Cubre: R3, R4, R7.

- [x] T3 — Actualizar `components/kitchen-sketch.tsx` y `components/closet-sketch.tsx`
      para exportar `KITCHEN_SKETCH` / `CLOSET_SKETCH` (tipo `Sketch`), reutilizados por
      `SketchSequence` y por los propios componentes sueltos. Cubre: R13.

- [x] T4 — Crear `components/sketch-sequence.tsx` (`"use client"`) con
      `SKETCH_HOLD_MS = 2000`, la máquina de estados `{index, phase}` descrita en
      `design.md`, `useInView` para detectar entrada/salida del viewport, manejo de
      `prefersReducedMotion`, y los atributos `data-testid="sketch-sequence"`,
      `data-active-index`, `data-phase`, `data-hold-ms`. Cubre: R1, R2, R5, R6, R8, R9,
      R10, R11, R12, R13.

- [x] T5 — Actualizar `components/home-section.tsx` para reemplazar el `KitchenSketch`
      fijo por `<SketchSequence sketches={[KITCHEN_SKETCH, CLOSET_SKETCH]} .../>`. Cubre: R1, R13.

- [x] T6 — Actualizar `tests/svg-drawing.test.tsx`: reescribir los casos de
      `durationMs`/desfase contra la nueva semántica (`durationMs` es total,
      `strokeDurationMs`/`staggerMs` derivados vía `resolveDrawTimings`); mantener los
      casos de orden de paths, `aria-label`, reduced motion e imports. Cubre: R7, R12.

- [x] T7 — Crear `tests/closet-sketch.test.tsx` (espejo de `tests/kitchen-sketch.test.tsx`)
      verificando cantidad de paths (46), tipo de cada `d`, primer trazo de la
      estructura general, y `viewBox` del placard. Cubre: R13.

- [x] T8 — Crear `tests/sketch-sequence.test.tsx` con `vi.useFakeTimers()` y
      `triggerIntersection` de `tests/setup.ts`, cubriendo cada caso de R1 a R13 (ver
      sección "Fase 3 — Tests" del plan de implementación aprobado). Cubre: R1, R2, R3,
      R4, R5, R6, R7, R8, R9, R10, R11, R12, R13.

- [x] T9 — Correr `pnpm test` y `pnpm lint` en verde; documentar el mapa de
      trazabilidad `R<n>` → test en `progress/impl_sketch-sequence.md`. Cubre: todos.
