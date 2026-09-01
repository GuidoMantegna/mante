# Requirements — `splash-transition`

> Notación EARS estricta (ver `docs/specs.md`).
> Sujeto del sistema: el conjunto `components/splash-gate.tsx` (provider +
> hook + máquina de fases), `components/splash-curtain.tsx`,
> `components/splash-overlay.tsx`, `components/splash-section.tsx`
> (modificado) y `components/navbar.tsx` (modificado), tal y como quedan
> montados desde `app/layout.tsx` y `app/page.tsx`. Cada `R<n>` es
> verificable por al menos un test concreto en
> `tests/splash-transition.test.tsx` (ver `tasks.md`).

## Vocabulario

- **gate**: máquina de fases compartida, expuesta por
  `SplashGateContext`/`useSplashGate()`.
- **fase**: uno de `idle` (splash a la vista), `closing` (la cortina se
  cierra sobre el splash), `opening` (la cortina se abre y deja ver la
  home) o `done` (cortina desmontada).
- **disparador de revelado**: cualquiera de los eventos `wheel`,
  `touchmove`, `pointerdown`, `scroll` en `window`, o `keydown` con una
  tecla de la lista `Space`, `Enter`, `PageDown`, `ArrowDown`.
- **cortina**: capa opaca propia, independiente del splash, formada por dos
  paneles (`izquierda`, `derecha`) que entran desde los bordes hasta
  juntarse en el centro y luego vuelven a salir hacia los bordes.
- **home visible**: fase `opening` o `done`; el momento a partir del cual
  la `HomeSection` empieza a quedar a la vista.
- **bloqueo de scroll**: clase `splash-locked` en `document.documentElement`
  que impide el scroll del documento mientras la home no es visible.

---

## R1
El sistema DEBE renderizar `SplashSection` como una capa superpuesta de
posición fija (`fixed`) que cubre el 100% del viewport y se apila por
encima de `Navbar` y del resto del contenido.

## R2
CUANDO `SplashGateProvider` se monta en fase `idle`, el sistema DEBE
aplicar el bloqueo de scroll (`splash-locked`) a
`document.documentElement`.

## R3
CUANDO ocurre un disparador de revelado durante la fase `idle`, el sistema
DEBE pasar a la fase `closing`.

## R4
SI ocurre un evento `keydown` con una tecla que no pertenece a la lista de
disparadores (`Space`, `Enter`, `PageDown`, `ArrowDown`) ENTONCES el sistema
NO DEBE cambiar de fase.

## R5
MIENTRAS la fase sea `closing`, el sistema DEBE mantener el bloqueo de
scroll, y CUANDO la fase pasa a `opening` DEBE quitarlo de
`document.documentElement`.

## R6
SI la fase ya no es `idle` ENTONCES un disparador de revelado adicional NO
DEBE producir ningún efecto observable (ni reinicia la secuencia ni vuelve
a mostrar el splash).

## R7
El sistema DEBE renderizar el fondo del splash como una **única** capa sin
dividir (las tres capas de imagen, una sola copia): el splash NO DEBE
partirse en hojas.

## R8
El sistema DEBE renderizar la cortina como exactamente dos paneles opacos
(`data-testid="splash-curtain-panel"`, `data-side="left"` y
`data-side="right"`), apilados por encima del splash y marcados
`aria-hidden="true"` para no aportar nada a tecnología asistiva.

## R9
MIENTRAS la cortina se cierra (fase `closing`), el splash DEBE permanecer
inalterado — fondo completo y logo a plena opacidad — y solo DEBE
desmontarse una vez que la cortina lo cubre por completo (fase `opening`).

## R10
DONDE el usuario tiene activado `prefers-reduced-motion`, la duración de
las animaciones de cierre y apertura de la cortina y de la entrada de
`Navbar` (incluido su retardo) DEBE ser `0`.

## R11
El sistema DEBE mostrar un indicador ("hint") de scroll/click que aparece
tras un retardo mientras la fase es `idle`, y DEBE ocultarlo en cuanto se
dispara la transición.

## R12
MIENTRAS la home no sea visible (fases `idle` y `closing`), `SketchSequence`
NO DEBE iniciar el dibujado de su boceto activo, incluso si su contenedor
está en el viewport.

## R13
CUANDO la fase pasa a `opening` y el contenedor de `SketchSequence` está en
el viewport, el sistema DEBE iniciar el dibujado del boceto activo.

## R14
MIENTRAS la home no sea visible (fases `idle` y `closing`), `Navbar` DEBE
exponer `data-revealed="false"`.

## R15
CUANDO la fase pasa a `opening`, `Navbar` DEBE exponer
`data-revealed="true"`.

## R16
Los módulos `components/splash-gate.tsx`, `components/splash-curtain.tsx`,
`components/splash-overlay.tsx`, `components/splash-section.tsx` y
`components/navbar.tsx` DEBEN importar sus primitivas de animación desde el
especificador `motion/react`, y NO DEBEN importar desde `framer-motion`.

## R17
El sistema DEBE recorrer las fases `idle → closing → opening → done` en ese
orden, permaneciendo en `closing` durante
`SPLASH_CURTAIN_CLOSE_MS + SPLASH_CURTAIN_HOLD_MS` y en `opening` durante
`SPLASH_CURTAIN_OPEN_MS`, y DEBE desmontar la cortina al llegar a `done`.
