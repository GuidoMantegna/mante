# Implementación — `splash-transition`

> Iteración 2: la apertura ya no parte el splash en dos hojas. Una cortina
> propia se cierra sobre el splash intacto y, al abrirse, deja ver la home.

## Trazabilidad

Todos los tests están en `tests/splash-transition.test.tsx`.

- R1 → "el splash se renderiza como overlay fijo cubriendo el viewport"
- R2 → "bloquea el scroll del documento mientras no se revela"
- R3 → "un wheel en window cierra la cortina", "un pointerdown…", "un
  touchmove…", "un scroll…", "una tecla de avance (Space)…"
- R4 → "una tecla irrelevante (Tab) no dispara la transición"
- R5 → "mantiene el scroll bloqueado mientras la cortina se cierra y lo
  libera al abrirse"
- R6 → "un disparador posterior no reinicia la secuencia"
- R7 → "el splash renderiza un único fondo sin dividir"
- R8 → "la cortina son dos paneles opacos por encima del splash y ocultos a
  lectores"
- R9 → "el splash permanece intacto bajo la cortina y solo se desmonta al
  quedar tapado"
- R10 → "con movimiento reducido la duración de la cortina es 0", "con
  movimiento reducido el navbar aparece sin retardo ni duración"
- R11 → "el hint queda visible con el retardo configurado y se oculta al
  disparar"
- R12 → "SketchSequence no dibuja mientras la cortina no se abrió"
- R13 → "SketchSequence dibuja cuando la cortina se abre estando en el
  viewport"
- R14 → "el navbar sigue oculto mientras la cortina se cierra"
- R15 → "el navbar pasa a data-revealed true cuando la cortina se abre"
- R16 → "los módulos del gate importan de motion/react y no de framer-motion"
- R17 → "recorre las fases idle → closing → opening → done y desmonta la
  cortina"

Los 22 requirements de `specs/splash-section/requirements.md` (R1–R22)
siguen cubiertos por `tests/splash-section.test.tsx`. Al volver el fondo a
una sola instancia, `getLayers()` deja de escopear a una hoja y vuelve a ser
`screen.getAllByTestId("splash-layer")`.

## Verificación

- `pnpm test` — 78/78 verdes (33 splash-section + 23 splash-transition + 22
  del resto de la suite: sketch-sequence, svg-drawing, kitchen-sketch,
  closet-sketch, useDrawSequence).
- `pnpm lint` — 0 errores.
- `npx tsc --noEmit` — sin errores.
- `pnpm build` — build de producción exitoso, las 4 rutas estáticas se
  generan sin fallos.
- Verificación manual con Playwright (Chromium, viewport 1440×900,
  `pnpm dev` en `localhost:3000`), dos pasadas:
  - **Sin `prefers-reduced-motion`:** splash entero con logo y hint →
    `wheel` → los paneles entran desde los bordes sobre el splash **sin
    deformarlo** (screenshot intermedio: logo completo, bandas amarillas a
    los lados) → pantalla íntegramente cubierta → los paneles salen hacia
    los bordes descubriendo la home → cortina y splash desmontados, navbar
    con `opacity: 1`, `SketchSequence` en `data-phase="visible"`, sin
    `splash-locked`, sin scroll horizontal. Un scroll posterior confirma
    que el splash no reaparece.
  - **Con `prefers-reduced-motion: reduce`:** `wheel` → cortina y splash
    desmontados en el mismo tick (duraciones 0), navbar `opacity: 1` sin
    retardo, `SketchSequence` mostrando directamente el último boceto.
- Se comprobaron dos riesgos con recortes ampliados (`deviceScaleFactor` 3–4)
  en vez de a ojo sobre el screenshot completo:
  - **Costura en el centro:** recorte de 60×70 px en `x≈690` con la cortina
    cerrada → amarillo sólido. El `calc(50% + 1px)` de cada panel cumple su
    función.
  - **Apilado cortina/navbar:** recorte de la franja superior a mitad de
    apertura (navbar con `opacity: 0.28`, borde del panel en `x≈212`) →
    amarillo hasta `y = 0` en todo el ancho cubierto, y navbar visible solo
    a partir de donde la cortina ya despejó. El `z-50` de la cortina gana al
    `z-30` del navbar pese al `backdrop-filter` de éste.

## Bug corregido en la iteración 1 (sigue vigente)

`Navbar` no leía `prefers-reduced-motion`: su transición de entrada quedaba
fija en `delay: 0.5s, duration: 0.5s` incluso con la preferencia activada,
dejando una ventana de hasta 1 s con el navbar invisible justo después de
revelar. Se corrigió con `useReducedMotion()` y `delay`/`duration` a `0`, y
la iteración 2 lo mantiene (el retardo normal pasó a derivarse de
`SPLASH_CURTAIN_OPEN_MS`).

## Deuda no bloqueante

- **Hydration mismatch preexistente con `prefers-reduced-motion` real en el
  navegador.** `useReducedMotion()` de `motion/react` no es SSR-safe: el
  servidor siempre renderiza asumiendo `false`, así que un usuario con la
  preferencia del SO activada ve un mismatch en consola (React regenera el
  árbol afectado en el cliente sin romper la página). Confirmado que **ya
  existía** antes de esta feature — el `SplashSection` original (commit
  `223f7ac`) usa el mismo hook de la misma forma, y
  `SketchSequence`/`useDrawSequence` lo heredan; el diff que reporta
  Chromium apunta justamente a `SvgDrawing`. Corregirlo requeriría un patrón
  de hidratación diferida en todo el uso de `useReducedMotion` del repo,
  fuera del alcance de este feature.
- El color de la cortina (`--curtain-gold: #D4B03C`) se eligió a ojo desde
  las capturas de referencia; no pertenece a la paleta documentada en
  `app/globals.css`. Está aislado en un único token por si hay que ajustarlo
  al valor exacto de marca.
- El hint de scroll (`DESLIZÁ` + chevron) no tiene test de accesibilidad
  específico más allá de su presencia/visibilidad; es puramente decorativo
  (`pointer-events-none`), no bloquea navegación por teclado.
