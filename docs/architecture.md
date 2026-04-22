# Arquitectura

## Estructura de carpetas

```
hoguera-vue-project/
│
├── index.html                        # Entrada HTML: fuentes Google, meta OG, mount point #app
├── vite.config.js                    # Build: alias @, code splitting, drop console en prod
├── package.json
│
├── docs/                             # Esta documentación
│
└── src/
    ├── main.js                       # Bootstrap: createApp + vue-i18n + mount
    ├── App.vue                       # Raíz: gestión de locale, composición de layout
    ├── style.css                     # Estilos base: gradiente fondo, fade-in app, tipografía
    │
    ├── components/
    │   ├── SkipLink.vue              # Skip links para navegación por teclado
    │   ├── Language.vue              # Selector de idioma (banderas VA/ES)
    │   ├── Header.vue                # Cabecera: logo + patrocinador Anis Tenis
    │   └── Scenes.vue                # Componente principal: 3 modos + audio + subtítulos
    │
    ├── composables/
    │   ├── useQueryParams.js         # Singleton: lee ?lang y ?init de la URL
    │   ├── useAudioControl.js        # Estado y control de reproducción de 7 audios
    │   └── useSubtitles.js           # Fetch + polling de subtítulos sincronizados
    │
    ├── lang/
    │   ├── es.json                   # Textos ES + rutas de assets en español
    │   └── va.json                   # Textos VA + rutas de assets en valenciano
    │
    ├── assets/
    │   ├── audio/
    │   │   ├── Spanish/              # SceneIntroduction.mp3, Scene1–5.mp3 + JSON subtítulos
    │   │   └── Valencia/             # SceneIntroduction.mp3, Scene1–52025.mp3 + JSON subtítulos
    │   ├── img/                      # logo.png, anis_tenis.png, valencia.svg, spain.svg
    │   └── video/
    │       └── signLanguageIntroduction.mp4
    │
    └── scss/
        ├── custom.scss               # Fichero principal (importa todo el sistema)
        ├── custom.css                # Compilado de custom.scss — NO editar manualmente
        ├── tokens/
        │   └── _tokens.scss          # CSS Custom Properties: colores, tipografía, espaciado, glow
        ├── components/
        │   ├── _buttons.scss         # .btn-audio y .btn-audio--secondary
        │   ├── _scenes.scss          # .scene-card y animación titleFadeIn
        │   └── _header.scss          # .site-header BEM
        └── utilities/
            ├── _widths.scss          # .w-* (rem fijos + porcentuales fraccionales)
            ├── _heights.scss         # .h-*
            ├── _marginPadding.scss   # .mt-*, .mb-*, .pt-*, .pb-*, etc.
            ├── _colors.scss          # .text-yellow
            └── _fontSize.scss        # .fs-text_xs → .fs-text_9xl
```

---

## Diagrama de componentes

```
index.html
    └── #app
         └── App.vue           ← gestiona locale + messages ref
              ├── SkipLink.vue  ← skip links (teclado)
              ├── Language.vue  ← selector idioma VA/ES (solo en intro)
              ├── Header.vue    ← logo + patrocinador
              └── Scenes.vue    ← lógica principal
                   ├── useQueryParams   (URL → initScene singleton)
                   ├── useAudioControl  (7 slots de audio)
                   ├── useSubtitles     (fetch + polling)
                   ├── [Swiper intro]   initScene === -1
                   ├── [Swiper signos]  initScene === 6
                   └── [Swiper carrusel] initScene 0–4
```

---

## Flujo de arranque

```
1. index.html carga
   ├── Google Fonts (Inter + Playfair Display) — preconnect
   ├── src/scss/custom.css — tokens + Bootstrap utilities + botones + escenas + header
   └── Bootstrap JS (CDN) + ACS Barrierfree (accesibilidad)

2. main.js ejecuta
   ├── Importa es.json y va.json
   ├── Crea instancia vue-i18n
   │    ├── legacy: false  (modo Composition API)
   │    ├── locale: document.documentElement.lang || 'ca-valencia'
   │    ├── defaultLocale: 'ca-valencia'
   │    └── messages: { 'es': Spanish, 'ca-valencia': Valencia }
   └── createApp(App).use(i18n).mount('#app')

3. App.vue se monta
   ├── onMounted: locale.value = lang ?? 'va'  (lang viene de useQueryParams)
   └── watch(locale, { immediate: true })
        ├── 'es'  → messages.value = Spanish  + document.lang = 'es'
        └── 'va'  → messages.value = Valencia + document.lang = 'ca-valencia'

4. Scenes.vue se monta
   ├── useQueryParams() → initScene (ref singleton, compartido)
   ├── useAudioControl(() => props.language) → audioRefs, isPlayed, isLoading, isError
   └── useSubtitles(audioRefs, () => props.messages) → showSubtitles, currentSubtitle
```

---

## Configuración Vite

```js
// vite.config.js
{
  plugins: [vue()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }  // import '@/composables/...'
  },
  esbuild: {
    drop: ['console']   // Elimina console.log/warn/error en producción
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue:    ['vue', 'vue-i18n'],  // ~122 KB / gzip 43 KB — cacheado por separado
          swiper: ['swiper'],            // ~67 KB / gzip 21 KB — cacheado por separado
        }
      }
    }
  }
}
```

> **Por qué code splitting:** Si solo cambia la lógica de la app, el navegador solo descarga el bundle principal (~37 KB). Los vendors `vue` y `swiper` se sirven cacheados desde la visita anterior.

---

## CSS: dos pipelines paralelos

| Pipeline | Ficheros fuente | Compilado por | Cargado en |
|---|---|---|---|
| SCSS global | `custom.scss` → `custom.css` | `npx sass` (manual) | `<link>` en `index.html` |
| CSS de componentes | `<style scoped>` en `.vue` | Vite (automático en build) | Bundle JS |

> **Importante:** Si editas `src/scss/custom.scss` o cualquier `_partial.scss`, debes ejecutar `npx sass` manualmente. Vite **no** vigila estos ficheros durante `npm run dev`.

Los estilos en `<style scoped>` de `Scenes.vue` tienen precedencia sobre las clases globales de `custom.css` para los overrides específicos del carrusel (p.ej. `padding-bottom: 0` en `.scene-card`).

---

## Accesibilidad en la arquitectura

| Mecanismo | Implementación |
|---|---|
| Skip links | `SkipLink.vue` → `#languages` y `#main-content` |
| Landmarks ARIA | `<header>`, `<main>`, `role="region"` en bloques de contenido |
| Un solo `<h1>` | El título de la escena activa en `Scenes.vue`; `Header.vue` usa `<span class="visually-hidden">` |
| Estados de botón | `aria-pressed` (idioma), `aria-controls` (audio), `aria-label` dinámico |
| Subtítulos | `role="status" aria-live="polite"` — lectores de pantalla los anuncian |
| Touch targets | Mínimo 44px en todos los elementos interactivos |
| Teclado | `:focus-visible` con outline 3px dorado; `:focus:not(:focus-visible)` sin outline |
| Movimiento | `prefers-reduced-motion` desactiva animaciones y transiciones en tokens y CSS scoped |
| Vídeo | Sin `autoplay` — el usuario decide cuándo reproducirlo |
| Imágenes decorativas | `alt=""` + `role="none"` |
| Zoom | `maximum-scale=5.0` en viewport — permite hasta 5× de zoom |
