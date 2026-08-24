# Verificación — Cómo demostrar que el trabajo funciona

> Regla de oro: **el agente no dice "funciona", lo demuestra**.
> Toda feature termina con evidencia ejecutable, no con afirmaciones.

## Niveles de verificación

### Nivel 1 — Tests unitarios (obligatorio)

Toda función pública en `app/` tiene al menos un test en `tests/` que:

1. Cubre el camino feliz.
2. Cubre al menos un camino de error si la función puede fallar.

### Nivel 2 — Test de integración (obligatorio para componentes de UI)

Todo componente de UI creado o modificado debe tener su test de integración.

### Nivel 3 — Trazabilidad de requirements (obligatorio para features con `"sdd": true`)

Cada `R<n>` de `specs/<name>/requirements.md` debe poder mapearse a al
menos un test concreto en `tests/`. El reviewer rechaza si falta cobertura.

El implementer documenta el mapa en `progress/impl_<name>.md`:

```markdown
## Trazabilidad
- R1 → `tests/task-form.test.tsx` › "agrega tarea con texto válido"
- R2 → `tests/task-form.test.tsx` › "no agrega tarea con texto vacío"
```

## Anti-patrones (no hacer)

- ❌ "He añadido el formulario, debería funcionar." → falta test ejecutable.
- ❌ Test que solo verifica que el componente renderiza sin lanzar
  excepción. → tiene que comprobar el resultado concreto (qué aparece
  en pantalla, qué cambió en el estado).
- ❌ `mock` de `localStorage` o del DOM. → usa `@testing-library/react`
  contra el componente real (jsdom ya provee un `localStorage` real).

## Verificación final antes de cerrar

Antes de reportar una feature como lista para review:

1. `pnpm test` corre en verde (0 fallos).
2. `pnpm lint` no reporta errores.
3. Cada `R<n>` del spec tiene su entrada en el mapa de trazabilidad de
   `progress/impl_<name>.md`.

Si alguno de estos tres pasos no se puede cumplir, la feature no pasa a
`done` — se documenta el bloqueo en `progress/current.md` con estado
`blocked` en `feature_list.json`.
