# Historial de sesiones

> Bitácora append-only. Cada sesión cerrada se agrega al final, nunca se
> reescribe una entrada existente.

---

## 2026-08-24 — `splash-section` (`id: 1`) → `done`

**Feature:** Sección Splash con transición de imágenes, basada en los frames
SPLASH de Figma (fileKey `xq6bGeZ1bS99w5FydB8lcP`).

**Flujo SDD completo:** `pending` → `spec-author` → `spec_ready` → ⏸ humano →
`in_progress` → `implementer` → `reviewer` (**aprobado**) → `done`.

**Entregables:**

- `specs/splash-section/{requirements,design,tasks}.md` — 22 requirements
  EARS (`R1`–`R22`), 35 tasks (`T1`–`T35`), todas `[x]`.
- `components/splash-section.tsx` — Client Component, tres capas
  `motion.div` (`motion/react`) con crossfade de opacidad (1200 ms, 0 con
  `prefers-reduced-motion`), rotación cada 3000 ms con `setInterval` +
  cleanup, logo `iso-logo-white.svg` superpuesto.
- `app/page.tsx` reducido a `<SplashSection />`, sigue siendo Server
  Component.
- `tests/splash-section.test.tsx` — 21 tests, uno por task, cubriendo los
  22 requirements. Infraestructura de test (`vitest` + `jsdom` +
  Testing Library) montada desde cero en esta feature (`T1`–`T4`).
- Rama `specs/splash-section`, creada desde `config`.

**Verificación:** `pnpm test` 21/21, `pnpm lint` 0 errores, `npx tsc --noEmit`
limpio, `pnpm build` OK. Verificación visual humana a 402/768/1512 px y
confirmación del breakpoint tablet `md` = 768 px (interpolación sin frame de
Figma de respaldo): **"visual OK"**, 2026-08-24.

**Bug de config resuelto en esta sesión:** el subagente `spec_author` no
cargaba (el loader rechaza `_` en `name:`). Renombrado a `spec-author` en
`.claude/agents/`, `AGENTS.md`, `docs/specs.md`, `.claude/agents/leader.md`
y `.claude/commands/add-feature.md`.

**Deuda no bloqueante para próximas sesiones:**

- `CHECKPOINTS.md` no existe en ninguna rama pese a estar referenciado en
  `AGENTS.md` §2 — el reviewer no pudo evaluar checkpoints. Crear el archivo
  o retirar la referencia.
- `R15` (`requirements.md`) y `design.md` §3.1 apuntan a nodos distintos
  para la clase `z-10` del logo — reconciliar redacción.
- `app/layout.tsx` conserva el metadata por defecto de "Create Next App"
  (fuera del alcance de esta feature).
- `vitest.config.ts` emite un warning de Vite por sintaxis ESM cargada como
  CommonJS — se resuelve con extensión `.mts` o `"type": "module"`.

Informes completos: `progress/impl_splash-section.md`,
`progress/review_splash-section.md`.
