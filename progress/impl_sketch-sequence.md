# Implementación — `sketch-sequence`

## Trazabilidad

- R1 → `tests/sketch-sequence.test.tsx` › "R1: al entrar en el viewport dibuja el primer boceto de la secuencia"
- R2 → `tests/sketch-sequence.test.tsx` › "R2: sostiene el boceto dibujado holdMs antes de empezar a desdibujarlo"
- R3 → `tests/useDrawSequence.test.ts` › "la variante erased de cada trazo dura la mitad que la variante visible"
- R4 → `tests/useDrawSequence.test.ts` › "la variante erased del contenedor invierte el orden con staggerDirection -1"
- R5 → `tests/sketch-sequence.test.tsx` › "R5: terminado el desdibujado, avanza al siguiente boceto y lo dibuja"
- R6 → `tests/sketch-sequence.test.tsx` › "R6: el último boceto queda fijo, sin más transiciones ni temporizadores"
- R7 → `tests/useDrawSequence.test.ts` › "el tiempo total de dibujado (trazo + desfases) es constante sin importar la cantidad de trazos"
  y `tests/svg-drawing.test.tsx` › "el tiempo total de dibujado es igual sin importar la cantidad de trazos"
- R8 → `tests/sketch-sequence.test.tsx` › "R8: al salir del viewport reinicia el estado y cancela el temporizador pendiente"
- R9 → `tests/sketch-sequence.test.tsx` › "R9: al volver a entrar en el viewport la secuencia arranca de nuevo desde el primero"
- R10 → `tests/sketch-sequence.test.tsx` › "R10: con prefers-reduced-motion se renderiza solo el último boceto, fijo y sin temporizadores"
- R11 → `tests/sketch-sequence.test.tsx` › "R11: al desmontar no queda ningún temporizador activo"
- R12 → `tests/sketch-sequence.test.tsx` › "R12: la animación viene de motion/react y no de framer-motion"
- R13 → `tests/sketch-sequence.test.tsx` › "R13: recorre cualquier cantidad de bocetos en orden hasta quedar fijo en el último"
  y `tests/closet-sketch.test.tsx` (boceto adicional reutilizando la misma infraestructura)

## Verificación

- `pnpm test` → 6 archivos, 56 tests, 0 fallos.
- `pnpm lint` → 0 errores (incluyendo `react-hooks/set-state-in-effect` y `react-hooks/refs`,
  que forzaron a mover el reinicio por `inView` de un `useEffect` a un ajuste de estado
  durante el render, según el patrón oficial de React).
- `npx tsc --noEmit` → 0 errores.
- Verificación manual en navegador real (Chrome vía Playwright, contra `pnpm dev`):
  se confirmó la secuencia completa `#home` → cocina se dibuja y sostiene → se
  desdibuja → placard se dibuja y queda fijo, sin errores de consola. Capturas
  descartadas tras la verificación (no forman parte del repo).

## Notas de implementación

- El tiempo total de dibujado (`durationMs`, default 3000ms) es constante por boceto
  sin importar su cantidad de trazos: `resolveDrawTimings` deriva `strokeDurationMs`/
  `staggerMs` a partir de `pathCount` (ver `hooks/useDrawSequence.ts`).
- `SvgDrawing` ahora acepta una prop `animate` opcional para ser controlado
  externamente (`"hidden" | "visible" | "erased"`); sin ella conserva su comportamiento
  original (`whileInView` + `viewport once`), así que `KitchenSketch`/`ClosetSketch`
  siguen siendo usables sueltos.
- El reinicio de la secuencia al entrar/salir del viewport se resuelve durante el
  render (comparando `inView` contra su valor anterior guardado en estado), no en un
  efecto, siguiendo la guía de React para "ajustar estado cuando cambia una prop" —
  necesario para pasar `eslint-plugin-react-hooks` (`set-state-in-effect`, `refs`).
