---
description: Agrega una nueva feature a feature_list.json siguiendo el schema del proyecto.
argument-hint: <descripción breve de la feature>
---

Vas a agregar una nueva entrada a `feature_list.json` a partir de esta
descripción del usuario:

$ARGUMENTS

Seguí estos pasos, en orden:

1. Lee `feature_list.json` completo.
2. Calculá el próximo `id` como `max(id existentes) + 1`.
3. Derivá un `name` en `kebab-case`, corto (2-4 palabras), a partir de la
   descripción. Debe ser único entre las features existentes.
4. Redactá:
   - `title`: título corto en español, legible para un humano.
   - `description`: una frase que explique qué hace la feature y por qué.
   - `acceptance`: entre 2 y 5 criterios de aceptación, uno por bullet.
     Cada criterio debe ser concreto y verificable por un test (evitá
     verbos blandos como "podría" o "debería funcionar bien") — van a
     alimentar directamente el `requirements.md` en notación EARS que
     redacta `spec_author` (ver `docs/specs.md`). Si la descripción del
     usuario es demasiado ambigua para derivar criterios verificables,
     NO inventes alcance: parás y le pedís al humano que aclare qué debe
     pasar exactamente.
5. Agregá la entrada al final del array `features` con:
   - `"status": "pending"`
   - `"sdd": true`
   (toda feature nueva en este repo pasa por Spec Driven Development,
   ver `AGENTS.md` §1 y §4).
6. Verificá que `feature_list.json` sigue siendo JSON válido después del
   cambio (sin comas colgantes, comillas balanceadas).
7. Mostrale al humano la entrada agregada y recordale el siguiente paso:
   pedirte que uses el subagente `leader` para arrancar el flujo SDD de
   esa feature (spec_author → aprobación humana → implementer → reviewer).

No toques ningún otro campo ni entrada existente de `feature_list.json`.
No crees specs ni código todavía — este comando solo da de alta la
feature en `pending`.
