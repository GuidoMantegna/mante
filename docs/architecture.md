# Arquitectura — Qué significa "hacer un buen trabajo"

> Este documento define el estándar de calidad. Los agentes revisores
> evalúan código contra este archivo. Si no está aquí, no es un requisito.

## Stack

Next.js (App Router) + React + TypeScript estricto + Tailwind CSS.
Gestor de paquetes: `pnpm`. Sin backend propio: esta app es 100% cliente,
sin rutas de API ni base de datos.

## Estructura de carpetas

| Carpeta       | Contenido                                                        |
|---------------|-------------------------------------------------------------------|
| `app/`        | Rutas del App Router (`page.tsx`, `layout.tsx`, `globals.css`).   |
| `components/` | Componentes de UI reutilizables, uno por archivo, nombre de archivo en `kebab-case.tsx` (ej. `task-form.tsx`). Se crea cuando la primera feature lo necesita. |
| `tests/`      | Tests, con la misma estructura relativa que lo que testean.       |
| `docs/`       | Este documento y sus vecinos.                                     |
| `specs/`      | Specs Kiro-style por feature (ver `docs/specs.md`).                |

## Server vs Client Components

Por defecto los archivos de `app/` son Server Components. En cuanto un
componente necesita `useState`, `useEffect` o manejar eventos (`onClick`,
`onSubmit`, ...), se marca `"use client"` **en ese componente**, no en
`layout.tsx`. Patrón preferido: `app/page.tsx` importa un componente
cliente de `components/` que concentra la interactividad, en vez de
convertir la página entera en cliente.

## Estado

Sin librerías externas de manejo de estado (Redux, Zustand, etc.). Para
el scope de esta app el estado se resuelve con `useState` local y, cuando
una feature necesita persistencia entre recargas, `localStorage` leído/
escrito desde el componente cliente dueño de ese estado (sin backend ni
base de datos).

## Estilos

Tailwind con clases de utilidad directamente en el JSX. No se crean
archivos `*.module.css` salvo un caso que Tailwind no pueda resolver
razonablemente — y ese caso se documenta en el `design.md` de la feature.

## Tests

Runner: `vitest` + `@testing-library/react` (ver `docs/conventions.md`
para la convención de nombres). `pnpm test` corre la suite completa.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->