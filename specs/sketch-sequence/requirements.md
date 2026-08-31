# Requirements — `sketch-sequence`

> Notación EARS estricta (ver `docs/specs.md`).
> Sujeto del sistema: el componente cliente `SketchSequence`
> (`components/sketch-sequence.tsx`) tal y como queda montado en
> `components/home-section.tsx`, reemplazando el `KitchenSketch` fijo actual.
> Cada `R<n>` es verificable por al menos un test concreto en
> `tests/sketch-sequence.test.tsx` (ver `tasks.md`).

## Vocabulario

- **secuencia**: lista ordenada de bocetos (`sketches`) recibida por `SketchSequence`,
  cada uno con `paths`, `viewBox`, `strokeWidth` y `title` (tipo `Sketch`).
- **boceto activo**: el elemento de `sketches` en el índice `activeIndex`.
- **fase**: estado de animación del boceto activo, uno de `"hidden" | "visible" | "erased"`,
  expuesto en el DOM vía `data-phase` del contenedor `data-testid="sketch-sequence"`.
- **dibujar**: animar `pathLength` de cada trazo del boceto activo de `0` a `1`, en el
  orden original de sus `paths`.
- **desdibujar**: animar `pathLength` de cada trazo del boceto activo de `1` a `0`, en
  orden inverso al de dibujado (el último trazo dibujado es el primero en desdibujarse).
- **tiempo total de dibujado**: duración fija (prop `durationMs`, default 3000 ms) que
  tarda cualquier boceto en dibujarse por completo, sin importar su cantidad de trazos.
- **tiempo de sostenido**: `holdMs` (default 2000 ms), tiempo que el boceto activo
  permanece completamente dibujado antes de empezar a desdibujarse.

---

## R1
CUANDO el contenedor de `SketchSequence` entra en el viewport (al menos 30% visible),
el sistema DEBE iniciar el dibujado del boceto en el índice `0` de `sketches`.

## R2
MIENTRAS el boceto activo no sea el último de `sketches` y hayan transcurrido
`durationMs + holdMs` desde que comenzó a dibujarse, el sistema DEBE iniciar el
desdibujado de ese boceto.

## R3
El sistema DEBE ejecutar el desdibujado del boceto activo en una duración total igual a
la mitad de `durationMs`.

## R4
El sistema DEBE desdibujar los trazos del boceto activo en orden inverso al orden en que
fueron dibujados.

## R5
CUANDO termina el desdibujado del boceto activo, el sistema DEBE avanzar `activeIndex`
al siguiente boceto de `sketches` e iniciar su dibujado.

## R6
SI el boceto activo es el último de `sketches` ENTONCES, al terminar de dibujarse, el
sistema NO DEBE programar ningún desdibujado ni avance de índice: el boceto permanece
fijo y completamente dibujado.

## R7
El sistema DEBE completar el dibujado de cualquier boceto de la secuencia en el mismo
tiempo total (`durationMs`), independientemente de su cantidad de trazos.

## R8
CUANDO el contenedor de `SketchSequence` sale del viewport, el sistema DEBE reiniciar el
estado a `activeIndex = 0` y fase `"hidden"`, cancelando cualquier temporizador
pendiente.

## R9
CUANDO el contenedor de `SketchSequence` vuelve a entrar en el viewport después de haber
salido, el sistema DEBE reiniciar la secuencia completa desde el primer boceto (mismo
comportamiento que R1).

## R10
DONDE el usuario tiene activado `prefers-reduced-motion`, el sistema DEBE renderizar
únicamente el último boceto de `sketches`, completo (`pathLength: 1` en todos sus
trazos) y sin programar ningún temporizador.

## R11
CUANDO `SketchSequence` se desmonta, el sistema DEBE cancelar cualquier temporizador
activo, de modo que no quede ninguno pendiente.

## R12
El módulo `components/sketch-sequence.tsx` DEBE importar sus primitivas de animación
desde el especificador `motion/react`, y NO DEBE importar desde `framer-motion`.

## R13
El sistema DEBE aceptar cualquier cantidad de bocetos (mínimo 1) en la prop `sketches` y
recorrerlos en orden, sin requerir cambios en la lógica de orquestación al agregar o
quitar bocetos.
