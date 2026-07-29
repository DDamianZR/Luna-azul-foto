# PROMPT MAESTRO — ANTIGRAVITY · v2
## Sitio web **LUNA AZUL FOTO** — demo de propuesta · GitHub Pages `/docs`

> Pega este archivo completo como primer mensaje. Es una instrucción ejecutable.
> Lo marcado **CERRADO** no se discute. Lo marcado **TU CRITERIO** es tuyo.
> Lo marcado **PUERTA** exige mi aprobación explícita antes de continuar.

---

## 0. DECISIONES CERRADAS (léelas antes que nada)

| # | Decisión | Por qué |
|---|---|---|
| 1 | **La fotografía manda. La luna la ilumina.** | El hero es un retrato a sangre. El canvas WebGL renderiza la luna real de esta noche y su iluminación calculada maneja la exposición y la temperatura de color de la foto. La luna nunca reemplaza la foto. |
| 2 | **Una sola dependencia en runtime: Lenis.** | Reveals con `IntersectionObserver` + CSS. Pin horizontal con `position: sticky` + un `rAF`. Sin GSAP, sin ScrollTrigger, sin Three.js. Menos piezas = menos formas de romperse. |
| 3 | **Cero build en el artefacto.** | HTML + CSS + ES modules nativos. Node/`sharp` sólo local para procesar imágenes; las salidas se commitean. |
| 4 | **Todo bajo `docs/`, rutas relativas, `.nojekyll`.** | Es un *project page*. Una ruta absoluta (`/assets/…`) tumba el sitio completo. |
| 5 | **Textura de luna real, no procedural.** | Albedo equirectangular de dominio público (NASA/USGS). Un FBM inventado por un agente se ve como pelota de tenis. Procedural sólo como fallback. |
| 6 | **11 secciones. Ninguna más.** | Si quieres agregar una, la respuesta es no. Si crees que falta contenido, la respuesta es cortar otra cosa. |
| 7 | **Un solo acento: `--laton`.** `--luna` no es color, es luz. | `--luna` sólo aparece emitido por la luna y en el foco de teclado. Nada más. |
| 8 | **Cero menciones de IA / asistentes / "generado" en código, comentarios, README, commits o historial de git.** | El repo se le entrega al cliente. Se lee como escrito por una persona. |

---

## 1. FASE 0 — RECONOCIMIENTO · **PUERTA**

Directorio: `C:\Users\damia\Documents\Proyectos\Pruebas\Propuestas\Luna azul foto`
Assets del cliente en la raíz: `logo.jpg` (58 KB), `frase.jpg` (41 KB).

Antes de escribir una línea de código:

**1.1 Inspecciona los dos JPG y reporta**
- Texto literal del logo, si tiene isotipo, y si el fondo es plano (recortable) o es foto.
- **Los hex reales extraídos del logo** (mídelos, no los adivines).
- Qué dice `frase.jpg` **palabra por palabra**, y clasifícalo: `caligrafía limpia` /
  `tipografía` / `texto sobre foto` / `ilegible`. De esta clasificación depende la sección 07.
- Si la tipografía del logo es **didone / alto contraste**, avísame: en ese caso NO uses
  Instrument Serif para el display (competiría con el logo) y volvemos a Bodoni Moda.

**1.2 Diagnostica el repo**
```bash
git remote -v && git branch --show-current && git log --oneline -5 && git status --short
ls -la docs 2>/dev/null || echo "sin docs/"
git branch -a | grep -i pages || echo "sin gh-pages"
```
Reporta: remoto, rama por defecto (**si es `master` y no `main`, úsala tal cual, no la
renombres**), si `docs/` ya existe con contenido (si existe, **no borres nada**: repórtalo y
espera), si hay `gh-pages` (si hay, hay que decidir cuál gana).

**1.3 Windows**
Crea `.gitattributes` con `* text=auto eol=lf` y `*.jpg binary` antes del primer commit, para
que no se contamine el diff con CRLF.

**1.4 Regla del logo**
El logo es la fuente de verdad de la marca. Si sus colores pelean con la paleta de la
sección 3, **ajusta la paleta al logo**, recalcula los contrastes con la fórmula WCAG y
repórtame los nuevos ratios. Nunca deformes el logo: sólo escala proporcional.

**PUERTA 0 — no avances a F1 sin mi aprobación de este reporte.**

---

## 2. IDEA RECTORA: LA LUNA COMO FUENTE DE LUZ

El nombre es **Luna Azul**. La luna no es adorno: es el instrumento que un fotógrafo consulta
antes de una sesión nocturna. Fase, fracción iluminada, altura sobre el horizonte, hora azul.

**El mecanismo firma:** el motor de efemérides calcula la luna real sobre la Ciudad de México
en el instante en que el visitante abre el sitio, y esos números **manejan de verdad** el
tratamiento del retrato del hero. Luna llena alta a medianoche → foto fría, contraste alto,
glow visible. Luna nueva → foto más cerrada, casi silueta. Luna bajo el horizonte a mediodía →
tratamiento de luz de día, más cálido y abierto, y el HUD dice a qué hora sale.

Nadie puede clonar eso con una plantilla, y no es un truco: es la variable que un fotógrafo
realmente mide. **Ahí gastas toda la audacia. Todo lo demás es contención.**

**Prueba de coherencia** para cualquier elemento nuevo: *¿existe en la fotografía real o en la
astronomía real?* Si no, va fuera. Nada de blobs, partículas, auroras ni parallax decorativo.

---

## 3. TOKENS · **CERRADO**

### 3.1 Paleta — nocturno azul

```css
--noche:    #080B10;  /* fondo */
--noche-2:  #0E141C;  /* paneles, celdas */
--tinta:    #131B25;  /* hover de filas */
--hueso:    #E7E3D9;  /* texto principal */
--niebla:   #8B95A3;  /* texto secundario */
--laton:    #B98B4E;  /* ÚNICO acento: ®, hover, número activo, CTA */
--luna:     #BFD4E8;  /* luz emitida por la luna + focus ring. NO es color de UI */
--linea:    rgba(231,227,217,.12);
```

**Contrastes ya medidos sobre `--noche`** (no los "verifiques", ya están):
`--hueso` 15.4:1 · `--luna` 13.0:1 · `--niebla` 6.5:1 · `--laton` 6.4:1.
Sobre `--tinta`: `--laton` 5.9:1. Todos pasan AA para texto normal.
Si cambias la paleta por el logo (1.4), **recalcula y repórtalos**.

Cuatro tonos oscuros distintos, no uno. Si en un screenshot cuentas más de 6 apariciones de
`--laton`, sobran. `--niebla` mínimo `11px` (0.7rem) salvo en labels uppercase con tracking.

**Prohibidos por ser los tres clichés de IA de 2026:**
crema `#F4F1EA` + serif de alto contraste + terracota `#D97757` · casi-negro + un único acento
neón/ácido · broadsheet de reglas de 1px con columnas densas de periódico.

### 3.2 Tipografía — tres familias, self-hosted

| Rol | Familia | Notas |
|---|---|---|
| Display | **Instrument Serif** 400 + itálica real | Un solo peso: la jerarquía sale de tamaño, caja y tracking, no de weights. Alto contraste, aire de masthead editorial. |
| Cuerpo / UI | **Archivo** 300 / 400 / 500 | Workhorse con buenas anchuras. Archivo Expanded como segunda voz de la misma familia. |
| Datos | **DM Mono** 300 / 400 / 500 | Más fino y refinado que Space Mono, que ya es el default de este género. |

- Descarga los WOFF2 y sírvelos desde `docs/assets/fonts/`. **Cero requests a Google Fonts.**
- `<link rel="preload">` sólo para los 2 archivos del above-the-fold. `font-display: swap`.
- DM Mono **siempre** uppercase, `letter-spacing: .14em–.18em`, `.68rem–.74rem`.
- Instrument Serif: usa la **itálica real** del archivo, nunca `font-style: italic` sintético.
- Números que tickean: `font-variant-numeric: tabular-nums` (si no, brincan).
  Números editoriales estáticos: `oldstyle-nums`.
- **Condicional de F0:** si el logo es didone, cambia display a **Bodoni Moda** variable.

### 3.3 Escala fluida

```
wordmark  clamp(4.2rem, 14.5vw, 12.5rem)  Instrument Serif 400, line-height .84
h2        clamp(2.1rem, 5.2vw, 4.2rem)
lead      clamp(1.4rem, 2.6vw, 2.2rem)
cuerpo    .92rem–1rem   Archivo 300, line-height 1.65, max-width 62ch
mono      .68rem–.74rem
```

### 3.4 Movimiento — valores exactos

```
salida (reveals, hover)    cubic-bezier(.16, 1, .3, 1)
wipe (clip-path, menú)     cubic-bezier(.76, 0, .24, 1)
reveal                     .9s – 1.3s
micro                      .28s – .38s
lerp cursor / preview      .12 por frame
parallax                   translateY(scroll * .10) máximo
stagger entre hermanos      .10s – .14s
```

### 3.5 Retícula

12 columnas, `gap: clamp(1.2rem, 2.5vw, 2.6rem)`, offsets verticales con `margin-top` en `vh`
(8vh–26vh). **Aspect ratio declarado siempre**: 4:5, 3:4, 1:1, 16:9. Nunca `auto`. CLS = 0.
`border-radius: 0` en todo, salvo el cursor y el punto de agenda.

---

## 4. EL OBSERVATORIO (elemento firma)

### 4.1 Motor de efemérides — `docs/js/efemerides.js`

JS puro, sin librerías, ~180 líneas. Algoritmos de Meeus simplificados. Calcula:

- posición solar y lunar (longitud eclíptica, declinación, distancia)
- **fracción iluminada** y **ángulo de fase** → nombre de fase en español
- **altitud y azimut** de la luna para lat/lon del estudio (CDMX `19.4326, -99.1332`, marcar
  `DATO DEMO`)
- **ángulo de posición del limbo brillante** — *esto es obligatorio*: sin él el terminador sale
  vertical cuando debería estar inclinado, y es el detalle que delata una luna falsa
- altitud solar → `esNoche` (sol < −6°), **hora azul** y **hora dorada** de hoy
- **hora de salida y puesta** de la luna
- **próxima Luna Azul** = segunda luna llena dentro de un mismo mes calendario, iterando
  lunaciones hacia adelante. **Prohibido hardcodear la fecha.**

Validación obligatoria: compara tres valores (fracción iluminada, altitud, hora de salida)
contra una fuente pública para la fecha de hoy y **reporta el error**. Si la fracción se pasa
de ±2 puntos porcentuales o la altitud de ±1.5°, hay un bug en el algoritmo, no en la fuente.

Recalcula la **pantalla** cada 1 s. Recalcula la **luz** cada 60 s (el cielo no cambia en un
segundo, y recalcular luz cada frame es desperdicio).

### 4.2 De las efemérides a la luz — el mecanismo

El motor expone y escribe en `:root`:

```
--exposicion     0.62 → 0.88   brightness del retrato del hero
--temp-scrim     mezcla entre #0C1826 (frío lunar) y #1A1208 (cálido diurno)
--intensidad     0 → 1         glow de la luna y su contribución al scrim
```

y como uniforms al shader: dirección de luz (derivada del ángulo del limbo brillante), fase,
intensidad, altitud.

Tratamiento del retrato:
`filter: grayscale(1) contrast(1.08) brightness(var(--exposicion))` + scrim en gradiente
teñido con `--temp-scrim`.

**Disciplina obligatoria:** el rango total de swing es del 26%, no un switch de luz. Y el
scrim se clampea para que la zona del wordmark **nunca** baje de 7:1 de contraste, a ninguna
hora del día. Si el mecanismo compromete la legibilidad, gana la legibilidad.

### 4.3 Render — WebGL2 crudo, un solo quad

**CERRADO: sin Three.js.** Un fullscreen quad, un vertex shader trivial, un fragment shader.

1. **Textura:** albedo lunar equirectangular de dominio público (NASA/USGS CGI Moon Kit o
   LROC), ~2048×1024. Verifica que la fuente sea dominio público y anótala en `CREDITS.md`.
   Convierte a WebP + JPEG fallback. Si no consigues una, usa el fallback procedural de 4.4.
2. **Geometría:** intersección analítica rayo-esfera en el fragment shader (exacta y barata).
   Normal → coordenadas esféricas → UV para muestrear el albedo:
   `u = .5 + atan(n.z, n.x) / (2π)`, `v = .5 - asin(n.y) / π`.
3. **Iluminación:** Lambert con la dirección de luz del ángulo del limbo brillante real. La
   luna está acoplada por marea: el punto sub-terrestre es fijo, la cara visible siempre es la
   misma. No la rotes arbitrariamente.
4. **Limbo:** aspereza en el borde (el terminador real es dentado, no un arco limpio).
5. **Glow:** halo tenue en `--luna`, caída rápida. Sin bloom.
6. **Grano de película** dentro del shader (hash por pixel + tiempo, `~.045`).
   **Nunca como capa DOM animada**: eso es un repaint killer en móvil.
7. La luna ocupa la zona de cielo de la composición, no el centro de la pantalla.

**Presupuesto:** 60 fps en laptop con gráficos integrados. Si el promedio móvil de frametime
pasa de 22 ms por 1.5 s, baja de tier solo: `alto` → `medio` (menos pasos, DPR 1.25) →
`estático` (un frame, rAF apagado). DPR tope 1.5 en móvil.

### 4.4 Degradación · **OBLIGATORIA**

| Condición | Comportamiento |
|---|---|
| Sin WebGL2 | Retrato a sangre + póster de luna `assets/img/luna-poster.avif`. **La telemetría sigue viva** (es matemática en JS). El sitio no se desarma: se vuelve una placa impresa. |
| Sin textura de albedo | Fallback procedural: 3 octavas de FBM + domain warping para maria, ruido de cráteres en el limbo. Documenta que es fallback. |
| `prefers-reduced-motion` | Canvas congelado en un frame, `rAF` apagado, grano estático, cero reveals, contenido completo visible al instante. |
| Sin JS | `<noscript>`: sitio legible completo, imágenes y layout intactos. |

### 4.5 Interacción

- **Desktop:** arrastrar dentro del hero orbita ±18° X / ±10° Y con retorno elástico. La rueda
  **siempre** hace scroll. Cero scroll hijacking.
- **Móvil:** sin drag. Rotación lentísima ligada al progreso de scroll del hero. Giroscopio
  **sólo** detrás de un botón que pida permiso explícito. Nunca automático.
- **Tecla `I`:** oculta/muestra la telemetría. Anúncialo una vez, en mono chiquito.
- **`?debug=1`:** FPS, tier, frametime, valores crudos de efemérides.
  **Jamás visible sin el flag.** Un contador de FPS en un sitio de cliente es un tell.
- `IntersectionObserver`: pausa el `rAF` cuando el hero sale del viewport.

### 4.6 HUD — 3 renglones, no 6

Abajo a la derecha, DM Mono, `tabular-nums`, filetes de 1px. Por defecto sólo:

```
GIBOSA CRECIENTE · 73.4 %
ALTITUD +41.2°
HORA AZUL 20:14 — 20:33
```

Un `+` discreto revela el resto (azimut, distancia, salida/puesta, próxima luna azul). El
wordmark es el protagonista del hero; el HUD no compite con él. Los decimales interpolan, no
se reemplazan de golpe. Si la luna está bajo el horizonte, el primer renglón lo dice y da la
hora de salida — es información útil, no un estado de error.

---

## 5. BLUEPRINT — 11 SECCIONES

Orden exacto. **Ninguna sección se parece estructuralmente a la anterior.**
Cortadas a propósito respecto a versiones anteriores del brief: **marquesina de disciplinas**
(cliché de portafolio) y **proceso de 4 frames** (absorbido en la 10).

### 01 · PRELOADER
Fondo `--noche`. DM Mono: `CALIBRANDO ÓPTICA`. Contador Instrument Serif gigante `00 → 36` con
filete de 1px `--luna` que avanza. Sale con `clip-path: inset()` hacia arriba.
**Mínimo 700 ms** (si es más rápido, parpadea y se siente roto), **timeout duro a 2.5 s**.
Espera fuentes above-fold + retrato del hero. **No espera al shader**: el canvas entra después
con un fade de 600 ms sobre el póster.

### 02 · HEADER (fijo)
Izq: logo real + `®` en `--laton`. Centro: nav DM Mono, 4 ítems —
`OBRA · ESTUDIO · SERVICIOS · RESERVAR`, underline con `scaleX` de derecha a izquierda.
Der: punto que pulsa + `AGENDA ABIERTA — [MES REAL EN VIVO]` + botón `RESERVAR` con borde 1px
que invierte en hover.
Al scrollear: fondo sólido al 94% + filete inferior. **Prohibido `backdrop-filter`.**
Móvil: overlay a pantalla completa, cada ítem con su propia foto de fondo que aparece al
tocarlo, entrada con stagger y máscara. No hamburguesa genérica.

### 03 · HERO — RETRATO ILUMINADO (`100dvh` con fallback `100vh`)
**5 capas, ni una más.** Retrato a sangre + canvas de la luna en la zona de cielo + 4 esquinas
de encuadre (1px, brazo de 26px) + wordmark gigante + HUD de 3 renglones.

- **Cortadas de la versión anterior:** retícula de autoenfoque (duplicaba el trabajo de las
  esquinas) y meta vertical (ruido).
- Kicker DM Mono arriba izq: `FOTOGRAFÍA — SANTA MARÍA LA RIBERA, CDMX`.
- Wordmark abajo izq: entra con `translateY(110%)` bajo máscara, retardo 300 ms, sublínea en
  itálica.
- Cue de scroll: una línea de 1px que se estira y contrae en loop. No la palabra "scroll".
- **Barra de URL móvil:** usa `100dvh`, y mide la altura real con `visualViewport` para el
  canvas. Nunca `100vh` solo en móvil.

**PROHIBIDO:** titular + subtítulo + CTA centrados y apilados.

### 04 · OBRA SELECCIONADA — la sección más importante
- Cabecera: referencia de archivo DM Mono en `--laton` + h2 con una palabra en itálica
  `--niebla` + meta a la derecha + filete inferior.
- Retícula 12 col **asimétrica**, 6 piezas, spans `1/8, 9/13, 2/7, 8/13, 1/10, 10/13`, cada
  una con `margin-top` distinto. **Ninguna fila regular.**
- Cada pieza: `<figure>`; hover → `grayscale(1)→0` + `scale(1.05→1)` en 1.4 s + metadatos.
- **Numeración de archivo real**, no `№ 01`: `LA-2026-014 · CUADRO 07A`. En un archivo
  fotográfico el orden sí carga información — por eso se numera. Si no la cargara, no se
  numeraría.
- Caption en 3 partes con filete superior: `disciplina (mono) / título (itálica) / año (mono)`.
- Reveal: `clip-path: inset(100% 0 0 0) → 0` con stagger, vía `IntersectionObserver`.
- **Cursor: encuadre, no "VER".** Dos corchetes de esquina que se ajustan al aspect ratio de la
  foto bajo el puntero, con la distancia focal en mono al centro (`35 MM`). Sólo `pointer: fine`.
- `mix-blend-mode` sólo si lo pruebas en Safari y no promueve capas ni baja el frametime. Si
  duda, usa `--hueso` a `.55` de opacidad y ya.

### 05 · HOJA DE CONTACTOS (horizontal, sin librería)
`position: sticky` + un `rAF` que lee `getBoundingClientRect()` del contenedor y traduce
progreso vertical a `translateX`. 8 cuadros, gap de 1px sobre `--linea`, aspecto de hoja de
contactos real. Caption por cuadro: `CUADRO 07A — ƒ/2.8 — 1/125`.
Móvil: `overflow-x` + `scroll-snap`, **sin pin** (el pin en móvil es una trampa de UX).
Navegable con teclado: flechas mueven cuadro por cuadro y el foco es visible.

### 06 · LA FRASE (`frase.jpg`) — el momento más silencioso
A sangre, la frase del cliente **textual**. Reveal con `clip-path` **scrubbeado por scroll**
(la frase aparece como una copia saliendo del revelador), grano encima, atribución en mono.
Sin foto compitiendo: aquí manda el texto.

Árbol de decisión según F0:
- `caligrafía limpia` → traza a SVG y anima con `stroke-dashoffset`. **Si el trazado queda
  sucio, no lo fuerces:** un SVG mal traceado se ve peor que el JPG.
- `tipografía` → transcribe el texto a HTML real con Instrument Serif, usa el JPG sólo como
  referencia. Texto real = seleccionable, accesible, nítido en cualquier DPR.
- `texto sobre foto` → usa el JPG a sangre con máscara y el texto en `alt`.
- `ilegible` → fallback marcado `<!-- DATO DEMO -->`:
  *"La luz azul dura diecinueve minutos. Todo nuestro oficio cabe ahí."*

### 07 · EL ESTUDIO
Split `1.15fr / .85fr`. Izq: lead en itálica con una palabra en `--laton` + 2 párrafos con
detalles **concretos** (año de fundación, equipo, formatos, y un detalle humano: *"un gato
color humo llamado Tungsteno que aparece en el 4% de las sesiones"*). Foto del taller.
Der: 4 estadísticas en celdas con filetes — **no tarjetas, no sombras**. Número con count-up
al entrar al viewport (1.5 s, easeOutCubic) + label mono. Cifras específicas, no redondas:
`2019 fundado` · `147 rollos revelados en 2026` · `11 portadas` · `3.2 km de negativo escaneado`

### 08 · SERVICIOS = ÍNDICE (no tarjetas)
Filas de índice editorial: número mono / título grande + tags / precio / flecha.
Hover: fondo `--tinta`, crece `padding-left`, número → `--laton`, flecha rota −45°.
**Preview flotante:** imagen fija de 230px que sigue al cursor con lerp .12 y rota según
velocidad (`(tx − px) * .05deg`); cambia de `src` por fila. Sólo `pointer: fine`.
**Móvil:** la fila se expande en su lugar con miniatura + detalle. **Auditoría obligatoria:
ninguna información existe sólo en hover.**

```
01  RETRATO DE AUTOR             ESTUDIO · LUZ CONTINUA       DESDE $9,800 MXN
02  EDITORIAL DE MODA            LOCACIÓN · EQUIPO COMPLETO   DESDE $28,000 MXN
03  CAMPAÑA DE MARCA             DIRECCIÓN · PRODUCCIÓN       DESDE $65,000 MXN
04  ARCHIVO DE FAMILIA           DOMICILIO · 120 MM           DESDE $16,500 MXN
05  REVELADO Y ESCANEO 35/120    LABORATORIO PROPIO           DESDE $420 MXN / ROLLO
```
Todos los precios: `<!-- DATO DEMO: confirmar con cliente -->`

### 09 · TESTIMONIO ÚNICO
Uno solo. Comilla Instrument Serif de 9rem en `--laton` a `.18` de opacidad. Formato
entrevista, no estrellas:
> **¿Qué te llevaste de la sesión?**
> *"Una foto que no puedo explicarle a nadie sin enseñarla."*
> — Ana Sofía Rentería · dirección de arte · Revista Cátedra

### 10 · RESERVA (con el proceso adentro)
CTA gigante en dos líneas, la segunda en itálica `--niebla`: `Escríbenos antes` /
`de que cambie la luz.`
Grid 2 columnas.
- **Izq:** email grande con underline animado + datos en filas con filetes (tel, dirección,
  horario, IG) + caja de disponibilidad con **mes real en vivo** (`quedan 3 fechas en [MES]`) +
  **el proceso en 3 renglones mono** (`DÍA 0 conversación · SEMANA 1 sesión · SEMANA 3 entrega`).
  Eso reemplaza la sección de 4 frames que estaba de relleno.
- **Der:** formulario. Labels mono, inputs transparentes con `border-bottom` (focus → `--luna`),
  select de tipo de sesión, botón ancho que en hover pasa a `--laton` y expande `letter-spacing`.
  Sin backend: `mailto:` con `subject`/`body` prellenados y el endpoint de Formspree comentado.
  **Validación y estados reales** (error, enviando, éxito) en la voz del sitio, con `aria-live`.
  Cero `alert()`.
- Microcopy: *"Sin spam, sin newsletters. Contesta una persona, normalmente el mismo día."*
- Imperfección deliberada: *"P.D. Si escribes después de medianoche, probablemente estemos
  despiertos revelando."*

### 11 · FOOTER
Wordmark en outline gigante centrado (`-webkit-text-stroke: 1px`, hover → relleno `--laton`).
4 columnas simples. Barra final en mono: © año real · **reloj en vivo de CDMX**
(`Intl.DateTimeFormat`, `timeZone: 'America/Mexico_City'`, tick de 1 s) · glifo de la fase
lunar actual · `HECHA A MANO` · botón `SUBIR`.
**Sin analytics, sin banner de cookies.** La ausencia de banner es en sí una señal premium;
dilo en el README para que se sepa que es decisión, no olvido.

---

## 6. ASSETS

### 6.1 Logo y frase
Recorta el fondo de `logo.jpg` (umbral con `sharp` si es plano; `potrace` si es vectorizable) y
**verifica visualmente que no se deformó**. Genera: `logo.svg` (si aplica), `logo-512.png`
transparente, `favicon.ico` (16/32/48), `apple-touch-icon.png` (180), `og-image.jpg`
(1200×630: wordmark sobre el retrato del hero), `<meta name="theme-color" content="#080B10">`.

### 6.2 Fotografía — 14 fotos, curadas
12 extraordinarias valen más que 40 buenas. Nunca satures.

- Fuente: **Unsplash o Pexels** (licencia libre). Búsquedas: `editorial portrait chiaroscuro`,
  `fashion editorial night`, `film grain portrait`, `mexico city brutalist architecture`,
  `analog still life`, `studio hard light portrait`, `blue hour street`.
- **Coherencia por encima de calidad individual:** una sola dirección de luz dominante (clave
  dura, sombras profundas) y una paleta que conviva con el azul nocturno. Si una foto es cálida
  y saturada, va fuera aunque sea buena.
- **Verificación de descarga obligatoria** (esto falla más de lo que crees): después de cada
  descarga comprueba bytes y dimensiones reales. **Rechaza cualquier archivo < 200 KB o que no
  abra como imagen** — casi siempre es una página de error guardada como `.jpg`. No inventes
  URLs de descarga: navega, obtén el enlace real, verifica.
- `herramientas/procesar-imagenes.mjs` con `sharp`: 3 anchos (900 / 1600 / 2400) × AVIF
  (`quality 50, effort 4`) + WebP (`quality 72`) + JPEG (`quality 78, mozjpeg`). Usa `effort`
  bajo: AVIF con `effort 9` sobre 42 archivos tarda una eternidad y la diferencia es marginal.
- **Placeholder cromático:** extrae el color dominante de cada foto en el script y escríbelo
  como `background-color` del contenedor. **Cero spinners, cero gris genérico.**
- `<picture>` con `srcset` y `sizes` correctos. `fetchpriority="high"` en el hero;
  `loading="lazy"` + `decoding="async"` bajo el fold.
- `docs/CREDITS.md`: fotógrafo + URL de cada imagen + fuente de la textura lunar.
- Comentario `<!-- FOTO: reemplazar por obra real del cliente -->` en cada slot.

### 6.3 Presupuesto de peso
First view (retrato del hero + header + fuentes + textura lunar): **≤ 900 KB**.
Documento completo con lazy load: **≤ 4 MB**.
Aceptamos carga más lenta a cambio de calidad, pero el hero entra rápido o el preloader es
una excusa.

---

## 7. ESTRUCTURA

```
/
├── docs/
│   ├── .nojekyll
│   ├── index.html
│   ├── 404.html                  ← diseñado, no default: retrato + "CUADRO NO EXPUESTO" + volver
│   ├── CREDITS.md
│   ├── css/ tokens.css · layout.css · componentes.css
│   ├── js/
│   │   ├── main.js               orquestador (entry ES module)
│   │   ├── efemerides.js         motor astronómico
│   │   ├── observatorio.js       WebGL2, tiers, degradación, HUD
│   │   ├── luz.js                efemérides → custom properties + uniforms
│   │   ├── scroll.js             Lenis + IntersectionObserver + pin sticky
│   │   ├── cursor.js             encuadre + preview flotante
│   │   └── ui.js                 preloader, nav, reloj, count-up, formulario
│   ├── shaders/ luna.vert · luna.frag
│   ├── vendor/  lenis.min.js  (única dependencia, con su LICENSE)
│   └── assets/ fonts/ · img/
├── herramientas/procesar-imagenes.mjs
├── logo.jpg · frase.jpg
├── .gitattributes · .gitignore
└── README.md
```

**Nombres de archivos, clases CSS y variables JS en español** (el repo se le entrega al
cliente): `.pieza-obra`, `.indice-fila`, `--linea`, `revelarSecciones()`.
**Tope de 400 líneas por archivo.** Si uno crece más, pártelo.

### 7.1 Lenis — la única dependencia
Usa el build **ESM** (`lenis.mjs` o el `.js` de módulo del tarball de npm), no el UMD:
`import` sobre un `.min.js` UMD truena. Verifica que el archivo vendorizado exporte
correctamente antes de construir sobre él. Incluye su `LICENSE` en `vendor/`.
Si Lenis pelea con el pin de `sticky` de la sección 05, **quita Lenis** y usa scroll nativo con
`scroll-behavior: smooth`. El diseño debe sobrevivir sin él.

---

## 8. LISTA NEGRA — cualquiera de estas y el trabajo se rechaza

Hero centrado de titular + subtítulo + CTA apilados · 3 o 4 tarjetas de features iguales ·
texto con gradiente · gradientes índigo/violeta/rosa · una sola familia tipográfica ·
Inter/Roboto/Poppins/Montserrat a secas · glassmorphism o `backdrop-filter` decorativo ·
blobs de aurora · `border-radius` generalizado · botones pill · sombras grandes · tarjetas
flotantes · crema+terracota+serif · casi-negro + un neón · `fade-up` genérico en todo ·
marquesina infinita de palabras · Lorem ipsum · "Servicio 1" · "Capturamos momentos únicos" ·
FAQ acordeón · logos de clientes en fila gris · timeline decorativa · simetría perfecta más de
una sección · masonry tipo Pinterest · carruseles automáticos · scroll hijacking ·
`scroll-snap` de página completa · emojis en la UI · contador de FPS visible ·
cualquier string que revele cómo se construyó esto.

---

## 9. FASES, PUERTAS Y PROTOCOLO DE FALLO

| Fase | Entrega | **Puerta** | Commit |
|---|---|---|---|
| **F0** | Reconocimiento de assets + repo (sección 1). | **SÍ** | — |
| **F1** | Assets: logo, favicons, 14 fotos × 3 anchos × 3 formatos verificadas, textura lunar, fuentes, `CREDITS.md`, script. | no | `chore: procesa assets de marca y fotografía` |
| **F2** | Esqueleto: HTML semántico, tokens, tipografía, retícula, **las 11 secciones maquetadas sin movimiento**, responsive base. Debe verse premium ya en estático. | **SÍ** | `feat: estructura editorial y sistema de diseño` |
| **F3** | Observatorio: efemérides validadas + shader + tiers + degradación + HUD + mecanismo de luz. | **SÍ** | `feat: observatorio lunar en tiempo real` |
| **F4** | Movimiento: Lenis, reveals, pin horizontal, cursor encuadre, preview flotante, count-up, preloader. | no | `feat: capa de movimiento y microinteracciones` |
| **F5** | Pase móvil: **rediseño**, no adaptación. | no | `feat: experiencia móvil` |
| **F6** | Accesibilidad, rendimiento, meta/SEO, QA. | no | `fix: accesibilidad y rendimiento` |
| **F7** | README + deploy + verificación en vivo. | no | `docs: instrucciones de personalización` |

### 9.1 Reporte obligatorio al cerrar cada fase — exactamente este formato

```
FASE Fx — [cerrada / bloqueada]
Hice:        (3 líneas máximo)
Decidí solo: (lo que resolví por mi cuenta y por qué)
Riesgo:      (lo que puede romperse)
Crítica:     (qué se ve a plantilla en lo que acabo de hacer)
Quité:       (regla de Chanel: un accesorio menos que al empezar la fase)
Screenshots: (rutas — desktop 1440 + móvil 390, siempre las dos)
```

### 9.2 Protocolo de fallo · **CERRADO**
- **Dos intentos** por problema. Al tercero, **detente y pregúntame.** No degrades el diseño en
  silencio para salir del paso.
- Si la luna no se ve fotográfica después de dos iteraciones: pásate al póster estático con
  telemetría viva (4.4) y dilo. Un póster impecable vale más que un shader mediocre.
- **Nunca comentes código para "arreglar" un bug.** Nunca dejes `TODO`. Si algo no se pudo,
  va en el reporte, no escondido en el código.
- **Anti-scope-creep:** no agregues blog, lightbox, switch de idioma, modo claro, newsletter,
  chat, ni sección nueva. Si crees que falta algo, dilo en el reporte; no lo construyas.
- **Móvil en cada fase, no al final.** Cada puerta exige screenshot de 390px. Si a 390 se
  desborda algo, la fase no está cerrada.
- **No reescribas archivos completos** para cambios chicos: edición quirúrgica. No vuelvas a
  leer archivos que ya tienes en contexto.

---

## 10. CALIDAD

### 10.1 Accesibilidad
Semántica real (`header/nav/main/section/figure/figcaption/blockquote/cite/footer`) · `alt`
descriptivos de verdad (qué se ve, no "imagen 3") · `:focus-visible` con outline `--luna` 2px,
offset 3px, visible en **todo** · navegación completa por teclado incluida la hoja de contactos
· `aria-hidden` en decorativos, `aria-expanded` en el menú, `aria-live` en el estado del
formulario · `prefers-reduced-motion` apaga **todo**, `rAF` del canvas incluido · `<noscript>`
con el sitio legible · tap targets ≥ 44px · ninguna información sólo en hover.

### 10.2 Rendimiento — metas honestas
Con un canvas WebGL y un hero pesado, exigir Performance ≥ 90 en móvil es pedirte que hagas
trampa. Las puertas reales son:

```
LCP móvil     < 2.5 s      ← puerta
CLS           = 0          ← puerta
TBT           < 250 ms     ← puerta
Consola       0 errores, 0 warnings, 0 requests 404   ← puerta
Lighthouse    Perf ≥ 80 móvil / ≥ 95 desktop · A11y ≥ 95 · BP 100 · SEO 100
Hero          60 fps estables en tier alto
```
Sólo `transform` y `opacity` en animaciones — nunca `top/left/width/height`. Listeners de
scroll `{ passive: true }`. **Un solo `rAF` para todo el sitio**, no uno por módulo.

### 10.3 SEO / meta
`<html lang="es-MX">` · title `Luna Azul — Fotografía · Ciudad de México` · meta description
escrita a mano · Open Graph + Twitter card · JSON-LD `LocalBusiness` (marcado como demo) ·
`<link rel="canonical">`.

---

## 11. DEPLOY

```bash
# 1. cero rutas absolutas (debe salir vacío, fuera de anclas y mailto)
grep -rn 'src="/\|href="/\|url(/' docs/ | grep -v '#\|mailto:'

# 2. cero referencias a herramientas de IA en todo el repo
grep -rniE 'claude|antigravity|copilot|gpt|\bllm\b|generado por|ai-generated' . \
  --exclude-dir=.git --exclude-dir=node_modules

# 3. cero TODO / FIXME / código comentado
grep -rnE 'TODO|FIXME|XXX|/\* *<' docs/

# 4. .nojekyll existe
test -f docs/.nojekyll && echo OK

# 5. servir y recorrer
npx serve docs
```

Luego: commit por fase, en español, imperativo, tipo convencional. **Cero trailers de
coautoría.** Autor = el del `git config` local.

```bash
git push origin <rama-de-F0>
gh api -X POST repos/{owner}/{repo}/pages -f "source[branch]=<rama>" -f "source[path]=/docs"
```
Si `gh` no está autenticado, dame la ruta exacta en Settings → Pages y detente ahí.

**Verificación en vivo (no la omitas):** espera ~60 s de propagación, abre la URL real en el
navegador y confirma: fuentes cargadas, imágenes cargadas, shader corriendo, telemetría con
números que corresponden a la luna de hoy, consola limpia, Network sin 404. **Prueba también
en móvil real, no sólo en el emulador.** Reporta la URL.

`README.md` con: qué es, cómo correrlo local, cómo cambiar fotos / textos / precios /
coordenadas, por qué no hay analytics ni banner de cookies, y la lista completa de `DATO DEMO`
pendientes.

---

## 12. DEFINICIÓN DE TERMINADO

```
[ ] Abre desde la URL de Pages sin una sola dependencia rota
[ ] El hero es una FOTOGRAFÍA, y la luna de hoy la ilumina de verdad
[ ] Los tres valores de efemérides validados contra fuente pública, error reportado
[ ] Sin WebGL2 el sitio sigue siendo hermoso (póster + telemetría viva)
[ ] El terminador de la luna tiene la inclinación correcta (ángulo del limbo brillante)
[ ] Ninguna sección se parece estructuralmente a la anterior
[ ] Al menos 6 microinteracciones distintas, todas funcionando
[ ] A 390px nada se desborda y nada se centró por pereza: la asimetría sobrevive
[ ] Ninguna información existe sólo en hover
[ ] prefers-reduced-motion apaga todo de verdad, canvas incluido
[ ] Copy específico: precios en MXN, barrio real, EXIF verosímil, nombres completos
[ ] La frase del cliente está textual y es el momento más silencioso del sitio
[ ] LCP < 2.5 s · CLS 0 · consola limpia · 60 fps en el hero
[ ] Los 5 greps de la sección 11 salen limpios
[ ] El historial de git no delata cómo se hizo
[ ] Un director de arte no podría decir "esto lo hizo una IA"
```

**Prueba de fuego final:** toma 3 screenshots (hero desktop, obra desktop, hero móvil) y
escribe las **tres primeras cosas que un director de arte criticaría**. Si alguna es
arreglable en menos de una hora, arréglala antes de entregar.

Cierre: máximo 10 líneas con URL en vivo, decisiones que tomaste solo, y qué falta que sólo el
cliente puede dar.

---

## 13. LO QUE HAY QUE PEDIRLE AL CLIENTE (lista para la junta)

Todo lo demás está inventado y marcado `DATO DEMO`. Pon esta lista en el README:

1. 14 fotografías reales curadas (o acceso al archivo para curar)
2. Nombre legal y comercial del estudio
3. Dirección real + coordenadas + zona horaria
4. Teléfono, email, Instagram
5. Año de fundación y nombres completos del equipo con su rol
6. Los 5 servicios reales con precios reales en MXN
7. Un testimonio real con nombre, cargo y medio
8. La frase de marca en vector, si existe
9. Logo en vector (`.ai`, `.svg` o `.eps`)
10. Créditos de cada foto: modelo, estilismo, maquillaje, asistencia
11. Datos técnicos por serie: cámara, lente, película, locación, año
12. Horario de atención y disponibilidad real de agenda

---

## 14. VARIANTES — no las construyas ahora

Sólo si te lo pido explícitamente:
- **B · GALERÍA DIURNA:** fondo hueso frío `#F2F0EB`, texto `#141310`, fotos a color, aire
  +40%, captions tipo placa de museo. La luna pasa a disco claro sobre cielo pálido.
- **C · ARCHIVO ANÁLOGO:** fondo `#1C1712`, hueso dorado `#EAD9B8`, acento latón único, grano
  al `.10`, margen blanco tipo copia fotográfica alrededor de cada foto.

En cualquier variante se conservan: asimetría, mono para datos, los valores de movimiento de
3.4, el mecanismo de luz de 4.2 y la lista negra completa.
