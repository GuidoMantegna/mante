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

---

## 2026-08-31 — `splash-transition` (`id: 4`) → `done`

**Feature:** Transición tipo *doors* entre `SplashSection` y `HomeSection`:
el splash pasa de estar en el flujo del documento a ser un overlay `fixed`
que bloquea el scroll hasta la primera interacción del usuario (scroll,
click/touch o tecla de avance), momento en el que el logo se desvanece y el
fondo se separa en dos hojas revelando la Home para siempre (hasta
refrescar). `Navbar` permanece oculto hasta ese momento y `SketchSequence`
no arranca su dibujado mientras el splash sigue tapando la página. Flujo
SDD (`sdd: true`) con spec redactado en la misma sesión, sin pausar en la
puerta de aprobación humana (decisión explícita del usuario al iniciar:
"spec + implementación en una sola sesión").

**Entregables:**

- `specs/splash-transition/{requirements,design,tasks}.md` — 16 requirements
  EARS (`R1`–`R16`), 11 tasks (`T1`–`T11`), todas `[x]`.
- `components/splash-gate.tsx` (nuevo) — primer `useContext` del repo.
  `SplashGateContext` con default `{ revealed: true, reveal: noop }` (así
  cualquier consumidor sin `<SplashGateProvider>` — todos los tests
  preexistentes de `SketchSequence`/`Navbar` — se comporta como si no
  hubiera splash). `SplashGateProvider` registra listeners de
  `wheel`/`touchmove`/`pointerdown`/`scroll`/`keydown` (filtrado a
  `Space`/`Enter`/`PageDown`/`ArrowDown`) en `window`, todos con cleanup y
  desactivados apenas se revela; un segundo efecto separado hace toggle de
  la clase `splash-locked` en `document.documentElement`.
- `components/splash-backdrop.tsx` (nuevo) — las tres capas de imagen +
  crossfade extraídas de `SplashSection` para poder instanciarlas dos
  veces (una por hoja) sin duplicar JSX; la copia derecha se renderiza con
  `aria-hidden`.
- `components/splash-section.tsx` (modificado) — pasa de sección en flujo
  (`h-svh` como hermano de `HomeSection`) a overlay `fixed inset-0 z-50`.
  Dos hojas `motion.div` (`overflow-hidden`, contenido interno al 200% de
  ancho anclado al borde exterior, para reconstruir la imagen completa sin
  costura) que se separan con `translateX` al revelar. Logo + hint nuevo
  (`DESLIZÁ` + chevron animado, aparece a los 2 s de inactividad) en una
  capa sin partir que se desvanece antes de que las hojas se abran.
  Constantes exportadas (`SPLASH_LOGO_FADE_MS`, `SPLASH_DOOR_DELAY_MS`,
  `SPLASH_DOOR_DURATION_MS`, `SPLASH_HINT_DELAY_MS`) colapsan a `0` con
  `prefers-reduced-motion`.
- `components/splash-overlay.tsx` (nuevo) — desmonta `SplashSection` con
  un `setTimeout` (duración total de apertura de las hojas) tras revelar,
  en vez de `AnimatePresence` + `exit` (ver alternativa descartada abajo).
- `components/navbar.tsx` (modificado) — pasa a Client Component
  (`motion.nav`), entra animado (`opacity`/`y`, delay 0.5 s) recién al
  revelar; `useSplashGate()` para leer `revealed`.
- `components/sketch-sequence.tsx` (modificado) — cambio quirúrgico: el
  `inView` de `useInView` pasa a `active = revealed && inView`, usado en
  el mismo patrón de ajuste de estado durante el render que ya existía
  (documentado en `specs/sketch-sequence/design.md`). Con el default del
  context (`revealed: true`), comportamiento idéntico al de antes de esta
  feature.
- `app/layout.tsx` — envuelve `<Navbar/>` y `{children}` en
  `<SplashGateProvider>`, se mantiene Server Component. `app/page.tsx` —
  `<SplashSection/>` → `<SplashOverlay/>`. `app/globals.css` — regla
  `html.splash-locked, html.splash-locked body { overflow: hidden; }`.
- `tests/splash-section.test.tsx` (actualizado) — envuelto en
  `SplashGateProvider`, `getLayers()`/`getActiveSrcs()` escopeados a la
  hoja izquierda (ahora hay dos copias del fondo por el efecto *doors*).
  Los 22 requirements de `splash-section` no cambian de significado.
- `tests/splash-transition.test.tsx` (nuevo, 22 tests) — cubre R1–R16.

**Alternativa descartada documentada en `design.md`:** `AnimatePresence` +
prop `exit` en `SplashSection` para animar su salida. Se descartó porque
mezclar un `exit` estático con un `animate` reactivo a `revealed` (leído
por context durante el hold de salida de `AnimatePresence`) no es
determinista en jsdom, y el repo ya había descartado antes depender de
callbacks de fin de animación de Motion en tests (`specs/sketch-sequence/design.md`).
Se usó el mismo patrón de `setTimeout` que `SketchSequence`.

**Bug encontrado y corregido en verificación manual:** `Navbar` no
colapsaba su `delay`/`duration` con `prefers-reduced-motion`, dejando una
ventana de hasta 1 s con el navbar invisible justo después de que el
splash (ya instantáneo) desaparecía. Detectado con una captura de
Playwright en modo `reducedMotion: "reduce"`; corregido agregando
`useReducedMotion()` a `Navbar`. R10 se amplió para cubrir explícitamente
la entrada del navbar, no solo las hojas.

**Verificación:** `pnpm test` 77/77 (55 previos + 22 nuevos), `pnpm lint`
0 errores, `npx tsc --noEmit` limpio, `pnpm build` OK (Turbopack, 4 rutas
estáticas). Verificación visual con Playwright (Chromium headless recién
instalado, `pnpm dev` en `localhost:3000`), dos pasadas — con y sin
`prefers-reduced-motion` — confirmando: splash a pantalla completa con
hint, apertura de hojas en curso (captura intermedia), home revelada con
navbar y boceto dibujándose, splash sin reaparecer tras scroll adicional,
y (con reduced motion) desaparición instantánea con navbar visible de
inmediato tras la corrección del bug de arriba.

**Deuda no bloqueante:** hydration mismatch preexistente (no introducido
ni agravado en esta sesión) cuando el navegador real tiene
`prefers-reduced-motion` activado — `useReducedMotion()` de `motion/react`
no es SSR-safe en este proyecto; ya afectaba a `SplashSection` desde su
commit original (`223f7ac`) y a `SketchSequence`/`useDrawSequence`.
Corregirlo requiere un patrón de hidratación diferida transversal, fuera
del alcance de esta feature.

Informe de trazabilidad: `progress/impl_splash-transition.md`.

---

## Sesión — `splash-transition` (iteración 2: cortina)

**Feature:** id 4, `splash-transition`. Cambio de mecánica pedido sobre la
iteración anterior: en vez de partir el fondo del splash en dos hojas que
se separan, una **cortina opaca propia** se cierra sobre el splash —que
queda entero, sin dividirse— y al abrirse deja ver la `HomeSection`.

### Entregables

- `components/splash-gate.tsx` reescrito como máquina de fases
  `idle → closing → opening → done`, dueña de las tres duraciones
  (`SPLASH_CURTAIN_CLOSE_MS` 700, `HOLD` 250, `OPEN` 900) y de los dos
  booleanos derivados que consumen los demás componentes: `revealed`
  (el usuario disparó) y `homeVisible` (la home ya está a la vista).
- `components/splash-curtain.tsx` (nuevo): dos `motion.div` de
  `w-[calc(50%+1px)]` que animan solo `translateX`, dentro de un contenedor
  `fixed inset-0 z-50 overflow-hidden aria-hidden pointer-events-none`.
- `components/splash-section.tsx` revertido a un fondo único sin dividir
  (`z-40`), con el logo a plena opacidad: ya no anima nada al revelar,
  porque lo tapa la cortina.
- `components/splash-overlay.tsx` reescrito para componer splash + cortina
  según la fase, desmontando el splash al entrar en `opening` (cuando ya
  está completamente cubierto).
- `navbar.tsx` y `sketch-sequence.tsx` pasan de `revealed` a `homeVisible`.
- `app/globals.css`: token `--curtain-gold` + utilidad `bg-curtain`.

### Decisiones

- **Máquina de fases en vez de un booleano.** El efecto exige distinguir
  "el usuario disparó" de "la home ya se ve": son momentos separados por
  casi un segundo y hay consumidores atados a cada uno (el bloqueo de
  scroll y el splash al primero; navbar y `SketchSequence` al segundo).
- **Las duraciones viven en el gate, no en la cortina**, para que la
  dependencia sea de un solo sentido y no haya ciclo de imports.
- **`calc(50% + 1px)` por panel**: dos mitades exactas dejan una costura de
  subpíxel en viewports de ancho impar.
- Alternativas descartadas documentadas en `specs/splash-transition/design.md`
  (incluida la propia iteración 1, y una cortina de un solo panel).

### Verificación

`pnpm test` 78/78, `pnpm lint`, `npx tsc --noEmit` y `pnpm build` en verde.
Verificación manual en Chromium (Playwright) en modo normal y con
`prefers-reduced-motion: reduce`. Los dos riesgos visuales del cambio se
comprobaron con recortes ampliados en vez de a ojo: no hay costura en el
centro con la cortina cerrada, y la cortina (`z-50`) sí tapa al navbar
(`z-30`) pese al `backdrop-filter` de éste.

### Deuda registrada (no bloqueante)

- Hydration mismatch preexistente de `useReducedMotion()` (no SSR-safe) en
  todo el repo — confirmado anterior a esta feature.
- El amarillo de la cortina se eligió desde las capturas de referencia y no
  pertenece a la paleta documentada; queda aislado en un único token.

Detalle de trazabilidad `R<n>` → test en `progress/impl_splash-transition.md`.
