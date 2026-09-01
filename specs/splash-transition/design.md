# Design — `splash-transition`

## Archivos afectados

- `components/splash-gate.tsx` (nuevo — provider + máquina de fases)
- `components/splash-backdrop.tsx` (nuevo — fondo rotativo presentacional)
- `components/splash-curtain.tsx` (nuevo — los dos paneles de la cortina)
- `components/splash-overlay.tsx` (nuevo — compone splash + cortina)
- `components/splash-section.tsx` (modificado)
- `components/navbar.tsx` (modificado)
- `components/sketch-sequence.tsx` (modificado)
- `app/layout.tsx` (modificado)
- `app/page.tsx` (modificado)
- `app/globals.css` (modificado)
- `tests/splash-section.test.tsx` (actualizado, mismos requirements de `specs/splash-section/`)
- `tests/splash-transition.test.tsx` (nuevo)

## Arquitectura: overlay `fixed` + context, no in-flow + scroll

`SplashSection` no es un hermano más en el flujo del documento: es un
overlay `fixed inset-0` por encima de todo (incluido `Navbar`).
`HomeSection` y el resto de secciones ya están en su posición final desde
el primer render, tapadas. Revelar es simplemente desbloquear el scroll y
desmontar el overlay: no hay reflow ni salto de scroll (que sí habría si
el splash estuviera en flujo y se retirara `100svh` de golpe).

Como `Navbar` vive en `app/layout.tsx` (server) y el splash en
`app/page.tsx`, hace falta un canal de estado compartido entre ambos
árboles. Es el primer `useContext` del repo — `docs/architecture.md`
prohíbe **librerías externas** de estado (Redux/Zustand), no
`useContext`, así que es admisible sin romper la regla.

## La transición: una cortina propia, no el splash partido

El efecto es el de un **telón que baja y vuelve a subir**: una capa opaca
ajena al splash entra desde los dos bordes, se junta en el centro tapando
todo, y vuelve a salir hacia los bordes dejando ver la home. El splash
nunca se deforma ni se divide; solo queda debajo y se retira cuando ya no
se lo ve.

Eso obliga a un estado con **más de dos valores**: hay que distinguir "el
usuario disparó" de "la home ya está a la vista", porque son momentos
distintos y hay consumidores que dependen de cada uno. De ahí la máquina
de fases en el gate:

```
idle ──disparador──▶ closing ──CLOSE+HOLD ms──▶ opening ──OPEN ms──▶ done
```

| Fase      | Splash              | Cortina                 | Scroll   | Navbar / SketchSequence |
|-----------|---------------------|-------------------------|----------|-------------------------|
| `idle`    | visible, rotando    | fuera de pantalla       | bloqueado| ocultos / parados       |
| `closing` | visible, intacto    | entrando desde los bordes| bloqueado| ocultos / parados       |
| `opening` | desmontado          | saliendo hacia los bordes| libre    | entrando / dibujando    |
| `done`    | —                   | desmontada              | libre    | —                       |

`revealed` (`phase !== "idle"`) y `homeVisible` (`opening` o `done`) se
derivan de la fase y son lo que consume cada componente, de modo que
ninguno necesita conocer la máquina completa.

## `components/splash-gate.tsx`

Dueño de la máquina. Expone `{ phase, revealed, homeVisible, reveal }` y
las tres constantes de tiempo, que viven aquí y no en la cortina para que
la dependencia sea de un solo sentido (`splash-curtain → splash-gate`) y
no haya ciclo de imports.

```ts
export const SPLASH_CURTAIN_CLOSE_MS = 700;
export const SPLASH_CURTAIN_HOLD_MS = 250;
export const SPLASH_CURTAIN_OPEN_MS = 900;
```

- `reveal()` solo actúa desde `idle` (`setPhase(cur => cur === "idle" ? "closing" : cur)`),
  así que R6 se cumple por construcción, no por un guard externo.
- Un único `useEffect` hace avanzar `closing → opening → done` con
  `setTimeout`. Con `prefers-reduced-motion` los tres tramos valen `0`.
- El bloqueo de scroll se ata a `!homeVisible`, no a `!revealed`: durante
  el cierre la página sigue tapada y dejarla desplazarse sería incoherente.

El **default del context es la fase `done`** (`revealed: true`,
`homeVisible: true`): cualquier consumidor montado sin
`<SplashGateProvider>` (los tests de `SketchSequence`, `Navbar`, etc.) se
comporta como si el splash nunca hubiera existido, sin obligar a envolver
cada test en el provider.

## `components/splash-curtain.tsx`

Dos `motion.div` hermanos dentro de un contenedor `fixed inset-0 z-50
overflow-hidden` marcado `aria-hidden` (es puro adorno) y
`pointer-events-none`.

```tsx
animate={{ x: phase === "closing" ? "0%" : panel.offset }}  // offset: -100% / +100%
```

- Se mantiene montada desde `idle` con `initial={false}`, en su posición
  de fuera de pantalla. Así el cierre es una transición reactiva normal y
  no depende de que Motion anime correctamente en el momento del montaje.
- Cada panel mide `calc(50% + 1px)`, no `50%`: con anchos de viewport
  impares, dos mitades exactas dejan una costura de subpíxel por la que se
  ve lo que hay debajo. El píxel extra hace que se solapen en el centro.
- Solo se anima `transform: translateX` (más `will-change: transform`): sin
  layout ni paint, igual que el resto de animaciones del proyecto.
- El color es el token `--curtain-gold` de `app/globals.css`, expuesto como
  utilidad `bg-curtain` vía `@theme inline`, para poder ajustarlo en un
  único sitio.

## `components/splash-section.tsx`

Vuelve a ser lo que era antes de la transición: un fondo **sin dividir**.

- Root `fixed inset-0 z-40 h-svh w-full overflow-hidden` (`z-40`, por
  debajo de la cortina en `z-50` y por encima del navbar en `z-30`).
- Una sola instancia de `SplashBackdrop` + el logo a plena opacidad.
- No anima nada al revelar: **lo tapa la cortina**. Lo único que cambia con
  `revealed` es que deja de rotar el fondo, para no gastar trabajo detrás
  del telón, y que el hint se desvanece (ya cumplió su función).

## `components/splash-overlay.tsx`

Compone las dos capas según la fase. Desmonta el splash al entrar en
`opening` — la cortina ya lo cubre por completo, así que el desmontaje es
invisible y evita animar dos capas a la vez.

```tsx
if (phase === "done") return null;
return (
  <>
    {phase !== "opening" && <SplashSection />}
    <SplashCurtain />
  </>
);
```

## `components/navbar.tsx`

`motion.nav` que entra con `opacity`/`y` cuando `homeVisible` pasa a
`true`. El retardo es `SPLASH_CURTAIN_OPEN_MS / 1000 - durationSeconds`:
entra *por detrás* de la cortina, de forma que ya está puesto en el
instante en que ésta termina de descubrir el borde superior de la página.
Con `prefers-reduced-motion`, retardo y duración pasan a `0` (si no, el
splash desaparecería al instante y el navbar tardaría casi un segundo en
aparecer — es el bug que se corrigió en la primera iteración).

## `components/sketch-sequence.tsx`

Cambio mínimo: `active = homeVisible && inView` en lugar de `inView` a
secas. Se conserva intacto el patrón de "ajustar estado durante el render
cuando cambia una señal externa"; solo cambia la señal comparada.

## `app/layout.tsx` / `app/page.tsx`

`layout.tsx` envuelve `<Navbar/>` y `{children}` en `<SplashGateProvider>`
y **sigue siendo Server Component**: `docs/architecture.md` prohíbe
`"use client"` en `layout.tsx`, no renderizar componentes cliente desde él.
`page.tsx` renderiza `<SplashOverlay/>` en lugar de `<SplashSection/>`.

## `app/globals.css`

- Token `--curtain-gold` + utilidad `--color-curtain` en `@theme inline`.
- `html.splash-locked, html.splash-locked body { overflow: hidden; }` — se
  bloquean ambos porque en iOS el scroll se propaga al documento si solo se
  bloquea uno.

---

## Alternativas descartadas

**Partir el fondo del splash en dos hojas que se separan (la versión
anterior de esta feature).** Cada hoja era medio viewport con
`overflow-hidden` y dentro una copia del fondo al `200%` anclada al borde
exterior, de modo que las dos mitades reconstruían la imagen. Funciona,
pero obliga a duplicar todo el stack de imágenes, a marcar una copia
`aria-hidden` para no duplicar el logo ante tecnología asistiva, y a
escopear cualquier aserción de test a una de las dos hojas. Con la cortina
como capa propia, el splash vuelve a ser una sola instancia de todo y la
animación queda en un componente que no sabe nada del contenido que tapa.

**Mantener `SplashSection` en el flujo del documento y animarlo "in situ"
con `position: sticky` + `scroll-snap`.** Acoplar la transición al *scroll
real* exige traducir la posición de scroll a progreso de animación
(`useScroll` + `useTransform`), lo cual reintroduce el problema que se
quiere evitar: un usuario que hace click no genera scroll, así que la
transición nunca arrancaría. El overlay `fixed` + "disparador de
intención" separa la señal ("el usuario quiere continuar") de la mecánica
del scroll, y funciona igual para scroll, touch, teclado o click.

**`AnimatePresence` con prop `exit`, desmontando por condición en el
padre.** Descartado por dos motivos: (1) el patrón estándar de Motion
(`motion://examples/react/exit-animation`) anima con `exit` un componente
cuya condición de montaje cambia en el padre en el mismo tick que el valor
que también leería `animate`; mezclar ambos depende de que React mantenga
vivo el consumidor de contexto durante el hold de salida, algo no
verificable de forma determinista en jsdom; (2) el propio repo ya descartó
depender de callbacks de finalización de animación de Motion en tests
(`specs/sketch-sequence/design.md`) por la misma razón. Una máquina de
fases con `setTimeout`, igual que `SketchSequence`, es determinista y se
controla con `vi.useFakeTimers()`.

**Dejar la cortina como un único panel que cae desde arriba.** Más simple,
pero pierde la simetría del gesto de apertura pedido (el telón se abre
hacia los lados, dejando ver primero el centro de la home, que es
justamente donde está el boceto).
