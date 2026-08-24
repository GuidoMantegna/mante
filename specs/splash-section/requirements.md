# Requirements — `splash-section`

> Notación EARS estricta (ver `docs/specs.md`).
> Sujeto del sistema: el componente cliente `SplashSection`
> (`components/splash-section.tsx`) tal y como queda montado en `app/page.tsx`.
> Cada `R<n>` es verificable por al menos un test concreto en
> `tests/splash-section.test.tsx` (ver `tasks.md`).

## Vocabulario

- **capa de fondo**: elemento contenedor de una de las tres imágenes de fondo,
  identificable en el DOM por `data-testid="splash-layer"`.
- **capa activa**: la única capa de fondo con `data-active="true"`.
- **orden canónico**: `/images/splash-1.webp`, `/images/splash-2.webp`,
  `/images/splash-3.webp`, en ese orden.
- **sección raíz**: el elemento `<section>` de nivel superior del componente,
  identificable por `data-testid="splash-section"`.
- **capa del logo**: contenedor del logo, identificable por
  `data-testid="splash-logo-layer"`.

---

## R1
El sistema DEBE renderizar exactamente tres capas de fondo, expuestas en el
orden canónico mediante el atributo `data-src` de cada capa.

## R2
El sistema DEBE marcar, en el primer render, la capa de `/images/splash-1.webp`
como única capa activa.

## R3
CUANDO transcurren 3000 ms desde el último cambio de capa activa, el sistema
DEBE marcar como capa activa la siguiente capa del orden canónico.

## R4
CUANDO la capa activa es `/images/splash-3.webp` y transcurren 3000 ms, el
sistema DEBE marcar como capa activa `/images/splash-1.webp`.

## R5
SI transcurren menos de 3000 ms desde el último cambio de capa activa ENTONCES
el sistema NO DEBE cambiar la capa activa.

## R6
El sistema DEBE renderizar, dentro de cada capa de fondo, un elemento `<img>`
cuyo `src` resuelto contenga la ruta pública declarada en el `data-src` de esa
capa.

## R7
CUANDO `SplashSection` se desmonta, el sistema DEBE cancelar el temporizador de
rotación, de modo que no quede ningún temporizador activo.

## R8
El sistema DEBE aplicar como estilo inline `opacity: 1` a la capa activa y
`opacity: 0` a cada capa no activa.

## R9
El módulo `components/splash-section.tsx` DEBE importar sus primitivas de
animación desde el especificador `motion/react`.

## R10
SI el módulo `components/splash-section.tsx` importa desde `framer-motion`
ENTONCES el sistema DEBE considerarse incorrecto.

## R11
MIENTRAS el usuario NO tenga activada la preferencia
`prefers-reduced-motion: reduce`, el sistema DEBE declarar en cada capa de
fondo, mediante el atributo `data-crossfade-ms`, una duración de crossfade
estrictamente mayor que `0`.

## R12
MIENTRAS el usuario tenga activada la preferencia
`prefers-reduced-motion: reduce`, el sistema DEBE declarar en cada capa de
fondo, mediante el atributo `data-crossfade-ms`, una duración de crossfade
igual a `0`.

## R13
El sistema DEBE renderizar un elemento `<img>` cuyo `src` resuelto contenga
`/iso-logo-white.svg`.

## R14
El sistema DEBE exponer el logo con el texto alternativo `Manté`.

## R15
El sistema DEBE renderizar la capa del logo por encima de las capas de fondo,
declarando en ella la clase de apilamiento `z-10`.

## R16
El sistema DEBE declarar en la capa del logo un ancho del `88%` del contenedor
en el breakpoint base y del `67%` a partir del breakpoint `md`, acotado por un
ancho máximo de `1016px` (clases `w-[88%]`, `md:w-[67%]`, `max-w-[1016px]`).

## R17
El sistema DEBE declarar en el `<img>` del logo el ajuste `object-contain`.

## R18
El sistema DEBE declarar en la sección raíz una altura igual a la altura del
viewport (clase `h-svh`).

## R19
El sistema DEBE declarar en la sección raíz un ancho igual al ancho de su
contenedor (clase `w-full`).

## R20
SI la sección raíz declarase la clase `w-screen` ENTONCES el sistema DEBE
considerarse incorrecto.

## R21
El sistema DEBE declarar en la sección raíz el recorte de desbordamiento
(clase `overflow-hidden`).

## R22
El sistema DEBE declarar en el `<img>` de cada capa de fondo el ajuste
`object-cover`.

---

## Mapa de cobertura — acceptance criterion → `R<n>`

El array `acceptance` de la feature `id: 1` en `feature_list.json`, indexado
desde 1 en el orden en que aparece:

| # | Acceptance criterion (resumen)                                                     | Requirements que lo cubren            |
|---|------------------------------------------------------------------------------------|---------------------------------------|
| 1 | Fondo en loop continuo con splash-1/2/3, cambiando cada 3000 ms                     | R1, R2, R3, R4, R5, R6, R7            |
| 2 | Transición con Motion (`motion/react`), sin hard cut                               | R8, R9, R10, R11, R12                 |
| 3 | Logo `/iso-logo-white` superpuesto y visible en mobile, tablet y desktop            | R13, R14, R15, R16                    |
| 4 | Sección al 100% del viewport, sin scroll horizontal ni recorte de contenido         | R17, R18, R19, R20, R21, R22          |

Cobertura inversa (ningún `R<n>` huérfano):

- AC1 → R1, R2, R3, R4, R5, R6, R7
- AC2 → R8, R9, R10, R11, R12
- AC3 → R13, R14, R15, R16
- AC4 → R17, R18, R19, R20, R21, R22

R11 y R12 (`prefers-reduced-motion`) se adscriben a AC2 porque parametrizan la
duración de la misma transición que AC2 exige; su origen normativo adicional es
`docs/conventions.md` §Animaciones y `AGENTS.md` §1.4.
