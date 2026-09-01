# Tasks — `splash-transition`

## Iteración 1 — efecto *doors* sobre el propio splash (superada)

Las tareas T1–T11 de la primera iteración quedaron completas y verificadas
(ver `progress/history.md`). La iteración 2 sustituye el mecanismo: el
splash deja de partirse y la apertura pasa a una cortina propia.

## Iteración 2 — cortina que se cierra sobre el splash y se abre sobre la home

- [x] T1 — Reescribir `components/splash-gate.tsx` como máquina de fases
      `idle → closing → opening → done`: exportar
      `SPLASH_CURTAIN_CLOSE_MS`/`HOLD`/`OPEN`, exponer
      `{ phase, revealed, homeVisible, reveal }` (default del context en
      fase `done`), avanzar con `setTimeout` (0 ms con
      `prefers-reduced-motion`) y atar el bloqueo de scroll a
      `!homeVisible`. Cubre: R2, R3, R4, R5, R6, R10, R17.

- [x] T2 — Crear `components/splash-curtain.tsx`: contenedor
      `fixed inset-0 z-50 overflow-hidden` `aria-hidden` +
      `pointer-events-none`, con dos `motion.div`
      (`data-testid="splash-curtain-panel"`, `data-side`) de
      `w-[calc(50%+1px)]` que animan `x` entre `0%` y `±100%` según la
      fase, con `data-duration-ms` para las aserciones. Cubre: R8, R10, R16.

- [x] T3 — Revertir `components/splash-section.tsx` a un fondo único sin
      dividir: root `z-40`, una sola `SplashBackdrop`, logo a plena
      opacidad sin fade, hint que se desvanece al disparar; retirar
      `SPLASH_DOOR_*`/`SPLASH_LOGO_FADE_MS`. Cubre: R1, R7, R9, R11, R16.

- [x] T4 — Reescribir `components/splash-overlay.tsx` para componer splash
      y cortina según la fase: `null` en `done`, splash montado salvo en
      `opening`, cortina siempre mientras no sea `done`. Cubre: R9, R17.

- [x] T5 — `components/navbar.tsx`: consumir `homeVisible` en lugar de
      `revealed` y calcular el retardo como
      `SPLASH_CURTAIN_OPEN_MS / 1000 - durationSeconds`. Cubre: R14, R15, R10.

- [x] T6 — `components/sketch-sequence.tsx`: `active = homeVisible &&
      inView`. Cubre: R12, R13.

- [x] T7 — `app/globals.css`: token `--curtain-gold` + utilidad
      `--color-curtain` en `@theme inline`. Cubre: R8.

- [x] T8 — `tests/splash-section.test.tsx`: simplificar `getLayers()` a
      `screen.getAllByTestId("splash-layer")` (ya no hay dos hojas que
      escopear). Ningún `R<n>` de `specs/splash-section/` cambia de
      significado.

- [x] T9 — Reescribir `tests/splash-transition.test.tsx` para R1–R17:
      disparadores, fases, bloqueo/desbloqueo de scroll, fondo único sin
      hojas, dos paneles opacos `aria-hidden` por encima del splash,
      splash intacto durante el cierre y desmontado al quedar tapado,
      duraciones a 0 con reduced motion, navbar y `SketchSequence`
      atados a `homeVisible`, secuencia completa de fases con desmontaje.
      Cubre: R1–R17.

- [x] T10 — `pnpm test`, `pnpm lint`, `npx tsc --noEmit` y `pnpm build` en
      verde; verificación manual en Chromium (normal y reduced motion);
      actualizar `progress/impl_splash-transition.md`. Cubre: todos.
