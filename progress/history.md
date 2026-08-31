# Historial de sesiones

> Bitácora append-only. Cada sesión cerrada se agrega al final, nunca se
> reescribe una entrada existente.

---

## 2026-08-24 — `splash-section` (`id: 1`) → `done`

**Feature:** Sección Splash con transición de imágenes, basada en los frames
SPLASH de Figma (fileKey `xq6bGeZ1bS99w5FydB8lcP`).

**Flujo SDD completo:** `pending` → `spec-author` → `spec_ready` → ⏸ humano →
`in_progress` → `implementer` → `reviewer` (**aprobado**) → `done`.

**Entregables:**

- `specs/splash-section/{requirements,design,tasks}.md` — 22 requirements
  EARS (`R1`–`R22`), 35 tasks (`T1`–`T35`), todas `[x]`.
- `components/splash-section.tsx` — Client Component, tres capas
  `motion.div` (`motion/react`) con crossfade de opacidad (1200 ms, 0 con
  `prefers-reduced-motion`), rotación cada 3000 ms con `setInterval` +
  cleanup, logo `iso-logo-white.svg` superpuesto.
- `app/page.tsx` reducido a `<SplashSection />`, sigue siendo Server
  Component.
- `tests/splash-section.test.tsx` — 21 tests, uno por task, cubriendo los
  22 requirements. Infraestructura de test (`vitest` + `jsdom` +
  Testing Library) montada desde cero en esta feature (`T1`–`T4`).
- Rama `specs/splash-section`, creada desde `config`.

**Verificación:** `pnpm test` 21/21, `pnpm lint` 0 errores, `npx tsc --noEmit`
limpio, `pnpm build` OK. Verificación visual humana a 402/768/1512 px y
confirmación del breakpoint tablet `md` = 768 px (interpolación sin frame de
Figma de respaldo): **"visual OK"**, 2026-08-24.

**Bug de config resuelto en esta sesión:** el subagente `spec_author` no
cargaba (el loader rechaza `_` en `name:`). Renombrado a `spec-author` en
`.claude/agents/`, `AGENTS.md`, `docs/specs.md`, `.claude/agents/leader.md`
y `.claude/commands/add-feature.md`.

**Deuda no bloqueante para próximas sesiones:**

- `CHECKPOINTS.md` no existe en ninguna rama pese a estar referenciado en
  `AGENTS.md` §2 — el reviewer no pudo evaluar checkpoints. Crear el archivo
  o retirar la referencia.
- `R15` (`requirements.md`) y `design.md` §3.1 apuntan a nodos distintos
  para la clase `z-10` del logo — reconciliar redacción.
- `app/layout.tsx` conserva el metadata por defecto de "Create Next App"
  (fuera del alcance de esta feature).
- `vitest.config.ts` emite un warning de Vite por sintaxis ESM cargada como
  CommonJS — se resuelve con extensión `.mts` o `"type": "module"`.

Informes completos: `progress/impl_splash-section.md`,
`progress/review_splash-section.md`.

---

## 2026-08-31 — `kitchen-sketch-drawing` (`id: 2`) → `done`

**Feature:** Animación de dibujo de línea (line drawing) del boceto de
cocina en `HomeSection`, reemplazando la imagen estática
`/images/kitchen-draw.svg` (vía `next/image`) por un SVG inline animado
con Motion. Implementada directamente, sin flujo SDD completo (`sdd: false`
en `feature_list.json`, decisión explícita del usuario).

**Entregables:**

- `hooks/useDrawSequence.ts` — hook reutilizable que genera `Variants` de
  Motion (`container`/`stroke`) a partir de un número de paths y una
  duración total (`DEFAULT_DRAW_DURATION_MS = 4000`, ajustada por el
  usuario desde el valor inicial de 3000 ms); reparte el tiempo en partes
  iguales por path vía `staggerChildren === duración por trazo`, y colapsa
  a 0 ms con `prefers-reduced-motion`.
- `components/svg-drawing.tsx` — componente cliente genérico y reutilizable
  (`SvgDrawing`) que recibe `paths`, `viewBox`, `strokeWidth` y `title`, y
  anima cada `<motion.path>` con `pathLength` vía `whileInView`
  (`once: true`). Pensado para futuros bocetos: solo requiere un array de
  `d` y metadatos.
- `components/kitchen-sketch.tsx` — Server Component con los 19 `d` del
  boceto (`public/sketchs/kitchen-sketch.svg`), reordenados para dibujar
  estructura (paredes, mesada, isla) → gabinetes → detalles (grifo,
  banquetas), en vez del orden original del archivo.
- `components/home-section.tsx` — `section-right` ahora renderiza
  `<KitchenSketch />` en vez de la imagen estática.
- `tests/setup.ts` — se agregó un stub de `IntersectionObserver` (jsdom no
  lo implementa) con `triggerIntersection` exportado, siguiendo el mismo
  patrón que el polyfill existente de `matchMedia`/`setReducedMotion`.
- `tests/svg-drawing.test.tsx` (7 tests) y `tests/kitchen-sketch.test.tsx`
  (5 tests) — cobertura de orden de paths, duración total y por trazo,
  `aria-label`, `prefers-reduced-motion`, e importación exclusiva de
  `motion/react` (nunca `framer-motion`).
- `feature_list.json` — feature `id: 2` agregada y marcada `done`.

**Verificación:** `pnpm test` 33/33 (21 previos + 12 nuevos), `pnpm lint` 0
errores. Verificación manual vía el dev server ya corriendo del usuario
(`localhost:3000`): el HTML renderizado contiene los 19 `<path>` dentro de
`data-testid="svg-drawing"` con el `aria-label="Boceto de cocina"`
correcto; sin errores nuevos en los logs del dev server (los warnings de
`next/image` presentes son preexistentes, de otras imágenes).

**Nota:** no se verificó visualmente en navegador (captura de pantalla)
que la animación de trazo se vea y se sincronice correctamente al hacer
scroll — solo se confirmó el marcado estático server-rendered y el
comportamiento vía tests con `IntersectionObserver` simulado.

---

## 2026-08-31 — `sketch-sequence` (`id: 3`) → `done`

**Feature:** Transición orquestada entre `KitchenSketch` y `ClosetSketch` en
`section-right` de `HomeSection`: se dibuja la cocina, se sostiene 2 s, se
desdibuja en orden inverso al doble de velocidad, y se dibuja el placard,
que queda fijo. Se reinicia cada vez que la sección vuelve a entrar en el
viewport. Flujo SDD (`sdd: true`) con spec redactado y aprobado directamente
por el usuario (instrucción explícita tras salir de plan mode: "sin pasar
por todos los agentes, llevalo adelante vos"), implementado en la misma
sesión sin subagentes intermedios.

**Entregables:**

- `specs/sketch-sequence/{requirements,design,tasks}.md` — 13 requirements
  EARS (`R1`–`R13`), 9 tasks (`T1`–`T9`), todas `[x]`.
- `hooks/useDrawSequence.ts` — se agrega `resolveDrawTimings(pathCount, totalDurationMs)`,
  fuente única de verdad para derivar `strokeDurationMs`/`staggerMs` a partir
  de la duración TOTAL de un boceto (antes `durationMs` era tiempo por
  trazo); `DEFAULT_DRAW_DURATION_MS` pasa a 3000. Se agregan las variantes
  `erased` (mitad de duración, `staggerDirection: -1` para invertir el
  orden de desdibujado).
- `components/svg-drawing.tsx` — se extrae el tipo `Sketch`; nueva prop
  `animate?: "hidden" | "visible" | "erased"` para ser controlado
  externamente (si no se pasa, conserva el `whileInView`/`viewport once`
  original, así que los componentes sueltos no cambian su comportamiento).
- `components/sketch-sequence.tsx` (nuevo) — `SketchSequence`, máquina de
  estados `{index, phase}` orquestada con `setTimeout` (no
  `onAnimationComplete`/`AnimatePresence`: en jsdom `pathLength` de un
  `SVGPathElement` no resuelve, así que ese callback nunca dispara en
  tests). El reinicio por `useInView` (`motion/react`) se resuelve durante
  el render comparando contra el `inView` anterior guardado en estado — no
  en un efecto — porque `eslint-plugin-react-hooks` (`set-state-in-effect`,
  `refs`) rechaza tanto el `setState` síncrono en el cuerpo de un efecto
  como leer/escribir un ref durante el render. Con
  `prefers-reduced-motion` renderiza directo el último boceto, fijo, sin
  temporizadores.
- `components/kitchen-sketch.tsx` / `components/closet-sketch.tsx` — cada
  uno exporta su descriptor `Sketch` (`KITCHEN_SKETCH`/`CLOSET_SKETCH`),
  reutilizado por `SketchSequence` y por los componentes sueltos.
- `components/home-section.tsx` — `<SketchSequence sketches={[KITCHEN_SKETCH, CLOSET_SKETCH]} .../>`
  reemplaza el `KitchenSketch` fijo.
- Tests nuevos: `tests/useDrawSequence.test.ts` (7, hook y `resolveDrawTimings`),
  `tests/sketch-sequence.test.tsx` (10, orquestación con `vi.useFakeTimers()` +
  `triggerIntersection`), `tests/closet-sketch.test.tsx` (5, espejo de
  `kitchen-sketch.test.tsx`). `tests/svg-drawing.test.tsx` actualizado (2
  casos reescritos + 1 nuevo) para la nueva semántica de `durationMs`.

**Detalle no obvio de testing:** encadenar `setTimeout -> setState -> efecto
-> nuevo setTimeout` dentro de un único `vi.advanceTimersByTimeAsync()`
falla — el segundo timer se registra en un flush de React posterior al que
dispara el primero, después de que el reloj falso ya pasó su horario. Cada
ciclo completo de la máquina de estados necesita dos `advance()` secuenciales
(uno por cada `act()`), no uno combinado.

**Verificación:** `pnpm test` 56/56 (33 previos + 23 nuevos), `pnpm lint` 0
errores, `npx tsc --noEmit` limpio. Verificación visual real: se instaló
`playwright-core` en el scratchpad (sin descargar Chromium) y se condujo
Chrome del sistema contra el dev server ya corriendo del usuario
(`localhost:3000`) — capturas confirmaron cocina dibujada y sostenida →
desdibujado → placard dibujado y fijo, sin errores de consola. Capturas
descartadas tras la verificación (no forman parte del repo).

Informe de trazabilidad: `progress/impl_sketch-sequence.md`.
