# Convenciones de código

> Homogeneidad extrema. La IA predice mejor cuando el repositorio se parece
> a sí mismo en todas partes.

## Nombres

| Tipo                    | Convención        | Ejemplo               |
|-------------------------|-------------------|-----------------------|
| Constantes              | `UPPER_SNAKE`     | `DEFAULT_NOTES_PATH`  |
| Archivos de componente  | `kebab-case.tsx`  | `task-form.tsx`       |
| Componentes (export)    | `PascalCase`      | `export function TaskForm`  |

## Animaciones

Por defecto toda animación debe ser implementada con `motion` siguiendo las mejores prácticas definidas en `.claude/skills/motion` 

## Tests

Runner: `vitest` + `@testing-library/react` (ver `docs/architecture.md`).

- Un archivo de test por componente/módulo, en `tests/`, espejando la
  ruta de lo que testea: `components/task-form.tsx` → `tests/task-form.test.tsx`.
- Nombres de test descriptivos en `it("...")`, en inglés o español pero
  consistentes dentro del archivo: `it("adds a task when the form is submitted")`.

## Comentarios

Por defecto **no** se escriben. Solo se permiten cuando explican un *por qué*
no obvio (p. ej. workaround documentado, invariante sutil). Los nombres deben
hacer el resto.
