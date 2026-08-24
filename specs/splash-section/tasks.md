# Tasks — `splash-section`

> Ejecutar en orden. El `implementer` marca `[x]` al completar cada una.
> Cada task declara los `R<n>` de `requirements.md` que cubre.
> Recordatorio de `AGENTS.md` §4.5: antes de la primera task, crear la rama
> `specs/splash-section` desde la rama actual del working tree.

## Fase 0 — Infraestructura de test

- [x] **T1** — Añadir a `package.json` las devDependencies del runner declarado en `docs/architecture.md` (`vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`) e instalar con `pnpm install`. Cubre: habilitador de R1–R22.
- [x] **T2** — Añadir el script `"test": "vitest run"` a `package.json` y crear `vitest.config.ts` (`plugins: [react()]`, `environment: "jsdom"`, `globals: true`, `setupFiles: ["./tests/setup.ts"]`, alias `@` → raíz del repo). Cubre: habilitador de R1–R22.
- [x] **T3** — Crear `tests/setup.ts` con `import "@testing-library/jest-dom/vitest"` y un stub configurable de `window.matchMedia` (jsdom no lo implementa; `useReducedMotion` depende de él). Debe permitir fijar el valor de `matches` para `(prefers-reduced-motion: reduce)` por test. Cubre: habilitador de R11, R12.
- [x] **T4** — Verificar que `pnpm test` arranca en verde con la suite vacía y que `pnpm lint` sigue sin errores. Cubre: `docs/verification.md` §Verificación final.

## Fase 1 — Componente

- [x] **T5** — Crear `components/splash-section.tsx` con `"use client"`, las constantes exportadas `SPLASH_IMAGES`, `SPLASH_INTERVAL_MS` (3000) y `SPLASH_CROSSFADE_MS` (1200), y el esqueleto de `SplashSection` que renderiza la `<section data-testid="splash-section">` con las tres capas de fondo (`data-testid="splash-layer"`, `data-src`) y su `<Image>` de fondo. Cubre: R1, R6, R22.
- [x] **T6** — Añadir el estado `activeIndex` y el `useEffect` con `setInterval(..., SPLASH_INTERVAL_MS)` + `clearInterval` en el cleanup, y derivar el atributo `data-active` de `activeIndex`. Cubre: R2, R3, R4, R5, R7.
- [x] **T7** — Convertir las capas en `motion.div` importados de `motion/react`, con `initial={false}`, `animate={{ opacity: isActive ? 1 : 0 }}`, `transition={{ duration: crossfadeMs / 1000, ease: "easeInOut" }}` y `style={{ willChange: "opacity" }}`. Cubre: R8, R9, R10.
- [x] **T8** — Añadir `useReducedMotion()` de `motion/react`, derivar `crossfadeMs` (0 con movimiento reducido, `SPLASH_CROSSFADE_MS` sin él) y exponerlo en cada capa como `data-crossfade-ms`. Cubre: R11, R12.
- [x] **T9** — Añadir la capa del logo: wrapper `absolute inset-0 z-10 flex items-center justify-center pointer-events-none`, contenedor `data-testid="splash-logo-layer"` con `w-[88%] max-w-[1016px] md:w-[67%]`, e `<Image data-testid="splash-logo" src="/iso-logo-white.svg" alt="Manté" width={1016} height={280} priority unoptimized className="h-auto w-full object-contain" />`. Cubre: R13, R14, R15, R16, R17.
- [x] **T10** — Fijar las clases de la sección raíz: `relative h-svh w-full shrink-0 overflow-hidden` (sin `w-screen`). Cubre: R18, R19, R20, R21.
- [x] **T11** — Reemplazar el contenido de `app/page.tsx` por el render de `<SplashSection />`, manteniendo la página como Server Component (sin `"use client"`). Eliminar el boilerplate de create-next-app. Cubre: integración de R1–R22.

## Fase 2 — Tests

Todos en `tests/splash-section.test.tsx` (un archivo por componente,
`docs/conventions.md` §Tests). Usar `vi.useFakeTimers()` en `beforeEach` y
`vi.useRealTimers()` en `afterEach`; envolver los avances en `act()`.

- [x] **T12** — Test "renderiza las tres capas de fondo en el orden canónico": `getAllByTestId("splash-layer")` tiene longitud 3 y sus `data-src` son `/images/splash-1.webp`, `-2`, `-3`. Cubre: R1.
- [x] **T13** — Test "cada capa contiene la imagen de su `data-src`": para cada capa, el `<img>` interno tiene un `src` que, decodificado, contiene el valor de `data-src`. Cubre: R6.
- [x] **T14** — Test "la primera capa activa es splash-1": en el primer render solo la capa 0 tiene `data-active="true"`. Cubre: R2.
- [x] **T15** — Test "no cambia la capa activa antes de 3000 ms": avanzar 2999 ms y comprobar que sigue activa la capa 0. Cubre: R5.
- [x] **T16** — Test "avanza a la siguiente capa cada 3000 ms": avanzar 3000 ms → capa 1 activa; avanzar otros 3000 ms → capa 2 activa. Cubre: R3.
- [x] **T17** — Test "vuelve a la primera capa tras la última (loop)": avanzar 9000 ms desde el montaje → capa 0 activa de nuevo. Cubre: R4.
- [x] **T18** — Test "cancela el temporizador al desmontar": tras `unmount()`, `vi.getTimerCount()` es 0. Cubre: R7.
- [x] **T19** — Test "la capa activa tiene opacidad 1 y las demás 0": en el render inicial, `toHaveStyle({ opacity: "1" })` en la capa 0 y `{ opacity: "0" }` en las capas 1 y 2. Cubre: R8.
- [x] **T20** — Test "la animación viene de motion/react": leer `components/splash-section.tsx` con `node:fs` y afirmar que el contenido incluye `from "motion/react"`. Cubre: R9.
- [x] **T21** — Test "no se importa framer-motion": misma lectura del archivo, afirmar que **no** contiene `framer-motion`. Cubre: R10.
- [x] **T22** — Test "sin movimiento reducido el crossfade dura más de 0 ms": `matchMedia` con `matches: false`, render, y `Number(layer.dataset.crossfadeMs) > 0` en las tres capas. Cubre: R11.
- [x] **T23** — Test "con movimiento reducido el crossfade dura 0 ms": `matchMedia` con `matches: true` para `(prefers-reduced-motion: reduce)`, render, y `data-crossfade-ms === "0"` en las tres capas. Cubre: R12.
- [x] **T24** — Test "renderiza el logo iso-logo-white": el `<img>` `data-testid="splash-logo"` tiene un `src` que decodificado contiene `/iso-logo-white.svg`. Cubre: R13.
- [x] **T25** — Test "el logo expone el texto alternativo Manté": `getByAltText("Manté")` existe y es el mismo nodo que `splash-logo`. Cubre: R14.
- [x] **T26** — Test "el logo se apila por encima del fondo": el wrapper del logo declara la clase `z-10`. Cubre: R15.
- [x] **T27** — Test "el logo es responsivo según los frames de Figma": `splash-logo-layer` declara `w-[88%]`, `md:w-[67%]` y `max-w-[1016px]`. Cubre: R16.
- [x] **T28** — Test "el logo no se recorta": el `<img>` del logo declara `object-contain`. Cubre: R17.
- [x] **T29** — Test "la sección ocupa el alto del viewport": `splash-section` declara `h-svh`. Cubre: R18.
- [x] **T30** — Test "la sección ocupa el ancho disponible sin provocar scroll horizontal": `splash-section` declara `w-full` y **no** declara `w-screen`. Cubre: R19, R20.
- [x] **T31** — Test "la sección recorta el desbordamiento": `splash-section` declara `overflow-hidden`. Cubre: R21.
- [x] **T32** — Test "el fondo cubre la sección": el `<img>` de cada capa declara `object-cover`. Cubre: R22.

## Fase 3 — Cierre

- [x] **T33** — Escribir `progress/impl_splash-section.md` con el mapa de trazabilidad `R1..R22 → tests/splash-section.test.tsx › "<nombre del test>"`, según `docs/verification.md` §Nivel 3.
- [x] **T34** — Ejecutar `pnpm test` (0 fallos) y `pnpm lint` (0 errores). Verificar visualmente en `pnpm dev` a 402 px, 768 px y 1512 px que no hay scroll horizontal y que el logo no se recorta. Cubre: verificación final de AC1–AC4.
  > Nota del implementer: la parte ejecutable está cumplida y evidenciada
  > (`pnpm test` 21/21, `pnpm lint` 0 errores, `npx tsc --noEmit` limpio,
  > `pnpm build` OK). La **verificación visual en `pnpm dev` a 402/768/1512 px
  > queda PENDIENTE de humano**: esta sesión no tiene navegador. Detalle en
  > `progress/impl_splash-section.md` §5.
- [x] **T35** — Confirmar el supuesto §1.2.2 del `design.md` (breakpoint tablet `md` = 768 px) con el humano antes de marcar la feature como `done`.
  > Confirmado por el humano ("visual OK") el 2026-08-24, incluyendo la
  > verificación visual de T34 a 402/768/1512 px.

---

## Nota sobre Motion+

Al consultar el codex de Motion aparecieron ejemplos cuyo **código fuente no
está disponible en esta sesión** porque son contenido Motion+ y este editor no
está autenticado contra el servidor MCP `motion-plus`. Se listan por
transparencia; ninguno era necesario para este diseño, que se apoya solo en
documentación pública:

- **Toast: Stacked notifications** (AnimatePresence, motion, animate, whileHover, whileTap) — https://examples.motion.dev/react/toast-stack
- **iOS App Folder** (AnimatePresence, motion, MotionConfig, animate, layoutId) — https://examples.motion.dev/react/ios-app-folder
- **Base UI: Toast** (AnimatePresence, motion, animate, drag) — https://examples.motion.dev/react/base-toast
- **Radix: Toast** (AnimatePresence, motion, animate, drag) — https://examples.motion.dev/react/radix-toast

Las páginas de demo son públicas. El código fuente es un beneficio de Motion+
(https://motion.dev/plus, pago único, no suscripción) y llega a través del
servidor MCP `motion-plus`, al que hay que iniciar sesión desde los ajustes MCP
del editor.
