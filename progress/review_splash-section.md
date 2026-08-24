# Review — feature 1 `splash-section`

**Veredicto:** APROBADO (APPROVED)

- **Rama revisada:** `specs/splash-section` (creada desde `config`).
- **Revisor:** agente `reviewer`. No edito código: solo apruebo o rechazo.
- **Alcance:** `components/splash-section.tsx`, `app/page.tsx`,
  `tests/splash-section.test.tsx`, `tests/setup.ts`, `vitest.config.ts`,
  `package.json`, `specs/splash-section/*`, `progress/impl_splash-section.md`.
- La feature **sigue en `in_progress`** en `feature_list.json`. No la toco:
  el paso a `done` es del leader.

---

## 1. Verificación ejecutada por mí (output real, reproducido)

### 1.1 `pnpm test`

```
> mante@0.1.0 test C:\Users\Administrador\Documents\Projects\mante
> vitest run

 RUN  v4.1.11 C:/Users/Administrador/Documents/Projects/mante

 ✓ tests/splash-section.test.tsx > SplashSection > renderiza las tres capas de fondo en el orden canónico 57ms
 ✓ tests/splash-section.test.tsx > SplashSection > cada capa contiene la imagen de su data-src 15ms
 ✓ tests/splash-section.test.tsx > SplashSection > la primera capa activa es splash-1 9ms
 ✓ tests/splash-section.test.tsx > SplashSection > no cambia la capa activa antes de 3000 ms 8ms
 ✓ tests/splash-section.test.tsx > SplashSection > avanza a la siguiente capa cada 3000 ms 25ms
 ✓ tests/splash-section.test.tsx > SplashSection > vuelve a la primera capa tras la última (loop) 6ms
 ✓ tests/splash-section.test.tsx > SplashSection > cancela el temporizador al desmontar 6ms
stderr | tests/splash-section.test.tsx > SplashSection > con movimiento reducido el crossfade dura 0 ms
You have Reduced Motion enabled on your device. Animations may not appear as expected.. For more information and steps for solving, visit https://motion.dev/troubleshooting/reduced-motion-disabled

 ✓ tests/splash-section.test.tsx > SplashSection > la capa activa tiene opacidad 1 y las demás 0 106ms
 ✓ tests/splash-section.test.tsx > SplashSection > la animación viene de motion/react 1ms
 ✓ tests/splash-section.test.tsx > SplashSection > no se importa framer-motion 1ms
 ✓ tests/splash-section.test.tsx > SplashSection > sin movimiento reducido el crossfade dura más de 0 ms 10ms
 ✓ tests/splash-section.test.tsx > SplashSection > con movimiento reducido el crossfade dura 0 ms 8ms
 ✓ tests/splash-section.test.tsx > SplashSection > renderiza el logo iso-logo-white 5ms
 ✓ tests/splash-section.test.tsx > SplashSection > el logo expone el texto alternativo Manté 5ms
 ✓ tests/splash-section.test.tsx > SplashSection > el logo se apila por encima del fondo 7ms
 ✓ tests/splash-section.test.tsx > SplashSection > el logo es responsivo según los frames de Figma 4ms
 ✓ tests/splash-section.test.tsx > SplashSection > el logo no se recorta 5ms
 ✓ tests/splash-section.test.tsx > SplashSection > la sección ocupa el alto del viewport 4ms
 ✓ tests/splash-section.test.tsx > SplashSection > la sección ocupa el ancho disponible sin provocar scroll horizontal 4ms
 ✓ tests/splash-section.test.tsx > SplashSection > la sección recorta el desbordamiento 5ms
 ✓ tests/splash-section.test.tsx > SplashSection > el fondo cubre la sección 11ms

 Test Files  1 passed (1)
      Tests  21 passed (21)
   Start at  15:03:24
   Duration  2.00s
```

**21/21 en verde, 0 fallos.** Reproduce el resultado del implementer.

Único ruido, no relacionado con la feature (Vite cargando su propio config):

```
(!) Your Vite config uses features that are unsupported by `configLoader: 'native'` ...
  - ESM syntax in a file loaded as CommonJS (vitest.config.ts:1:1).
```

### 1.2 `pnpm lint`

```
> mante@0.1.0 lint C:\Users\Administrador\Documents\Projects\mante
> eslint

### LINT EXIT=0
```

**0 errores, 0 warnings.**

### 1.3 `npx tsc --noEmit`

```
### TSC EXIT=0
```

Sin salida, 0 errores.

---

## 2. Trazabilidad requirements ↔ tests

Cada entrada verificada abriendo `tests/splash-section.test.tsx` y leyendo la
aserción, no aceptando la tabla del implementer.

- R1: [x] "renderiza las tres capas de fondo en el orden canónico" — `toHaveLength(3)` + `toEqual` de los tres `data-src` (líneas 54-65).
- R2: [x] "la primera capa activa es splash-1" — `getActiveSrcs()` (filtra `data-active === "true"`) `toEqual(["/images/splash-1.webp"])`, lo que además prueba unicidad (líneas 80-84).
- R3: [x] "avanza a la siguiente capa cada 3000 ms" — dos avances de 3000 ms → splash-2 y splash-3 (líneas 96-104).
- R4: [x] "vuelve a la primera capa tras la última (loop)" — 9000 ms → splash-1 (líneas 107-113).
- R5: [x] "no cambia la capa activa antes de 3000 ms" — `advance(2999)` y sigue splash-1 (líneas 87-93).
- R6: [x] "cada capa contiene la imagen de su data-src" — el `img` interno existe y su `src` decodificado contiene el `data-src` de su capa (líneas 68-77). No trivial: el `src` real es `/_next/image?url=%2Fimages%2F...`.
- R7: [x] "cancela el temporizador al desmontar" — `getTimerCount()` mayor que 0 antes y `=== 0` tras `unmount()` (líneas 116-124). La aserción previa evita el falso positivo de "nunca hubo timer".
- R8: [x] "la capa activa tiene opacidad 1 y las demás 0" — `toHaveStyle` sobre el estilo inline (líneas 127-135). No es un assert vacío: el componente solo declara `style={{ willChange: "opacity" }}`; la `opacity` inline la escribe el Motion real vía `animate` + `initial={false}`.
- R9: [x] "la animación viene de motion/react" — lectura de bytes con `node:fs` y `toContain('from "motion/react"')` (líneas 138-140).
- R10: [x] "no se importa framer-motion" — misma lectura, `not.toContain("framer-motion")` (líneas 143-145).
- R11: [x] "sin movimiento reducido el crossfade dura más de 0 ms" — `setReducedMotion(false)` y `Number(dataset.crossfadeMs)` mayor que 0 en las 3 capas (líneas 148-156).
- R12: [x] "con movimiento reducido el crossfade dura 0 ms" — `setReducedMotion(true)` y `dataset.crossfadeMs === "0"` en las 3 capas (líneas 159-167).
- R13: [x] "renderiza el logo iso-logo-white" — `src` decodificado contiene `/iso-logo-white.svg` (líneas 170-176).
- R14: [x] "el logo expone el texto alternativo Manté" — `getByAltText("Manté")` es el mismo nodo que `splash-logo` (líneas 179-183).
- R15: [x] "el logo se apila por encima del fondo" — `splash-logo-layer` tiene `z-10` (líneas 186-190). Ver §5.1.
- R16: [x] "el logo es responsivo según los frames de Figma" — `w-[88%]`, `md:w-[67%]`, `max-w-[1016px]` (líneas 193-201).
- R17: [x] "el logo no se recorta" — `object-contain` en el img del logo (líneas 204-208).
- R18: [x] "la sección ocupa el alto del viewport" — `h-svh` (líneas 211-215).
- R19: [x] "la sección ocupa el ancho disponible sin provocar scroll horizontal" — `toHaveClass("w-full")` (líneas 218-225).
- R20: [x] mismo test — `not.toHaveClass("w-screen")` (línea 224). Compartir test con R19 es lo que pide T30.
- R21: [x] "la sección recorta el desbordamiento" — `overflow-hidden` (líneas 228-232).
- R22: [x] "el fondo cubre la sección" — `object-cover` en el img de cada capa (líneas 235-241).

**22/22 requirements con test real. Ningún R huérfano. Ningún test vacío ni con
assert trivial.** Cobertura inversa: los 21 tests mapean todos a algún R; no hay
test huérfano.

Nota metodológica aceptada: R16–R22 se verifican sobre **clases declaradas**
(`toHaveClass`), no sobre píxeles. Es la estrategia que `design.md` §6.4
justifica (jsdom no calcula layout) y que pasó la puerta de aprobación humana,
no una laxitud introducida por el implementer. Su contrapartida es la
verificación visual de §6.

---

## 3. Tasks

- T1: [x] `vitest 4.1.11`, `@vitejs/plugin-react 6.1.0`, `jsdom 30.0.1`, `@testing-library/{react,dom,jest-dom}` presentes en devDependencies.
- T2: [x] script `"test": "vitest run"` + `vitest.config.ts` con `plugins:[react()]`, jsdom, globals, setupFiles, alias `@` → raíz.
- T3: [x] `tests/setup.ts` con `jest-dom/vitest` + polyfill configurable de `matchMedia`. Ampliación revisada en §5.2.
- T4: [x] verificado por mí en §1.
- T5: [x] `components/splash-section.tsx:7-15,32-58`.
- T6: [x] `useState` + `setInterval`/`clearInterval` con updater funcional y deps `[]` (`splash-section.tsx:18,22-29`); `data-active` derivado (línea 41).
- T7: [x] `motion.div` con `initial={false}`, `animate`, `transition`, `willChange` (líneas 37-47).
- T8: [x] `useReducedMotion()` → `crossfadeMs` → `data-crossfade-ms` (líneas 19-20, 42).
- T9: [x] wrapper + `splash-logo-layer` + Image del logo (líneas 60-75).
- T10: [x] `relative h-svh w-full shrink-0 overflow-hidden`, sin `w-screen` (línea 34).
- T11: [x] `app/page.tsx` son 5 líneas: importa y renderiza `SplashSection`. Sin `"use client"` → sigue Server Component. Boilerplate de create-next-app eliminado.
- T12–T32: [x] los 21 tests existen, están comentados con su T/R y pasan (§1.1, §2).
- T33: [x] `progress/impl_splash-section.md` con el mapa exigido por `docs/verification.md` §Nivel 3.
- T34: [x] con salvedad **aceptada**: la mitad ejecutable está cumplida y la reproduje yo (§1). La mitad visual (`pnpm dev` a 402/768/1512 px) **no está hecha** y está documentada como pendiente en `progress/impl_splash-section.md` §5.1 y §6 y en una nota inline de `tasks.md`. El protocolo admite `[x]` con justificación documentada; la hay, es explícita y no se autoproclama verde. No es motivo de rechazo, **sí es una acción abierta para el humano antes de `done`** (§9).
- T35: [ ] **correcto que siga sin marcar.** Es confirmación visual humana del breakpoint `md` = 768 px (`design.md` §1.2.2); el implementer no puede cerrarla. No es defecto.

---

## 4. Regla crítica de animación — `motion/react`, cero `framer-motion`

`grep -rn "framer-motion"` sobre **todo el repo**:

- `components/splash-section.tsx:3` → `import { motion, useReducedMotion } from "motion/react"`. **Cero ocurrencias de framer-motion en el código.**
- `package.json` → `"motion": "^13.1.1"` en dependencies. **framer-motion NO aparece.**
- Ocurrencias restantes, todas legítimas: el test que prohíbe el import (`tests/splash-section.test.tsx:143-144`), los textos de spec/progreso que enuncian la regla, y `.claude/skills/motion/**` (la propia regla).
- `pnpm-lock.yaml:1514, 4151, 4637`: `framer-motion@13.1.1` aparece como **dependencia transitiva del propio paquete `motion@13.1.1`** (`motion@13.1.1 → dependencies: framer-motion 13.1.1`). Es la estructura interna upstream de Motion, no una dependencia declarada por este proyecto ni un import del código. **No es un hallazgo accionable**: no se puede eliminar sin quitar `motion`, y la regla del skill (nunca importar de framer-motion) se cumple.

**Veredicto de la regla crítica: CUMPLIDA.**

### 4.1 Revisión de la animación

No pude lanzar el subagente `motion-reviewer` (esta sesión de reviewer no expone
la herramienta de subagentes). Revisé la animación yo contra
`.claude/skills/motion/best-practices/{index,react}.md`:

- Import desde `motion/react` en archivo `"use client"` — OK (`react.md` §Importing).
- Se anima **solo `opacity`**, propiedad de compositor; posicionamiento estático (`absolute inset-0`) — OK (`index.md` §Performance).
- `willChange: "opacity"` — OK. `index.md` pide retirarlo al terminar la animación; aquí el ciclo es continuo durante toda la vida del componente, así que no hay "al terminar". Justificado en `design.md` §4.1. Coste asumido: 3 capas full-viewport promovidas de forma permanente. Aceptable para 3 capas; no bloqueante.
- `ease: "easeInOut"` con duración fija en vez de spring — OK: `opacity` no es movimiento físico ni interrumpible (`index.md` §Design).
- `initial={false}` evita la animación de montaje — OK.
- Sin MotionValues ni `useTransform` → las reglas de esa sección no aplican.
- `prefers-reduced-motion` atendido vía `useReducedMotion()` — OK.
- `alt=""` en las imágenes de fondo (decorativas) — OK.

---

## 5. Los dos puntos que el implementer marcó para el reviewer

### 5.1 `z-10` duplicado (wrapper + `splash-logo-layer`) — ACEPTADO

Hechos:

- `requirements.md` §Vocabulario define **capa del logo** = `data-testid="splash-logo-layer"`, y R15 exige la clase `z-10` **en ella**.
- `design.md` §3.1 y T9 dibujan `z-10` en el **wrapper externo** (`pointer-events-none absolute inset-0 z-10 flex ...`), sin `z-10` en el hijo.
- Es una inconsistencia **del spec**, no del implementer. `splash-section.tsx:60-63` declara `z-10` en ambos, y lo documenta en `impl_splash-section.md` §3.2.

Juicio:

- El apilamiento real sobre el fondo lo produce el **wrapper** (hermano posicionado de las capas dentro de la section `relative`). Eso es lo que hace cumplir el comportamiento que R15 describe en su primera mitad.
- El `z-10` del hijo **no es CSS muerto ni un atributo inventado para el test**: `splash-logo-layer` es un flex item, y por CSS Flexbox §5.4 un flex item con `z-index` distinto de `auto` crea contexto de apilamiento y participa en el orden de pintado aunque su `position` sea `static`. Es aditivo, semánticamente válido y sin efecto visual aquí (es hijo único del contenedor flex).
- ¿El test verifica comportamiento o implementación? **Implementación** (clase declarada). Pero eso no es un atajo del implementer: es la estrategia que `design.md` §6.4 fija explícitamente para R16–R22 porque jsdom no calcula layout, y que el humano aprobó en la puerta `spec_ready`. Exigir aquí un test de comportamiento sería exigir algo que el entorno de test aprobado no puede dar.
- Además, quitar el `z-10` del hijo **incumpliría R15 literalmente**. No hay lectura del spec que permita quitarlo.

Recomendación no bloqueante (deuda de spec, no de código): en una revisión
futura de `requirements.md`, anclar R15 en el wrapper posicionado —o dar
`relative` a `splash-logo-layer`— para que requirement y diseño hablen del mismo
nodo.

### 5.2 Polyfill de `matchMedia` ampliado — LEGÍTIMO, no es un truco

Verifiqué el motivo en el código instalado, no en la palabra del implementer:

`node_modules/.pnpm/motion-dom@13.1.1/.../render/utils/reduced-motion/index.mjs:9`

```js
const motionMediaQuery = window.matchMedia("(prefers-reduced-motion)");
const setReducedMotionPreferences = () => (prefersReducedMotion.current = motionMediaQuery.matches);
motionMediaQuery.addEventListener("change", setReducedMotionPreferences);
setReducedMotionPreferences();
```

`framer-motion@13.1.1/.../use-reduced-motion.mjs`

```js
!hasReducedMotionListener.current && initPrefersReducedMotion();
const [shouldReduceMotion] = useState(prefersReducedMotion.current);
// TODO See if people miss automatically updating shouldReduceMotion setting
```

Confirmado punto por punto:

1. Motion consulta `"(prefers-reduced-motion)"` **sin `: reduce`**. Un stub que solo reconociera `(prefers-reduced-motion: reduce)` devolvería `matches:false` y T23 fallaría. El `query.includes("prefers-reduced-motion")` de `tests/setup.ts:29` cubre ambas formas: es adaptación a la API real, no relajación de la aserción.
2. `initPrefersReducedMotion()` está latcheado por módulo y `useReducedMotion()` lee el valor **una sola vez** en `useState`. Por eso `setReducedMotion()` (`tests/setup.ts:56-76`) tiene que emitir el evento `change` de verdad a los listeners registrados: es la única vía por la que la preferencia llega al Motion real.
3. **NO hay `vi.mock("motion/react")`.** `grep -rn "vi.mock" tests/ components/ app/` → **cero ocurrencias**. `vitest.config.ts` no aliasa ni intercepta `motion`; su único alias es `@` → raíz. El `motion/react` que se ejecuta en los 21 tests es el paquete real.
4. Prueba de que la lógica de `useReducedMotion` **se ejerce de verdad**: en mi propia ejecución, el `warnOnce` interno de Motion —que solo se dispara cuando `shouldReduceMotion === true`— aparece en stderr **exactamente y solo** en el test "con movimiento reducido el crossfade dura 0 ms" (§1.1). Es evidencia emitida por la librería real, no por el polyfill.
5. Cadena causal completa: `setReducedMotion(true)` → evento `change` → `prefersReducedMotion.current = true` → `useReducedMotion()` → `crossfadeMs = 0` → `data-crossfade-ms="0"` **y** `transition.duration = 0`. Si cualquier eslabón fallara, T23 fallaría; y si el polyfill devolviera siempre `true`, fallaría T22. Los dos tests se cubren mutuamente.

Es un **polyfill de entorno** (jsdom no implementa `matchMedia`), no un mock del
componente ni del DOM: no incurre en el antipatrón de `docs/verification.md`
§Anti-patrones. T3 queda cumplida en su intención (permitir fijar la preferencia
por test) y la desviación respecto a su enunciado literal está documentada en
`impl_splash-section.md` §3.3.

---

## 6. Checkpoints

**`CHECKPOINTS.md` NO EXISTE en el repositorio.** Confirmado por `ls` y por
`git log --all -- CHECKPOINTS.md` (sin resultados: nunca existió en ninguna
rama). `AGENTS.md` §2 lo lista como "Criterios objetivos de estado final
correcto".

No lo invento ni lo doy por cumplido. Queda como **hallazgo de proceso**, ya
reportado también por el spec-author:

- [ ] C1..Cn — no evaluables: el archivo no existe.

Acción para el humano/leader (fuera del alcance de esta feature): crear
`CHECKPOINTS.md` o eliminar su referencia de `AGENTS.md` §2.

En su ausencia, evalué contra las fuentes normativas que sí existen:
`docs/architecture.md`, `docs/conventions.md`, `docs/verification.md`.

---

## 7. Arquitectura y convenciones

`docs/architecture.md`:

- [x] Stack: Next.js App Router + React + TS estricto + Tailwind; pnpm. Sin backend ni rutas de API.
- [x] Estructura: componente en `components/`, test espejo en `tests/`, sin carpetas nuevas fuera del mapa.
- [x] Server vs Client: `"use client"` en `components/splash-section.tsx` (necesita `useState`/`useEffect`/`useReducedMotion`); `app/page.tsx` sigue Server Component y solo compone. Es literalmente el patrón preferido del doc.
- [x] Estado: `useState` local, sin librerías externas. No necesita `localStorage`.
- [x] Estilos: utilidades Tailwind en el JSX. **Ningún `*.module.css` creado.**
- [x] Tests: `vitest` + `@testing-library/react`, `pnpm test` corre la suite.

`docs/conventions.md`:

- [x] Constantes UPPER_SNAKE: `SPLASH_IMAGES`, `SPLASH_INTERVAL_MS`, `SPLASH_CROSSFADE_MS`.
- [x] Archivo de componente kebab-case.tsx: `splash-section.tsx`.
- [x] Export PascalCase: `export function SplashSection`.
- [x] Animaciones con `motion` siguiendo `.claude/skills/motion` (§4.1).
- [x] Un archivo de test por componente, espejando la ruta: `components/splash-section.tsx` → `tests/splash-section.test.tsx`.
- [x] Nombres de test descriptivos y **consistentes en idioma** (los 21 en español).
- [x] Comentarios: solo los que explican un porqué no obvio (`tests/setup.ts:43-44,61-62` justifican el polyfill y la emisión del evento). Los `// T12 — R1` del test son trazabilidad exigida por el proceso, no ruido.

Limpieza:

- [x] `grep -rn "console\.|TODO|FIXME|XXX" tests/ components/ app/` → **cero ocurrencias**.
- [x] `git status --porcelain -uall`: sin archivos temporales ni artefactos. Los untracked son exactamente los 7 entregables de la feature; `tsconfig.tsbuildinfo` está cubierto por `.gitignore`.
- [x] `app/page.tsx` sin boilerplate de create-next-app: 5 líneas, sin imports muertos.
- [x] Assets referenciados existen: `public/images/splash-{1,2,3}.webp` y `public/iso-logo-white.svg`.

---

## 8. Observaciones no bloqueantes (ningún R ni T las exige)

1. `CHECKPOINTS.md` no existe pese a estar en `AGENTS.md` §2 (§6). Hallazgo de proceso, no de la feature.
2. T34 marcada `[x]` con la verificación visual pendiente. Justificada por escrito; el humano debe correr `pnpm dev` y comprobar a **402 / 768 / 1512 px** ausencia de scroll horizontal, logo sin recortar y crossfade sin hard cut **antes de que el leader marque `done`**.
3. T35 sigue abierta por diseño: confirmar `md` = 768 px como breakpoint de tablet (`design.md` §1.2.2).
4. R15 y `design.md` §3.1 apuntan a nodos distintos para `z-10` (§5.1). Deuda de spec para una revisión futura.
5. `app/layout.tsx` conserva el metadata de create-next-app (`title: "Create Next App"`). Fuera del alcance de este spec (`design.md` §2 fija que `layout.tsx` no se toca). Debería cubrirlo una feature futura.
6. `public/` conserva SVGs de create-next-app (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`). Ninguna task pide limpiarlos.
7. `design.md` §4.2 afirma que `useReducedMotion()` re-renderiza al cambiar la preferencia; en `motion@13.1.1` no lo hace (hay un TODO en el fuente). El implementer lo detectó y lo dejó constar; R11/R12 no dependen de ese comportamiento. Corregir el texto de `design.md` en una revisión futura.
8. Warning de Vite sobre `vitest.config.ts` cargado como CommonJS. Cosmético, compatibilidad futura; el nombre del archivo lo fija `design.md` §2.
9. No pude lanzar el subagente `motion-reviewer` (herramienta no disponible en esta sesión); la revisión de animación de §4.1 la hice yo contra el skill.

---

## 9. Cambios requeridos

**Ninguno.** No hay defecto que incumpla ningún R1–R22 ni ninguna T1–T34.

Condiciones para que el leader cierre la feature como `done` (no son defectos de
implementación, son pasos de proceso pendientes de humano):

1. Ejecutar la verificación visual de T34 a 402 / 768 / 1512 px.
2. Confirmar T35 (breakpoint `md` = 768 px) y marcarla.
3. Solo entonces `feature_list.json` → `"status": "done"` y mover el resumen a `progress/history.md`.
