# Arquitectura

## Estructura de carpetas

```
hoguera-vue-project/
│
├── index.html                        # Entrada HTML: fuentes, meta OG, mount point #app
├── vite.config.js                    # Build config: alias @, code splitting, drop console
├── package.json                      # Dependencias y scripts npm
│
├── public/                           # Assets estáticos servidos en /
│
├── docs/                             # Esta documentación
│
└── src/
    ├── main.js                       # Bootstrap de la app: createApp + i18n + mount
    ├── App.vue                       # Raíz: gestión de locale, composición de layout
    ├── style.css                     # Estilos base: body, h1-h6, fade-in app
    │
    ├── components/
    │   ├── SkipLink.vue              # Accesibilidad: skip links para teclado
    │   ├── Language.vue              # Selector de idioma (banderas ES/VA)
    │   ├── Header.vue                # Cabecera: logo + patrocinador
    │   └── Scenes.vue                # Componente principal: carousel + audio + subtítulos
    │
    ├── composables/
    │   ├── useQueryParams.js         # Lee ?lang y ?init de la URL
    │   ├── useAudioControl.js        # Estado y control de reproducción de audio
    │   └── useSubtitles.js           # Sincronización de subtítulos con audio
    │
    ├── lang/
    │   ├── es.json                   # Traducciones español + rutas de assets ES
    │   └── va.json                   # Traducciones valenciano + rutas de assets VA
    │
    ├── assets/
    │   ├── audio/
    │   │   ├── Spanish/              # MP3 + JSON subtítulos en español
    │   │   └── Valencia/             # MP3 + JSON subtítulos en valenciano
    │   ├── img/                      # logo.png, anis_tenis.png, valencia.svg, spain.svg
    │   └── video/
    │       └── signLanguageIntroduction.mp4
    │
    └── scss/
        ├── custom.scss               # Fichero principal SCSS (importa todo)
        ├── custom.css                # Compilado de custom.scss (no editar manualmente)
        ├── tokens/
        │   └── _tokens.scss          # CSS Custom Properties: colores, tipografía, espaciado
        ├── components/
        │   ├── _buttons.scss         # Sistema de botones .btn-audio
        │   ├── _scenes.scss          # .scene-card y .scene-card__title
        │   └── _header.scss          # .site-header y variantes
        └── utilities/
            ├── _widths.scss          # Clases .w-* (fijas y porcentuales)
            ├── _heights.scss         # Clases .h-*
            ├── _marginPadding.scss   # Clases .mt-*, .mb-*, .p-*, etc.
            ├── _colors.scss          # .text-yellow y variantes Swiper
            └── _fontSize.scss        # Clases .fs-text_xs → .fs-text_9xl
```

---

## Diagrama de componentes

```
index.html
    └── #app
         └── App.vue  (gestiona locale + messages)
              ├── SkipLink.vue          (skip links accesibilidad)
              ├── Language.vue          (selector idioma, solo en intro)
              ├── Header.vue            (logo + patrocinador)
              └── Scenes.vue            (lógica principal)
                   ├── useQueryParams   (URL params)
                   ├── useAudioControl  (audio state)
                   ├── useSubtitles     (subtitle sync)
                   ├── [Swiper intro]   (pantalla introducción)
                   ├── [Swiper signos]  (vídeo lengua de signos)
                   └── [Swiper escenas] (carrusel 5 escenas + nav)
```

---

## Flujo de bootstrap

```
1. index.html se carga
   ├── Google Fonts (Inter + Playfair Display) — preconnect + link
   ├── custom.css (SCSS compilado con tokens + Bootstrap utilities + componentes)
   └── Bootstrap JS (CDN) + ACS Barrierfree script

2. main.js ejecuta
   ├── Importa es.json y va.json
   ├── Crea instancia vue-i18n (legacy: false, defaultLocale: 'ca-valencia')
   ├── Lee document.documentElement.lang para locale inicial
   ├── Monta App.vue en #app
   └── style.css aplica fade-in en #app (0.4s)

3. App.vue onMounted
   ├── Lee ?lang de URL (useQueryParams) → sobrescribe locale si presente
   └── watch(locale) → actualiza messages.value + document.lang

4. Scenes.vue montado
   ├── useQueryParams → initScene (modo de pantalla)
   ├── useAudioControl → refs de audio + estado
   └── useSubtitles → listo para sincronizar
```

---

## Configuración Vite (`vite.config.js`)

```js
{
  plugins: [vue()],

  resolve: {
    alias: { '@': resolve(__dirname, 'src') }  // @/composables, @/components, etc.
  },

  esbuild: {
    drop: ['console']  // Elimina todos los console.log en producción
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue:    ['vue', 'vue-i18n'],   // ~122 KB gzip 43 KB
          swiper: ['swiper'],             // ~67 KB gzip 21 KB
        }
      }
    }
  }
}
```

**Por qué code splitting:** El chunk `vue` y `swiper` se cachean por separado. Si solo cambia la lógica de la app, el navegador solo descarga el bundle principal (~35 KB), no los vendors.

---

## CSS: dos pipelines paralelos

| Pipeline | Ficheros | Compilado por | Cargado en |
|---|---|---|---|
| SCSS global | `custom.scss` → `custom.css` | `npx sass` (manual) | `<link>` en `index.html` |
| CSS de componentes | `<style scoped>` en `.vue` | Vite (automático) | Bundle JS |

> **Importante:** Si editas `src/scss/custom.scss` o cualquier `_partial.scss`, debes recompilar manualmente con `npx sass`. Vite NO vigila estos ficheros en dev.

---

## Accesibilidad en la arquitectura

- `SkipLink.vue` — permite saltar al menú de idiomas (`#languages`) o al contenido principal (`#main-content`)
- Todas las imágenes decorativas tienen `role="none"` o `alt=""`
- Touch targets mínimo 44px en todos los elementos interactivos
- `prefers-reduced-motion` desactiva todas las animaciones y transiciones
- `aria-live="polite"` en el área de subtítulos para lectores de pantalla
