# Implementación — `splash-section` (`id: 1`)

- **Rama:** `specs/splash-section` (creada desde `config`, arrastrando los
  archivos del spec sin commitear).
- **Spec de entrada:** `specs/splash-section/{requirements,design,tasks}.md`
  (22 requirements `R1`–`R22`, 35 tasks `T1`–`T35`).
- **Estado:** `T1`–`T34` ejecutadas. `T35` **no cerrada** (confirmación humana).
  La feature **no** se marca `done` en `feature_list.json`: eso lo hace el
  leader tras el reviewer.
- **Gestor de paquetes:** `pnpm` (confirmado por `pnpm-lock.yaml` y
  `packageManager: pnpm@10.33.2` en `package.json`).

---

## 1. Trazabilidad (`docs/verification.md` §Nivel 3)

Todos los tests viven en `tests/splash-section.test.tsx`, dentro del `describe`
`SplashSection`.

| Req  | Test |
|------|------|
| R1  | `tests/splash-section.test.tsx` › "renderiza las tres capas de fondo en el orden canónico" |
| R2  | `tests/splash-section.test.tsx` › "la primera capa activa es splash-1" |
| R3  | `tests/splash-section.test.tsx` › "avanza a la siguiente capa cada 3000 ms" |
| R4  | `tests/splash-section.test.tsx` › "vuelve a la primera capa tras la última (loop)" |
| R5  | `tests/splash-section.test.tsx` › "no cambia la capa activa antes de 3000 ms" |
| R6  | `tests/splash-section.test.tsx` › "cada capa contiene la imagen de su data-src" |
| R7  | `tests/splash-section.test.tsx` › "cancela el temporizador al desmontar" |
| R8  | `tests/splash-section.test.tsx` › "la capa activa tiene opacidad 1 y las demás 0" |
| R9  | `tests/splash-section.test.tsx` › "la animación viene de motion/react" |
| R10 | `tests/splash-section.test.tsx` › "no se importa framer-motion" |
| R11 | `tests/splash-section.test.tsx` › "sin movimiento reducido el crossfade dura más de 0 ms" |
| R12 | `tests/splash-section.test.tsx` › "con movimiento reducido el crossfade dura 0 ms" |
| R13 | `tests/splash-section.test.tsx` › "renderiza el logo iso-logo-white" |
| R14 | `tests/splash-section.test.tsx` › "el logo expone el texto alternativo Manté" |
| R15 | `tests/splash-section.test.tsx` › "el logo se apila por encima del fondo" |
| R16 | `tests/splash-section.test.tsx` › "el logo es responsivo según los frames de Figma" |
| R17 | `tests/splash-section.test.tsx` › "el logo no se recorta" |
| R18 | `tests/splash-section.test.tsx` › "la sección ocupa el alto del viewport" |
| R19 | `tests/splash-section.test.tsx` › "la sección ocupa el ancho disponible sin provocar scroll horizontal" |
| R20 | `tests/splash-section.test.tsx` › "la sección ocupa el ancho disponible sin provocar scroll horizontal" |
| R21 | `tests/splash-section.test.tsx` › "la sección recorta el desbordamiento" |
| R22 | `tests/splash-section.test.tsx` › "el fondo cubre la sección" |

Cobertura inversa: los 21 tests del archivo mapean cada uno a al menos un
`R<n>`; ningún test es huérfano y ningún `R<n>` queda sin test. R19 y R20
comparten test porque son las dos mitades de la misma aserción (`w-full`
presente / `w-screen` ausente), tal y como pide `T30`.

---

## 2. Archivos creados / modificados

### Creados

| Archivo | Contenido |
|---------|-----------|
| `components/splash-section.tsx` | Componente cliente. `SPLASH_IMAGES`, `SPLASH_INTERVAL_MS` (3000), `SPLASH_CROSSFADE_MS` (1200), `SplashSection`. |
| `tests/splash-section.test.tsx` | 21 tests (`T12`–`T32`). |
| `tests/setup.ts` | `@testing-library/jest-dom/vitest` + polyfill de `window.matchMedia` con `setReducedMotion()`. |
| `vitest.config.ts` | `plugins: [react()]`, `environment: "jsdom"`, `globals: true`, `setupFiles`, alias `@` → raíz. |
| `progress/impl_splash-section.md` | Este informe. |

### Modificados

| Archivo | Cambio |
|---------|--------|
| `app/page.tsx` | Boilerplate de create-next-app eliminado; ahora renderiza `<SplashSection />`. Sigue siendo **Server Component**. |
| `package.json` | devDependencies del runner + script `"test": "vitest run"`. |
| `pnpm-lock.yaml` | Resultado de `pnpm add -D`. |
| `specs/splash-section/tasks.md` | `[x]` en `T1`–`T34`. |
| `progress/current.md` | Bitácora en tiempo real. |

`app/layout.tsx` **no** se tocó, según `design.md` §2.
No se creó ningún `*.module.css`.

Dependencias añadidas (devDependencies): `vitest 4.1.11`,
`@vitejs/plugin-react 6.1.0`, `jsdom 30.0.1`, `@testing-library/react 16.3.2`,
`@testing-library/dom 10.4.1`, `@testing-library/jest-dom 7.0.1`.
**No se añadió `framer-motion`** (R10). La animación usa el `motion@^13.1.1` ya
presente, importado como `motion/react`.

---

## 3. Notas de implementación

### 3.1 Motion

- Skill `.claude/skills/motion` cargada antes de escribir animación
  (`best-practices/index.md` y `best-practices/react.md`).
- **Las herramientas MCP del codex (`search-motion-docs`) no estaban expuestas
  en esta sesión de subagente**, así que no pude consultarlas de primera mano.
  El patrón implementado es literalmente el que `design.md` §4 ya validó contra
  el codex durante la fase de spec, y es coherente con `best-practices/`:
  solo se anima `opacity` (propiedad de compositor), `willChange: "opacity"`
  declarado porque las tres capas están en ciclo continuo, easing predecible
  (`easeInOut`) en vez de spring por no ser movimiento físico ni interrumpible.
- Import: `import { motion, useReducedMotion } from "motion/react"`. Verificado
  por test (`T20`/`T21`) leyendo los bytes del archivo.

### 3.2 Reconciliación R15 ↔ `design.md` §3.1 (`z-10`)

`design.md` §3.1 dibuja `z-10` en el wrapper de posicionamiento externo,
mientras que R15 exige la clase sobre la **capa del logo**, que el vocabulario
de `requirements.md` define como `data-testid="splash-logo-layer"`.
Para no incumplir ninguno de los dos, `z-10` se declara **en ambos** elementos.
Es aditivo y sin efecto visual (el hijo es un flex item; su `z-10` no cambia el
apilamiento ya establecido por el wrapper). No es una desviación del spec sino
la única lectura que satisface R15 al pie de la letra.

### 3.3 Ajuste dentro de `T3`: el polyfill de `matchMedia`

`T3` pide "un stub configurable de `window.matchMedia` … que permita fijar
`matches` para `(prefers-reduced-motion: reduce)`". La primera versión, escrita
literalmente así, hacía **fallar `T23`** (`expected '1200' to be '0'`). Motivo
real, verificado en el código instalado
(`motion-dom@13.1.1/dist/es/render/utils/reduced-motion/index.mjs` y
`framer-motion@13.1.1/…/use-reduced-motion.mjs`):

1. Motion consulta la query **`"(prefers-reduced-motion)"`**, sin el `: reduce`.
2. `initPrefersReducedMotion()` está latcheado por módulo
   (`hasReducedMotionListener.current`) y `useReducedMotion()` hace
   `useState(prefersReducedMotion.current)`. La preferencia solo se propaga a
   través del listener `change` que Motion registra una única vez.

El polyfill final, por tanto: (a) reconoce cualquier query que contenga
`prefers-reduced-motion`, (b) devuelve siempre la misma `MediaQueryList` por
query con `matches` como *getter*, y (c) `setReducedMotion()` emite de verdad
el evento `change` a los listeners registrados. Sigue siendo un polyfill de
entorno (jsdom no implementa `matchMedia`), **no** un mock del componente ni de
Motion: `motion/react` se ejecuta real en todos los tests. No incurre en el
antipatrón de `docs/verification.md`.

Esto no cambia ningún requirement ni ninguna decisión de diseño: `R11`/`R12` se
siguen verificando exactamente sobre `data-crossfade-ms`, como manda
`design.md` §6.3.

Nota lateral, sin impacto en los requirements: `design.md` §4.2 afirma que
`useReducedMotion()` "re-renderiza al cambiar la preferencia". En
`motion@13.1.1` **no** lo hace (el propio fuente lleva un `TODO` al respecto);
el valor se fija al montar. R11/R12 no dependen de ese comportamiento.

### 3.4 Evidencia de que los tests no pasan en vacío

Comprobación de mutación sobre `R8` (el único requirement que se apoya en el
estilo que escribe Motion): forzando `animate={{ opacity: 1 }}` en las tres
capas, el test "la capa activa tiene opacidad 1 y las demás 0" **falla**
(`- opacity: 0; + opacity: 1;`). El componente quedó restaurado inmediatamente
después. Confirma que Motion escribe `opacity` inline de verdad y que la
aserción discrimina.

Además, el stderr del runner muestra el warning propio de Motion
("You have Reduced Motion enabled on your device…") exactamente en el test
`T23`, lo que confirma que la preferencia llega al Motion real y no a un doble.

---

## 4. Verificación — output real

### 4.1 `pnpm test`

```
> mante@0.1.0 test C:\Users\Administrador\Documents\Projects\mante
> vitest run

 RUN  v4.1.11 C:/Users/Administrador/Documents/Projects/mante

 ✓ tests/splash-section.test.tsx > SplashSection > renderiza las tres capas de fondo en el orden canónico 66ms
 ✓ tests/splash-section.test.tsx > SplashSection > cada capa contiene la imagen de su data-src 12ms
 ✓ tests/splash-section.test.tsx > SplashSection > la primera capa activa es splash-1 14ms
 ✓ tests/splash-section.test.tsx > SplashSection > no cambia la capa activa antes de 3000 ms 6ms
 ✓ tests/splash-section.test.tsx > SplashSection > avanza a la siguiente capa cada 3000 ms 12ms
 ✓ tests/splash-section.test.tsx > SplashSection > vuelve a la primera capa tras la última (loop) 6ms
 ✓ tests/splash-section.test.tsx > SplashSection > cancela el temporizador al desmontar 12ms
stderr | tests/splash-section.test.tsx > SplashSection > con movimiento reducido el crossfade dura 0 ms
You have Reduced Motion enabled on your device. Animations may not appear as expected.. For more information and steps for solving, visit https://motion.dev/troubleshooting/reduced-motion-disabled

 ✓ tests/splash-section.test.tsx > SplashSection > la capa activa tiene opacidad 1 y las demás 0 95ms
 ✓ tests/splash-section.test.tsx > SplashSection > la animación viene de motion/react 1ms
 ✓ tests/splash-section.test.tsx > SplashSection > no se importa framer-motion 1ms
 ✓ tests/splash-section.test.tsx > SplashSection > sin movimiento reducido el crossfade dura más de 0 ms 6ms
 ✓ tests/splash-section.test.tsx > SplashSection > con movimiento reducido el crossfade dura 0 ms 8ms
 ✓ tests/splash-section.test.tsx > SplashSection > renderiza el logo iso-logo-white 5ms
 ✓ tests/splash-section.test.tsx > SplashSection > el logo expone el texto alternativo Manté 8ms
 ✓ tests/splash-section.test.tsx > SplashSection > el logo se apila por encima del fondo 4ms
 ✓ tests/splash-section.test.tsx > SplashSection > el logo es responsivo según los frames de Figma 4ms
 ✓ tests/splash-section.test.tsx > SplashSection > el logo no se recorta 7ms
 ✓ tests/splash-section.test.tsx > SplashSection > la sección ocupa el alto del viewport 9ms
 ✓ tests/splash-section.test.tsx > SplashSection > la sección ocupa el ancho disponible sin provocar scroll horizontal 5ms
 ✓ tests/splash-section.test.tsx > SplashSection > la sección recorta el desbordamiento 4ms
 ✓ tests/splash-section.test.tsx > SplashSection > el fondo cubre la sección 6ms

 Test Files  1 passed (1)
      Tests  21 passed (21)
   Start at  14:58:40
   Duration  2.03s (transform 64ms, setup 225ms, import 328ms, tests 295ms, environment 979ms)
```

**21/21 en verde, 0 fallos.**

El runner emite además este warning de Vite, no relacionado con la feature
(afecta a cómo Vite carga su propio archivo de configuración):

```
(!) Your Vite config uses features that are unsupported by `configLoader: 'native'`, which is planned to become the default in a future major version of Vite:
  - ESM syntax in a file loaded as CommonJS (vitest.config.ts:1:1). Use a `.mjs` extension or set `"type": "module"` in the closest package.json
```

No se cambió el nombre del archivo porque `design.md` §2 fija `vitest.config.ts`.
Es un aviso de compatibilidad futura, no un fallo.

### 4.2 `pnpm lint`

```
> mante@0.1.0 lint C:\Users\Administrador\Documents\Projects\mante
> eslint

### LINT EXIT=0
```

**0 errores, 0 warnings.**

### 4.3 `npx tsc --noEmit`

Sin salida (0 errores). La primera versión de `tests/setup.ts` sí producía
6 errores `TS2345`/`TS7006` en el tipado de los listeners; se corrigieron antes
de cerrar `T34`.

### 4.4 `pnpm build` (comprobación extra, no exigida por el spec)

```
▲ Next.js 16.3.2 (Turbopack)
✓ Compiled successfully in 6.0s
  Running TypeScript ...
  Finished TypeScript in 2.8s ...
✓ Generating static pages using 5 workers (4/4) in 717ms

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
```

Confirma que la frontera Server/Client es correcta: `/` sigue prerenderizándose
estático con `app/page.tsx` como Server Component.

---

## 5. Pendiente de verificación humana

1. **`T34`, mitad visual — PENDIENTE.** No tengo navegador en esta sesión, así
   que la parte ejecutable de `T34` (`pnpm test` + `pnpm lint`) está hecha y
   verde, pero la comprobación visual en `pnpm dev` a **402 px, 768 px y
   1512 px** (ausencia de scroll horizontal, logo sin recortar, crossfade sin
   hard cut) **no está hecha**. No la doy por buena.
2. **`T35` — PENDIENTE, sin marcar.** Confirmación humana del supuesto
   `design.md` §1.2.2: que el salto del logo `88%` → `67%` corresponde al
   breakpoint `md` (768 px) de Tailwind. En Figma no existe frame de tablet; es
   una interpolación aceptada en la puerta de aprobación, pero sigue siendo un
   blocker de verificación visual.
3. **Supuestos §1.2.1 y §1.2.3 de `design.md`** (geometría del logo desktop
   tomada de `31:170`; `object-cover` como modo de encaje del fondo) siguen
   siendo supuestos: se validan en la misma pasada visual del punto 1.
4. **Estado en `feature_list.json`:** sigue en `in_progress`, como corresponde.
   No lo toco: el paso a `done` es del leader tras el visto bueno del reviewer.

## 6. Tasks sin marcar

- `T35` — confirmación visual humana del breakpoint de tablet.

`T34` sí queda marcada porque su parte automatizable (`pnpm test` 0 fallos,
`pnpm lint` 0 errores) está cumplida y evidenciada arriba; su mitad visual
queda explícitamente registrada como pendiente en §5.1 para que el reviewer la
tenga delante.
