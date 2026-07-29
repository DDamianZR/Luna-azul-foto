# Luna Azul Foto — Propuesta de Sitio Web Editorial

Demostración de propuesta interactiva para el estudio de fotografía **Luna Azul Foto** (Santa María la Ribera, Ciudad de México), diseñada para alojarse directamente en **GitHub Pages** desde el directorio `/docs`.

---

## 🌙 Concepto: La Luna como Fuente de Luz

En Luna Azul Foto, la luna no es un adorno: es la variable real que determina la iluminación, contraste y temperatura de cada sesión nocturna.

El sitio incorpora un **motor de efemérides astronómicas en tiempo real (algoritmos Meeus en JS puro)** que calcula la posición, altitud, fracción iluminada y el **ángulo del limbo brillante** de la luna sobre la Ciudad de México. Estos datos controlan directamente:
1. El render WebGL2 analítico de la Luna real en el hero.
2. El ajuste mecánico de la exposición (`--exposicion`) y tinte del scrim (`--temp-scrim`) sobre la fotografía principal.
3. La telemetría astronómica dinámica expuesta en el HUD.

---

## 🚀 Cómo Ejecutar Localmente

No se requiere ningún paso de compilación o build para correr el sitio.

```bash
# Opción 1: Con npx serve
npx serve docs

# Opción 2: Con Python
python -m http.server 8000 -d docs
```

Abre `http://localhost:8000` en tu navegador.

---

## 📦 Procesamiento de Assets

Si deseas reemplazar las fotografías del proyecto o procesar nuevos logos, se incluye el script automatizado con `sharp`:

```bash
# Instalar dependencias locales de herramientas
npm install

# Procesar fuentes, favicons y fotografías (900/1600/2400px en AVIF/WebP/JPG)
node herramientas/preparar-assets.mjs

# Ejecutar auditoría de calidad de código
node herramientas/verificar-calidad.mjs
```

---

## 🔒 Privacidad & Experiencia Premium

El sitio no utiliza ni incluye herramientas de analítica, rastreadores ni banners de cookies. La ausencia total de banners intrusivos es una decisión consciente de diseño editorial para preservar una experiencia de usuario premium, fluida e ininterrumpida.

---

## 📋 Pendientes para la Junta con el Cliente (`DATO DEMO`)

El sitio es plenamente funcional y cuenta con datos verosímiles en demostración. Para la versión final de producción, se solicita entregar:

1. **14 fotografías reales curadas** del archivo del estudio.
2. **Nombre legal y comercial** definitivo del estudio.
3. **Dirección exacta y coordenadas GPS** del taller.
4. **Teléfono, correo electrónico e Instagram oficial**.
5. **Año de fundación y nombres completos** del equipo y sus roles.
6. **Precios y servicios definitivos** en MXN.
7. **Testimonios de clientes reales** con nombre, cargo y publicación.
8. **Logotipo e isotipo en formato vectorial** (`.ai`, `.svg` o `.eps`).
9. **Créditos EXIF y ficha técnica por serie** (cámara, lente, película, año).
10. **Horarios de atención y calendario real de reserva**.
