# Sesión actual

> Este archivo se vacía al cerrar cada sesión y se mueve a `history.md`.
> Mientras trabajas, **mantenlo actualizado en tiempo real**, no al final.

## Feature: sections-scroll-reveal (id 7, sdd: false)

Agrega `components/scroll-reveal.tsx`, un componente cliente reutilizable con
Motion que cubre dos gestos de scroll reveal (una sola vez, con `useInView` +
`once: true`):

- `variant="rise"` (default): traslada el contenido desde `translateY(32px)`
  hasta su posición original. Aplicado a los dos hijos de `.section-left-content`
  en `HomeSection`, `ProjectsSection` y `AboutSection`, y a los bloques
  principales de `ContactSection` (título, ubicación, redes, formulario), con
  stagger de 120ms entre bloques.
- `variant="scale"`: de `scale(1.06)` a `scale(1)`. Aplicado a la imagen de
  `AboutSection` y a la galería de `ProjectsSection`, envueltas en un
  `<div className="absolute inset-0 overflow-hidden">` local (no se tocó
  `.section-right` en `globals.css`) para que el zoom nunca desborde.

`HomeSection` queda gateado por `useSplashGate()` (`homeVisible`): el reveal no
se dispara hasta que la cortina del splash termina de abrirse, mismo patrón que
`SketchSequence`.

Con `prefers-reduced-motion`, el contenido se muestra directo en su estado
final (sin depender del IntersectionObserver).

### Estado

- Componente + 4 secciones actualizadas.
- `feature_list.json`: entrada id 7 agregada, `status: "in_progress"`.
- Tests nuevos: `tests/scroll-reveal.test.tsx` (8 tests, todos verdes).
- `pnpm test`: 106 passed / 12 failed — los 12 son **debt preexistente**, no
  relacionado con esta feature (verificado corriendo el baseline antes de
  tocar código):
  - `tests/projects-section.test.tsx` (11 tests): los botones de tipo de
    proyecto se etiquetan `PLACARDS` en el componente pero los tests buscan
    `PLACARES` (typo). No es la falla documentada en `history.md`
    (`underline`) — parece haber cambiado desde la última sesión registrada.
  - `tests/splash-transition.test.tsx` (1 test): espera clases `bg-curtain`
    que el componente ya no renderiza (sí documentado en `history.md`).
- `pnpm lint` y `tsc --noEmit`: limpios.
- Verificación visual: no se pudo tomar screenshot propio (no hay
  `chromium-cli` ni Playwright instalado en el entorno). Se confirmó en su
  lugar que el dev server del usuario (puerto 3000, sesión ya abierta en su
  navegador) recompiló los cambios sin errores de compilación ni de consola
  (`.next/dev/logs/next-development.log`). **Pendiente**: que el usuario
  confirme visualmente el resultado en su navegador ya abierto.

### Pendiente / para la próxima sesión

- Si el usuario aprueba el resultado visual: marcar feature 7 como `done` y
  mover este resumen a `progress/history.md`.
- Los 11 fallos de `projects-section.test.tsx` por el typo `PLACARES` vs
  `PLACARDS` quedan fuera de scope de esta feature — reportar al usuario para
  que decida si se corrige en otra sesión.

## Menú mobile (navbar) — implementación directa, sin fase de spec

> El usuario pidió explícitamente saltar SDD para esta pieza ("Direct
> implementation"), por lo que **no** se agregó entrada a `feature_list.json`
> ni `specs/mobile-menu/`. Se implementó sobre la rama `navbar` en paralelo a
> la feature 7 (todavía `in_progress`), también por indicación explícita del
> usuario.

Agrega el botón hamburguesa y el panel de menú full-screen para mobile/tablet
(`< lg`, 1024px), replicando los frames `NAVBAR` (mobile, node `131:515`) y
`HOME-mobile-menu` (node `8:369`) del archivo Figma `xq6bGeZ1bS99w5FydB8lcP`.

- `components/ui/menu-toggle.tsx` (nuevo): botón hamburguesa → X en dos
  tramos con Motion (`variants` + `custom` por línea): 1) las tres líneas
  convergen al centro vertical (`MENU_ICON_COLLAPSE_MS`, 140ms), 2) la
  superior/inferior rotan ±45° formando la X mientras la del medio se
  desvanece (`MENU_ICON_ROTATE_MS`, 160ms). El cierre reproduce ambos tramos
  en orden inverso (delays intercambiados por propiedad en las variants
  `open`/`closed`), no un crossfade.
- `components/ui/mobile-menu.tsx` (nuevo): panel `fixed inset-0 z-20 bg-dark`,
  hermano de `motion.nav` (no hijo — `motion.nav` anima `y` y tiene
  `backdrop-blur-xs`, cualquiera de los dos vuelve `fixed` relativo a él).
  Tramo 1: wipe izquierda→derecha con `clipPath` (`MENU_PANEL_MS`, 300ms).
  Tramo 2: los 4 links (`INICIO/PROYECTOS/NOSOTROS/CONTACTO`) aparecen en
  cascada izquierda→derecha (`staggerChildren`, `MENU_LINK_STAGGER_MS` 60ms)
  recién cuando el wipe termina (`delayChildren: panelSeconds`). Cierre:
  reversa exacta (`staggerDirection: -1` en los links, delay del panel
  esperando a que los links terminen de salir). Permanece montado siempre
  (sin `AnimatePresence`, no se usa en este repo) con `inert`/`aria-hidden`
  cuando está cerrado.
- `components/ui/navbar.tsx` (modificado): `<ul>` desktop pasa a
  `hidden lg:flex`; se agrega `<MenuToggle className="lg:hidden">` y se
  renderiza `<MobileMenu>` como hermano de `motion.nav` (fragment). Estado
  `menuOpen` + `open = menuOpen && revealed` (evita cerrar por efecto/
  cascading-render, ver nota de lint abajo). Mientras está abierto: se quita
  `border-b`/`backdrop-blur-xs` de la barra y se oculta el logo (el mock no
  los muestra sobre el panel oscuro). Cierra con Escape y con click en
  cualquier link. Bloquea scroll con una clase propia `menu-open` (no
  reutiliza `splash-locked`, para que ambos dueños no compitan por la misma
  clase) — regla nueva en `app/globals.css`.
- Mantiene intactos `data-testid="navbar"`, `data-revealed`,
  `data-delay-seconds`, `data-duration-seconds` (asertados por
  `tests/splash-transition.test.tsx`, que además lee el source de
  `ui/navbar.tsx` con `readFileSync`).
- Nota de lint: la primera versión reseteaba `menuOpen` a `false` en un
  `useEffect` cuando `revealed` pasaba a `false` → `react-hooks/set-state-in-effect`
  (`eslint-config-next`). Se resolvió derivando `open = menuOpen && revealed`
  en el render en vez de sincronizar estado con un efecto.

### Estado

- 3 componentes nuevos/modificados + regla CSS nueva.
- Tests nuevos: `tests/menu-toggle.test.tsx` (6), `tests/mobile-menu.test.tsx`
  (6), `tests/navbar.test.tsx` (7) — los 19 en verde. La suite de
  `mobile-menu.test.tsx` usa `hasAttribute("inert")` en vez de la propiedad
  IDL `.inert`: jsdom no la implementa (confirmado con un repro aislado),
  aunque sí refleja el atributo HTML.
- `pnpm test`: **127 passed / 9 failed**. Los 9 son debt preexistente, no
  tocado por este trabajo:
  - `tests/projects-section.test.tsx` (8 tests): ahora fallan por
    `.jpg` vs `.png` en los `src` esperados — **distinto** del typo
    `PLACARES`/`PLACARDS` que documentó la sesión de la feature 7 (que
    reportaba 11 fallos ahí). El componente parece haber cambiado de
    extensión de imagen entre sesiones; no se tocó nada de
    `projects-section` en este trabajo.
  - `tests/splash-transition.test.tsx` (1 test): sigue esperando la clase
    `bg-curtain` ya removida (mismo fallo documentado arriba para feature 7).
- `pnpm lint` y `npx tsc --noEmit`: limpios.
- Verificación visual: mismo entorno que la feature 7, sin `chromium-cli` ni
  Playwright disponibles para tomar screenshot propio. Se confirmó que el
  dev server del usuario (puerto 3000, ya corriendo) recompiló
  `components/ui/navbar.tsx` varias veces sin errores de compilación ni de
  consola (`.next/dev/logs/next-development.log`, solo warnings preexistentes
  de aspect-ratio en `<Image>` que ya existían para `logo-accent.svg` en
  `about-section.tsx`/`contact-section.tsx`/`home-section.tsx`).
  **Pendiente**: que el usuario confirme visualmente el resultado (apertura/
  cierre del botón y del panel en `< 1024px`) en su navegador.

### Pendiente / para la próxima sesión

- Confirmación visual del usuario en mobile/tablet real (`< lg`).
- Decidir si esta feature se documenta retroactivamente en
  `feature_list.json`/`specs/` o si queda fuera del flujo SDD para siempre
  (el usuario pidió explícitamente saltarlo esta vez).
- El drift de `projects-section.test.tsx` (`.jpg`/`.png`) es nuevo debt a
  reportar; no se investigó su causa porque es ajeno a este cambio.

### Fix: apilamiento por z-index en vez de ocultar la barra con clases

El usuario reportó que, al cerrar el menú, la barra volvía a mostrarse
(`border-b`, logo) **antes** de que el panel terminara su propia animación de
cierre — el botón/borde de la barra se mezclaban visualmente con el panel
todavía visible. Causa: `border-b`/`backdrop-blur-xs`/opacidad del logo se
alternaban con clases instantáneas atadas a `open`, sin relación con la
duración real del wipe (`MENU_PANEL_MS` + stagger de los links) del panel.

Solución (propuesta por el usuario, de acuerdo): apilar por z-index en vez de
alternar clases.

- `components/ui/navbar.tsx`: `<motion.nav>` baja a `z-10` y **ya no cambia
  su propio aspecto** (`border-b`/`backdrop-blur-xs` quedan fijos, el logo ya
  no alterna opacidad). El panel opaco la tapa/destapa físicamente al
  abrir/cerrar, en el mismo tiempo que dura su propio wipe — no hay una
  segunda animación que sincronizar a mano.
- `components/ui/mobile-menu.tsx`: sigue en `z-20` (sin cambios de código,
  solo relativo a la nueva base de la barra).
- El botón (`MenuToggle`) se sacó de adentro de `<motion.nav>` y ahora es un
  `<motion.div fixed z-30>` hermano, con el mismo reveal (`opacity`/`y`) que
  la barra. Motivo: `motion.nav` anima `opacity`/`y` y por lo tanto **crea su
  propio stacking context** (transform ≠ none) — un `z-30` puesto en un hijo
  suyo queda confinado a ese contexto y nunca puede superar a un hermano
  externo (el panel, `z-20`) sin importar el valor del número. Posicionado
  con `top-4 right-4` para calzar con el `p-4` que ya tenía la barra.
- Ladder final: navbar `z-10` < mobile-menu `z-20` < menu-toggle `z-30` <
  splash `z-40` < curtain `z-50` (splash/curtain sin tocar).
- Test nuevo en `tests/navbar.test.tsx`: "stacks the bar behind the menu
  panel and the toggle above it, and never changes its own chrome" — fija
  los tres z-index y confirma que `border-b`/`backdrop-blur-xs` de la barra
  no cambian al abrir el menú (regresión del bug reportado).

`pnpm test`: **128 passed / 9 failed** (mismo debt preexistente de siempre,
sin cambios). `pnpm lint` y `tsc --noEmit`: limpios. Dev server recompiló sin
errores (`.next/dev/logs/next-development.log`).

### Fix: el toggle no se puede anidar dentro de `<motion.nav>`, pero sí puede compartir su fila

El usuario pidió volver a meter `MenuToggle` como hijo de la barra para
evitar el desalineo del `top-4 right-4` fijo a mano. No es posible
literalmente: `position: fixed` **siempre** crea su propio stacking context
(con o sin transform/opacity animados — no es un efecto secundario de Motion,
es la regla del spec para `fixed`/`sticky`), así que un descendiente de
`<motion.nav>` queda atrapado en el mismo contexto de apilamiento que la
barra entera y ningún z-index interno puede hacerlo pintar por encima de un
hermano externo (el panel) si la barra en sí sigue por debajo — es la misma
razón por la que se sacó en el fix anterior, un nivel más profundo.

En vez de eso, el toggle pasó a vivir en su **propia fila `fixed`**, hermana
de `<motion.nav>`, que comparte con ella la constante `NAV_ROW_CLASS =
"fixed w-full p-4 lg:px-8"` (mismo ancho y padding) y usa `justify-end` para
pegarse al borde derecho — alineación real por flexbox, no un offset en
píxeles adivinado, así que sigue cualquier cambio futuro de `p-4`/`lg:px-8`
en la barra sin tocar el toggle. La fila entera es `pointer-events-none`
(para no tapar clicks sobre el logo/los links de la barra debajo suyo) y solo
el botón recupera `pointer-events-auto` — vía la prop `className` que
`MenuToggle` ya exponía — cuando `revealed` es true.

`pnpm test`: sigue en **128 passed / 9 failed** (mismo debt, sin cambios).
`pnpm lint` y `tsc --noEmit`: limpios.

## Galería de proyectos: mosaico + lightbox — implementación directa, sin fase de spec

> El usuario eligió explícitamente implementación directa (mismo criterio que
> el menú mobile), así que **no** se agregó entrada a `feature_list.json` ni
> `specs/projects-gallery/`. Rama `projects-new`.

Reemplaza la galería de una sola imagen a pantalla completa (rotación
automática cada 3s + crossfade) por un **mosaico de las 6 imágenes del tipo
activo**, con **lightbox** que amplía la foto desde su propio tile.

- `components/projects-grid.tsx` (nuevo): grid `grid-cols-5 grid-rows-3` con
  spans `2/3/3/2/2/3` — cada fila suma 5, que es lo que produce el mosaico
  asimétrico del mock (angosto/ancho · ancho/angosto · angosto/ancho). Las
  clases de span salen de un `Record` con los literales escritos: Tailwind
  escanea el texto fuente y `col-span-${n}` no se detectaría.
  Fallback de carga **por tile**: un `Set` de srcs ya cargados alimentado por
  el `onLoad` de `next/image`; mientras falta, el tile muestra un esqueleto
  `animate-pulse` y la imagen está en `opacity-0`. El `Set` **no se vacía** al
  cambiar de tipo (es cache: volver a un tipo visitado no vuelve a parpadear).
  Los tiles se keyean por `src`, no por índice, para que al cambiar de tipo se
  monten `<img>` nuevos en vez de mutar el `src` de los existentes.
- `components/image-lightbox.tsx` (nuevo): diálogo `fixed inset-0 z-40`
  (ladder: navbar 10 < mobile-menu 20 < menu-toggle 30 < **lightbox 40** <
  splash 40/cortina 50 — el splash ya no está en pantalla cuando esto se abre).
  Cierra con Escape, click en el fondo y botón; mueve el foco al botón de
  cerrar y lo devuelve al tile; bloquea el scroll con `html.lightbox-open`.
- `components/sections/projects-section.tsx`: datos nuevos (6 imágenes por
  tipo desde `/images/projects/new`, con `alt` descriptivo — dejaron de ser
  decorativas), estado `selected`, y borrado de `useRotatingIndex`,
  `CrossfadeGallery`, `useInView`, `PROJECT_IMAGES`, `TYPE_OFFSETS`,
  `PROJECTS_INTERVAL_MS` y `PROJECTS_CROSSFADE_MS`. `CrossfadeGallery` y
  `useRotatingIndex` siguen intactos en el repo: los usa el splash.
- `app/globals.css`: regla `html.lightbox-open` + `scrollbar-gutter: stable`.
- `priority` en una sola imagen (índice 0 del tipo inicial); todo el resto
  `loading="lazy"`. La sección es el segundo viewport y el splash bloquea el
  scroll, así que no es candidata a LCP. Al cambiar de tipo no se precarga
  nada: el cambio es a pedido del usuario y ya está cubierto por el esqueleto.

### Por qué NO se usó `AnimatePresence` (aunque la transición sí es `layoutId`)

El plan arrancó con `layoutId` + `AnimatePresence`, que es el patrón canónico
del ejemplo *Animate view (App Store)* de motion.dev. **No funciona acá**: al
cerrar, el modal nunca se desmontaba (test colgado a 5s, no un timeout corto).

Causa, leída en `framer-motion/dist/es/motion/features/layout/MeasureLayout.mjs`:
cuando un nodo con `layoutId` sale y hay otro miembro vivo en el mismo stack
(el tile del grid), `projection.relegate()` le cede a **ese otro** la
responsabilidad del `safeToRemove`. El tile no está dentro de ningún
`AnimatePresence`, así que su `usePresence()` devuelve `safeToRemove:
undefined` y nadie llega a desmontar el modal. Verificado por bisección:
sacando el `layoutId` el desmontaje ocurre en 238ms; con él no ocurre nunca.

La solución resultó además más simple y más alineada con el repo: **el
`layoutId` no necesita `AnimatePresence`**. El vuelo de ida se dispara cuando
el marco monta (`promote()`) y el de vuelta cuando desmonta
(`scheduleCheckAfterUnmount()` promueve al tile que queda). Así que:

- el **root del lightbox y el backdrop quedan siempre montados**, con
  `inert`/`aria-hidden`/`pointer-events-none` y opacidad animada cuando está
  cerrado — exactamente el idiom de `ui/mobile-menu.tsx`;
- **sólo el marco de la imagen monta y desmonta**, que es lo único que el
  `layoutId` necesita.

Resultado: el repo sigue sin usar `AnimatePresence` en ningún lado, el
desmontaje es determinista y los tests no dependen del rAF de Motion.

### Otras notas de implementación

- `priority` en Next 16 **no** setea `fetchPriority="high"` en el `<img>`; deja
  el `loading` sin declarar (= `eager` por default) e inyecta el preload. El
  test asserta la ausencia de `loading`, no un `fetchPriority` que no existe.
- El `onLoad` de `next/image` pasa por una cadena de promesas interna
  (`img.decode()`), así que en tests hay que hacer
  `await act(async () => fireEvent.load(img))`. Verificado con un spike.
- El lightbox se renderiza **fuera de todo `<ScrollReveal>`**: `ScrollReveal`
  emite siempre un `transform` (`scale(1)` incluso ya revelado) y un elemento
  transformado es bloque contenedor de sus descendientes `position: fixed` —
  adentro, el `fixed inset-0` se resolvería contra el wrapper y no contra el
  viewport.
- La galería dejó de ser un overlay `absolute inset-0` y pasó a flujo normal
  (`flex-1 min-h-0` dentro de `.section-right`): el absolute se posicionaba
  contra el padding box y pisaba el `padding: 0 30px` de ≥1024px, algo que no
  se notaba con una imagen full-bleed pero sí con un mosaico.

### Estado

- 2 componentes nuevos, 1 modificado, 1 regla CSS nueva.
- Tests: `tests/projects-grid.test.tsx` (14), `tests/image-lightbox.test.tsx`
  (18), `tests/projects-section.test.tsx` (19, reescrito) — los 51 en verde.
- `pnpm test`: **166 passed / 1 failed**. Baseline antes de esta sesión era
  128 passed / 9 failed. Los 8 fallos de `projects-section.test.tsx` (esperaban
  `.png` y las clases `underline`/`text-2xl`) quedaron **liquidados** por la
  reescritura. El único fallo restante es el debt ajeno ya documentado:
  `tests/splash-transition.test.tsx` espera la clase `bg-curtain` que el
  componente ya no renderiza.
- `npx tsc --noEmit` limpio. `npx eslint` limpio en todo lo tocado; quedan 9
  errores `react/no-unescaped-entities` **preexistentes** en
  `components/reviews.tsx` (comillas sin escapar), ajenos a este trabajo.
- `npx next build`: compila y prerenderiza sin errores.
- Dev server (puerto 3000) sirve el mosaico con las 6 imágenes nuevas y el
  patrón de spans `2/3/3/2/2/3` correcto; sin errores en
  `.next/dev/logs/next-development.log` (sólo los warnings preexistentes de
  aspect-ratio de los logos SVG).

### Pendiente / para la próxima sesión

- **Confirmación visual del usuario** (no hay screenshot tooling en este
  entorno): el mosaico a 375/768/1024/1440px, y sobre todo que el lightbox
  salga desde el tile y vuelva al mismo tile, probándolo también con la página
  scrolleada y no sólo con la sección centrada.
- Las imágenes nuevas traen dos originales muy pesados:
  `public/images/projects/new/cocina-6.jpg` **5.7 MB** y `placard-2.jpg`
  **3.3 MB** (el resto va de 35 KB a 1.4 MB). `next/image` sirve derivadas
  optimizadas, así que el usuario final no las baja, pero los originales
  viajan en el repo y la primera transformación en dev es lenta. Conviene
  re-exportarlas; no se hizo acá.
- Las 9 imágenes viejas de `public/images/projects/*` quedaron en el repo, ya
  sin referencias. Limpieza aparte.
- `app/globals.css:149` tiene `@media (height >= 750)` sin unidad — CSS
  inválido, ese bloque nunca aplica. Preexistente, no se tocó.

---

## Iteración 2 — el lightbox vuela como una sola imagen

### Feedback del usuario

> "Se siente un intervalo o parpadeo entre que la imagen empieza a escalar y
> llega a su punto final en el centro con fondo negro. Modifica el efecto para
> que sea la misma imagen en todo su recorrido la que se agranda/achica.
> Además quita el botón de cerrar y haz que se cierre haciendo click en
> cualquier parte de la pantalla."

### Diagnóstico del parpadeo

Cuatro causas acumuladas, todas verificables leyendo el código y la doc de
Motion (`motion://docs/react/react-layout-animations`):

1. **El marco arrancaba el vuelo vacío.** El tile pedía su derivada con
   `sizes` de ~300–450px y el modal con `sizes="92vw"` → **URLs distintas** del
   optimizador de Next. Al abrir, la imagen grande todavía no estaba
   descargada, así que el nodo *lead* del `layoutId` pintaba un marco vacío y
   la foto "aparecía" recién al final. Ese era el parpadeo principal.
2. **Crossfade de dos nodos.** La doc lo dice explícitamente: *"If the original
   component is still on the page when the new one enters, they will
   automatically crossfade."* El tile seguía montado, así que durante el vuelo
   había **dos** imágenes superpuestas con encuadres distintos (el recorte del
   tile estirado contra el recorte del marco comprimido) — doble exposición.
3. **`overflow-hidden` en el `<button>` del tile.** El nodo *follow* se proyecta
   a la caja compartida pero lo recortaba su ancestro: la copia del tile
   desaparecía a los pocos ms de empezar a crecer. Lo mismo recortaba el vuelo
   **de vuelta**, que Motion renderiza sobre el nodo del tile, no sobre el marco.
4. **`object-cover` (tile) → `object-contain` (modal).** Encuadres distintos en
   los dos extremos: aunque no hubiera crossfade, el contenido saltaba.

### Cambios

- **`image-lightbox.tsx`**
  - El marco apila dos `<Image>`: una miniatura con **el mismo `sizes` del tile
    de origen** (misma URL optimizada → sale de la caché del navegador, el vuelo
    nunca arranca vacío) y encima la grande, que hace fade-in al cargar. Prop
    nueva `thumbnailSizes`; sin ella la grande se muestra desde el principio.
  - `object-contain` → `object-cover`, igual que el tile: encuadre continuo.
  - La raíz `fixed` pasa a `motion.div` con **`layoutRoot`** — es lo que la doc
    pide para medir bien dentro de contenedores fijos teniendo en cuenta el
    scroll de la página.
  - `borderRadius` por `style` (y no por clase) en marco y tile: es la única
    forma de que Motion corrija su distorsión al escalar.
  - **Se elimina el botón de cerrar.** La raíz recibe `onClick={onClose}`, así
    que cierra desde cualquier punto, la foto incluida. Afordancia
    `cursor-zoom-out`. Escape sigue funcionando; el foco ahora va al propio
    diálogo (`tabIndex={-1}`) y el `Tab` lo mantiene ahí.
- **`projects-grid.tsx`**
  - Prop nueva `hiddenSrc`: el tile de la imagen abierta **no renderiza su nodo
    compartido**. Así el `layoutId` tiene un único miembro y no hay crossfade —
    es literalmente la misma imagen la que se agranda y se achica.
  - El nombre accesible se movió al `<button>` (`aria-label`), porque la imagen
    de adentro desaparece mientras vuela.
  - `overflow-hidden` se movió del `<button>` al nodo compartido; el tile
    conserva `rounded-lg`.
  - `cursor-zoom-in` en el tile.
- **`projects-section.tsx`**
  - Se quitó `overflow-hidden` del wrapper del `ScrollReveal` de la galería: al
    igual que el del botón, recortaba el vuelo de vuelta. El `scale(1.06)` de
    entrada del reveal se desborda ~3% por lado dentro del padding de
    `.section-right`, sin efecto visible.
  - Pasa `hiddenSrc` y `thumbnailSizes={tileSizes(selected)}`.

### Por qué sigue sin `AnimatePresence`

Sin cambios respecto a la iteración 1: el vuelo de vuelta lo dispara el
desmontaje del marco, que promueve el nodo del tile. Es el mismo patrón que el
subrayado de tabs. `AnimatePresence` seguiría trabándose por `relegate()`.

### Nota conocida (no bloqueante)

El vuelo **de cierre** se renderiza sobre el nodo del tile, que vive dentro de
`main` (z-index auto) mientras el backdrop es `fixed z-40`: durante los primeros
~100 ms la foto que vuelve queda por detrás del fondo oscuro. Con el ease
`[0.22, 1, 0.36, 1]` el backdrop cae a ~0.29 de opacidad a los 84 ms, así que
apenas se nota. Elevarlo requeriría una fase temporizada de "cierre en vuelo"
en la sección; se dejó fuera por no justificar la complejidad.

### Verificación

- `npx vitest run`: **173 passed / 1 failed**. El único fallo sigue siendo el
  ajeno de `tests/splash-transition.test.tsx` (`bg-curtain`). Las tres suites de
  esta feature: 58/58.
- `npx tsc --noEmit` limpio; `npx eslint` limpio en los seis archivos tocados.
- `npx next build`: compila y prerenderiza sin errores.
- **Pendiente: confirmación visual del usuario.** Sigue sin haber tooling de
  screenshot en este entorno.
