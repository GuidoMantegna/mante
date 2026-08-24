# Design — `splash-section`

> Cómo se construye lo que `requirements.md` exige. Se apoya en
> `docs/architecture.md` y `docs/conventions.md`; aquí solo se documentan los
> puntos donde la feature roza la frontera de esas reglas.

---

## 1. Contexto de diseño extraído de Figma

Archivo `MANTÉ`, fileKey `xq6bGeZ1bS99w5FydB8lcP`, página `0:1`.

### 1.1 Valores leídos (verificados por MCP)

| Frame                          | Tamaño     | Nodo `iso-logo`             | Derivado                                              |
|--------------------------------|------------|------------------------------|-------------------------------------------------------|
| `50:239` SPLASH (mobile)       | 402 × 874  | x 23, y 388, w 356, h 98     | ancho **88,6 %**; centrado en ambos ejes (23/23, 388/388) |
| `31:170` SPLASH-transition (desktop) | 1512 × 982 | x 248, y 352, w 1016, h 279 | ancho **67,2 %**; centrado en ambos ejes (248/248, 352/351) |
| `39:317` SPLASH (desktop)      | 1512 × 982 | — (ver §1.2)                 | screenshot confirma logo centrado, ancho ≈ 66 %        |

- SVG `public/iso-logo-white.svg`: `viewBox="0 0 1016 280"` → ratio 3,629.
  Coincide con la geometría Figma (1016/279 = 3,642; 356/98 = 3,633).
- Fill del logo en el SVG: `#F4F1EA` (Warm Limestone, paleta de
  `app/globals.css`). No hace falta recolorear.
- Los screenshots de `39:317` y `50:239` muestran **fondo fotográfico a sangre
  completa** (interior de cocina) con el logo blanco centrado encima. No se
  detecta scrim, degradado ni overlay de color entre foto y logo.

### 1.2 Supuestos pendientes de confirmación humana

Se documentan explícitamente porque el MCP no permitió derivarlos:

1. **`39:317` SPLASH (desktop) no expone hijos en `get_metadata`** (devuelve un
   `<frame>` vacío: el contenido está aplanado). La geometría del logo desktop
   se toma por tanto de `31:170` SPLASH-transition, que sí la expone y cuyo
   screenshot es proporcionalmente idéntico. **Supuesto:** ancho del logo
   desktop = 67 % del viewport, centrado.
2. **No existe frame de tablet** en el archivo. **Supuesto:** el salto 88 % →
   67 % ocurre en el breakpoint `md` de Tailwind (768 px). Tablet hereda el
   tratamiento base (88 %) por debajo de 768 px y el desktop por encima.
3. **El modo de encaje de la foto de fondo no es extraíble** (imagen aplanada
   dentro del frame). **Supuesto:** `object-cover` con centrado, que es lo que
   reproduce visualmente el screenshot a sangre.
4. **Las imágenes concretas del frame Figma no son `splash-1/2/3.webp`** — el
   frame muestra una única foto. El orden y el contenido de la rotación viene
   del `acceptance` de `feature_list.json`, no de Figma.

### 1.3 Explícitamente fuera de alcance

Los frames `31:170` (desktop) y `50:122` (mobile) **SPLASH-transition**
describen la transición de salida del splash hacia la siguiente sección: panel
partido madera/blanco (`section-a` / `section-b`), logo en versión oscura y
aparición de `HEADER-desktop` / `HEADER-MOBILE` con la navbar
(PROYECTOS / DESARROLLOS / NOSOTROS / CONTACTO).

Ningún criterio del array `acceptance` de la feature `id: 1` cubre esa
transición, ni el header, ni la navbar. Por la regla dura de `AGENTS.md`
("una sola feature a la vez") y por la del charter de `spec-author` ("no
inventes requirements no soportados"), **este spec no los especifica**. Quedan
para una feature posterior.

---

## 2. Archivos a crear / modificar

| Archivo                                | Acción    | Motivo                                                                 |
|----------------------------------------|-----------|------------------------------------------------------------------------|
| `components/splash-section.tsx`         | **crear** | Componente cliente de la feature. Primera feature que crea `components/` (`docs/architecture.md`). |
| `app/page.tsx`                          | modificar | Sustituir el boilerplate de create-next-app por `<SplashSection />`.   |
| `tests/splash-section.test.tsx`         | **crear** | Test de integración + trazabilidad R1–R22 (`docs/conventions.md`: espejo de la ruta). |
| `tests/setup.ts`                        | **crear** | `@testing-library/jest-dom` + stub de `window.matchMedia` (ver §6.1).  |
| `vitest.config.ts`                      | **crear** | El runner declarado en `docs/architecture.md` no está instalado (ver §6). |
| `package.json`                          | modificar | devDependencies del runner + script `test`.                            |
| `progress/impl_splash-section.md`       | **crear** | Mapa de trazabilidad exigido por `docs/verification.md` §Nivel 3 (lo escribe el implementer). |

No se crea ningún `*.module.css`: todo se resuelve con utilidades Tailwind
(`docs/architecture.md` §Estilos).

`app/layout.tsx` **no se modifica**. Su `<body class="min-h-full flex flex-col">`
convierte a la sección en hijo flex; para que `h-svh` no se comprima, la sección
declara además `shrink-0`.

---

## 3. Firmas nuevas

```ts
// components/splash-section.tsx
"use client";

export const SPLASH_IMAGES: readonly string[];      // orden canónico, 3 rutas
export const SPLASH_INTERVAL_MS: number;            // 3000
export const SPLASH_CROSSFADE_MS: number;           // 1200

export function SplashSection(): React.JSX.Element; // sin props
```

`SplashSection` no recibe props: la lista de imágenes, el intervalo y la
duración del crossfade son constantes del módulo (`UPPER_SNAKE`, según
`docs/conventions.md` §Nombres). Exportarlas permite que el test las referencie
en vez de duplicar literales.

### 3.1 Estructura del DOM emitido

```
<section data-testid="splash-section"
         class="relative h-svh w-full shrink-0 overflow-hidden">

  <!-- 3 capas persistentes, apiladas -->
  <motion.div data-testid="splash-layer"
              data-src="/images/splash-N.webp"
              data-active="true|false"
              data-crossfade-ms="1200|0"
              class="absolute inset-0"
              initial={false}
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: crossfadeMs / 1000, ease: "easeInOut" }}
              style={{ willChange: "opacity" }}>
    <Image src=... alt="" fill sizes="100vw" class="object-cover" priority={N===1} />
  </motion.div>

  <!-- logo superpuesto -->
  <div class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
    <div data-testid="splash-logo-layer" class="w-[88%] max-w-[1016px] md:w-[67%]">
      <Image data-testid="splash-logo" src="/iso-logo-white.svg" alt="Manté"
             width={1016} height={280} priority unoptimized
             class="h-auto w-full object-contain" />
    </div>
  </div>
</section>
```

Mapeo requirement ↔ atributo/clase (para el reviewer):

| Requirement | Anclaje verificable en el DOM                                    |
|-------------|-------------------------------------------------------------------|
| R1, R6      | `data-testid="splash-layer"` + `data-src`                         |
| R2–R5       | `data-active`                                                     |
| R8          | `style.opacity` inline que escribe Motion                          |
| R11, R12    | `data-crossfade-ms`                                                |
| R13, R14    | `data-testid="splash-logo"` (`src`, `alt`)                        |
| R15, R16    | `z-10` en el wrapper; `w-[88%] md:w-[67%] max-w-[1016px]`          |
| R17, R22    | `object-contain` / `object-cover`                                  |
| R18–R21     | clases de `data-testid="splash-section"`                           |

`data-active` y `data-crossfade-ms` son **atributos derivados del estado de
React, no de la animación**. Es la costura que hace R2–R5 y R11/R12 verificables
en jsdom sin depender de que una animación progrese (ver §6.2).

---

## 4. Técnica de animación (Motion)

Consultado el codex de Motion (`search-motion-docs`, plataforma `react`) y
`.claude/skills/motion/best-practices/{index,react}.md`.

### 4.1 API elegida

**Tres `motion.div` persistentes con `animate={{ opacity }}` — sin
`AnimatePresence`.**

Justificación apoyada en lo que devuelve el codex y las best practices:

- El doc `motion://docs/react/react-motion-component` cubre exactamente este
  caso: animación declarativa de una propiedad por cambio de estado. No hace
  falta ciclo de vida de montaje/desmontaje, así que `AnimatePresence` (cuyo
  único propósito documentado es "run exit animations on React components when
  they're removed from the page") no aporta nada aquí.
- `best-practices/index.md` §Performance: `opacity` es una propiedad compuesta
  por el compositor; se anima **solo** `opacity`, nunca `width`/`height`/`top`.
  El posicionamiento es estático (`absolute inset-0`).
- `best-practices/index.md` §will-change: se declara `willChange: "opacity"`
  para promover la capa. Se acepta el coste de mantenerlo permanente porque las
  tres capas están en animación cíclica continua durante toda la vida del
  componente — no hay un "una vez terminada" en el que retirarlo.
- `best-practices/index.md` §Design: no es un movimiento físico ni
  interrumpible, así que se usa easing predecible (`ease: "easeInOut"`,
  `duration` fija) en vez de spring. Manté es una marca de mobiliario de
  interiorismo: curva suave, sin overshoot.
- Import: `import { motion, useReducedMotion } from "motion/react"`
  (`best-practices/react.md`: nunca `framer-motion`; en archivos `"use client"`
  siempre `motion/react`). El paquete instalado es `motion@^13.1.1`.

### 4.2 `prefers-reduced-motion`

Se usa `useReducedMotion()` de `motion/react`
(`motion://docs/react/react-use-reduced-motion`), que devuelve `true` cuando
`(prefers-reduced-motion: reduce)` está activo y **re-renderiza al cambiar la
preferencia**.

```ts
const prefersReducedMotion = useReducedMotion();
const crossfadeMs = prefersReducedMotion ? 0 : SPLASH_CROSSFADE_MS;
```

La rotación **no se detiene** con movimiento reducido: solo desaparece el
crossfade (`duration: 0`). Rotar imágenes fijas sin desplazamiento no es un
patrón vestibular; lo que la preferencia exige eliminar es la animación, no el
contenido.

### 4.3 Nota de disponibilidad Motion+

La búsqueda en el codex devolvió resultados **Motion+** cuyo código fuente no
está disponible en esta sesión (ver nota al final del `tasks.md`). Ninguno era
necesario: el patrón elegido sale de documentación pública.

---

## 5. Server / Client Components

`components/splash-section.tsx` lleva `"use client"` porque necesita `useState`
(índice activo), `useEffect` (`setInterval`) y `useReducedMotion` (suscripción a
`matchMedia`).

`app/page.tsx` **permanece Server Component**: solo importa y renderiza
`<SplashSection />`. Es el patrón preferido de `docs/architecture.md`
§Server vs Client Components ("`app/page.tsx` importa un componente cliente de
`components/` que concentra la interactividad, en vez de convertir la página
entera en cliente").

### 5.1 Temporizador y cleanup (R7)

```ts
useEffect(() => {
  const id = setInterval(
    () => setActiveIndex((i) => (i + 1) % SPLASH_IMAGES.length),
    SPLASH_INTERVAL_MS,
  );
  return () => clearInterval(id);
}, []);
```

- Dependencias `[]`: el intervalo se crea una vez y no se reinicia en cada
  cambio de índice (se usa el updater funcional, no `activeIndex`).
- `clearInterval` en el cleanup cubre R7 y evita el warning de actualización de
  estado sobre un componente desmontado.

---

## 6. Infraestructura y estrategia de test

### 6.1 El runner no está instalado

`docs/architecture.md` declara `vitest` + `@testing-library/react` y `pnpm test`,
pero `package.json` no tiene ninguno de los dos ni el script `test`. **Esta
feature debe instalarlos** (tasks T1–T3). Sin eso, ningún `R<n>` es ejecutable y
`docs/verification.md` §Verificación final no se puede cumplir.

- devDependencies: `vitest`, `@vitejs/plugin-react`, `jsdom`,
  `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`,
  `@types/react` (ya está).
- `package.json` → `"test": "vitest run"`.
- `vitest.config.ts`: `plugins: [react()]`, `test.environment: "jsdom"`,
  `test.globals: true`, `test.setupFiles: ["./tests/setup.ts"]`, y alias
  `"@": path.resolve(__dirname, ".")` para respetar el `paths` de
  `tsconfig.json`.
- `tests/setup.ts`: `import "@testing-library/jest-dom/vitest"` y un stub de
  `window.matchMedia`, **que jsdom no implementa** y del que depende
  `useReducedMotion`. El stub debe permitir cambiar `matches` por test
  (R11 vs R12). Esto es un *polyfill de entorno*, no un mock del componente ni
  del DOM: no incurre en el antipatrón de `docs/verification.md`.

### 6.2 Cómo se testea un timer de 3000 ms

`vi.useFakeTimers()` en `beforeEach`, `vi.useRealTimers()` en `afterEach`.
Los avances se envuelven en `act()` para que React procese el `setState`:

```ts
act(() => { vi.advanceTimersByTime(SPLASH_INTERVAL_MS); });
```

- R5 (no cambia antes de tiempo) → `advanceTimersByTime(2999)`.
- R3 → 3000 ms y 6000 ms acumulados.
- R4 (loop) → 9000 ms acumulados vuelve a `splash-1`.
- R7 → tras `unmount()`, `expect(vi.getTimerCount()).toBe(0)`.

### 6.3 Cómo se testea la animación sin mockear Motion

Se renderiza el `motion/react` **real**. jsdom no tiene motor de layout ni
`Element.animate`, así que una aserción sobre el valor intermedio de `opacity`
sería no determinista. Por eso los requirements se anclaron (§3.1) en cosas que
sí son deterministas en jsdom:

- **R8** — con `initial={false}`, Motion escribe los valores de `animate`
  directamente en el `style` inline del primer render. Así, en el render
  inicial, la capa activa tiene `opacity: 1` y las otras `opacity: 0`. Es una
  aserción sobre el DOM real que produce Motion, no sobre un mock.
- **R11 / R12 (sin hard cut)** — la duración se expone en
  `data-crossfade-ms`, escrita desde el mismo valor que alimenta
  `transition.duration`. Un `hard cut` es exactamente `duration === 0`; el test
  afirma `> 0` sin movimiento reducido y `=== 0` con él.
- **R9 / R10 (el import)** — se leen los bytes de
  `components/splash-section.tsx` con `node:fs` desde el test y se afirma que
  contienen `from "motion/react"` y que **no** contienen `framer-motion`. Es
  una aserción de tipo lint, ejecutable y determinista; es la única forma
  honesta de verificar la procedencia del import sin mockear el módulo.

**Ningún `R<n>` queda huérfano ni requiere `vi.mock("motion/react")`.**

### 6.4 Requirements de layout en jsdom

jsdom no aplica CSS de Tailwind ni calcula layout: `getBoundingClientRect()`
devuelve ceros. Por eso R16–R22 están redactados como contratos sobre las
**clases declaradas** (`toHaveClass`), no sobre píxeles medidos. Es la
formulación testeable de AC3 y AC4 en este entorno; la verificación visual real
queda para la revisión humana del `spec_ready` y del PR.

### 6.5 `next/image` en los tests

`next/image` reescribe el `src` a `/_next/image?url=...&w=...`. Los tests deben
afirmar sobre `decodeURIComponent(img.getAttribute("src")!)` y usar `toContain`,
no igualdad exacta (R6, R13).

El logo SVG se renderiza con `unoptimized`: Next no optimiza SVG salvo que se
active `dangerouslyAllowSVG` en `next.config.ts`, y no hay motivo para abrir esa
puerta por un único asset. `unoptimized` deja el `src` en `/iso-logo-white.svg`.

---

## 7. Decisiones de layout (AC4)

- **`h-svh`** y no `h-screen`/`h-dvh`: `svh` es la altura del viewport pequeño,
  la que evita el salto de layout cuando la barra de URL móvil se retrae. El
  frame mobile de Figma (402 × 874) corresponde a esa altura estable.
- **`w-full` y NO `w-screen`** (R19, R20): `w-screen` = `100vw`, que en
  navegadores de escritorio **incluye el ancho de la barra de scroll vertical**
  y produce exactamente el scroll horizontal que AC4 prohíbe. `w-full` se ajusta
  al contenedor.
- **`overflow-hidden`** (R21) en la sección: contiene el `object-cover` de las
  fotos, que por definición desborda en uno de los dos ejes.
- **`object-cover` en el fondo / `object-contain` + `h-auto` + `w-full` en el
  logo** (R22, R17): la foto puede recortarse (es decorativa y va a sangre); el
  logo no puede recortarse nunca — es la marca. `max-w-[1016px]` impide además
  que el SVG se escale por encima de su tamaño intrínseco en pantallas anchas.
- `alt=""` en las imágenes de fondo: son decorativas, no aportan información;
  el nombre accesible de la sección lo da el logo (`alt="Manté"`, R14).

---

## 8. Alternativas descartadas

### 8.1 `AnimatePresence` + cambio de `key` (descartada)

Sería el patrón "Slideshow" del propio doc de Motion
(`motion://docs/react/react-animate-presence` §Changing `key`): un solo
`motion.img` cuya `key` cambia, con `initial`/`animate`/`exit`.

Descartada por dos razones:

1. **Testabilidad.** En modo `sync` (el por defecto) el nodo saliente permanece
   en el DOM hasta que su animación de salida termina. Bajo `vi.useFakeTimers()`
   el bucle de frames de Motion no progresa de forma determinista, así que
   durante un intervalo indeterminado habría **dos** capas montadas y "cuál es
   la imagen visible" dejaría de ser una pregunta con respuesta estable. Forzaría
   a `vi.mock("motion/react")`, lo que a su vez dejaría R8/R11/R12 sin nada real
   que verificar — el mock probaría el mock.
2. **Producción.** Cambiar la `key` desmonta y remonta el `<img>` en cada ciclo.
   Cada tres segundos el navegador vuelve a montar el elemento y puede volver a
   decodificar el bitmap, con riesgo de parpadeo justo en el arranque del
   crossfade. Con tres capas persistentes, las tres imágenes se decodifican una
   sola vez y el loop es un cambio de `opacity` puro.

El coste asumido es tener tres `<img>` a pantalla completa siempre en el DOM (3
× ~1 imagen de fondo). Es aceptable: son exactamente las tres que la feature
tiene que mostrar en un ciclo de 9 s, así que se descargarían igualmente.

### 8.2 Crossfade con `@keyframes` de CSS puro (descartada)

Tres animaciones CSS desfasadas 3 s resolverían el efecto sin JavaScript.
Descartada porque `AGENTS.md` §1.4 y `docs/conventions.md` §Animaciones son
regla dura: *toda* animación va con Motion. Además el índice activo dejaría de
existir como estado de React y R2–R5 no tendrían anclaje verificable.

### 8.3 Convertir `app/page.tsx` en Client Component (descartada)

Sería más corto poner `"use client"` en la página y meter ahí el `useEffect`.
Descartada por `docs/architecture.md` §Server vs Client Components, que exige
concentrar la interactividad en un componente de `components/` y dejar la página
como Server Component.

---

## 9. Excepciones

Ninguna clase de error nueva: el componente no tiene caminos de fallo propios
(no hay red, ni backend, ni `localStorage`). Si un `.webp` no cargase, el
navegador muestra el `alt` vacío sobre fondo transparente; no hay estado de
error que modelar y, por tanto, ningún `R<n>` de camino de error.
