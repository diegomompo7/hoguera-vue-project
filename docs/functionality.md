# Funcionalidad

## Los tres modos de pantalla

La app renderiza uno de tres bloques según el valor de `initScene` (derivado de `?init` en la URL):

| `initScene` | URL de entrada | Pantalla |
|---|---|---|
| `-1` | `/` (sin parámetro) | **Introducción** |
| `0`–`4` | `/?init=1` → `/?init=5` | **Carrusel de escenas** |
| `6` | (navegación interna) | **Vídeo lengua de signos** |

El cambio entre modos se hace mutando `initScene.value` desde `Scenes.vue`:
- Al pulsar "Llengua de signes" → `initScene.value = 6`
- Al cargar con `?init=N` → `initScene = N - 1` (conversión 1-indexed → 0-indexed)

---

## Pantalla 1 — Introducción (`initScene === -1`)

Se muestra al entrar sin `?init` en la URL. Es la pantalla de bienvenida.

**Estructura visual:**
```
[ selector idioma VA | ES ]      ← Language.vue (solo visible aquí)
[ logo ]         [ Anis Tenis ]  ← Header.vue
┌────────────────────────────┐
│    Introducció / Introducción  ← h1 .scene-card__title
│                            │
│  [ Audioguia ]             │  ← botón primario .btn-audio
│  [ Activar Subtítols ]     │  ← botón secundario .btn-audio--secondary
│                            │
│  [ Llenguatge de signes ]  │  ← botón primario → navega a modo 3
└────────────────────────────┘
```

**Flujo típico del usuario:**
1. Selecciona idioma (valenciano por defecto)
2. Pulsa "Audioguia" → se reproduce el audio de introducción
3. Pulsa "Activar Subtítols" → aparecen subtítulos sincronizados con el audio
4. Pulsa "Llengua de signes" → navega al vídeo de introducción en LSE

---

## Pantalla 2 — Carrusel de escenas (`initScene` 0–4)

Se accede con `?init=1` hasta `?init=5`, o navegando con las flechas dentro del carrusel.

**Estructura visual:**
```
[ logo ]         [ Anis Tenis ]
┌────────────────────────────┐
│    Banyà / Fuego           │  ← .scene-card__title (Playfair Display, dorado)
│                            │
│  [ Reproduir audioguia ]   │  ← .btn-audio
│  [ Activar Subtítols ]     │  ← .btn-audio--secondary
│                            │
│  [subtítulos pill]         │  ← visible solo si showSubtitles && hay segmento activo
└────────────────────────────┘
  ‹        1 / 5        ›       ← .scene-nav (fuera del Swiper)
```

**Navegación:**
- Flechas `‹` / `›` — cambian de escena (botones externos al Swiper)
- Swipe táctil horizontal
- Carrusel con **loop** — tras la escena 5 vuelve a la 1
- Al cambiar de escena: el audio en curso se **pausa y resetea**, los subtítulos se **ocultan**

**5 escenas:**

| Escena | Valenciano | Español |
|---|---|---|
| 1 | Banyà | Fuego |
| 2 | La nympha del aigua | Tierra de luz y color |
| 3 | Papallones a la panxa | Agua |
| 4 | Àngels que banyen a alacant i a als alacantins | Noche |
| 5 | Una banyà centenaria | Escena 5 Español |

---

## Pantalla 3 — Vídeo lengua de signos (`initScene === 6`)

Se accede desde el botón "Llengua de signes" de la pantalla de introducción.

**Contenido:**
- Título `messages.signLanguage` en `.scene-card__title`
- Vídeo `signLanguageIntroduction.mp4` con controles nativos
- Track de captions VTT adjunto (`/assets/captions/signLanguageIntroduction.vtt`)
- Sin `autoplay` — el usuario inicia la reproducción

---

## Feature: Reproducción de audio

Cada pantalla tiene su elemento `<audio>` con `id` único (`audioPlayerIntroduction`, `audioPlayer1`–`audioPlayer5`). El botón cambia de texto y estado según el ciclo de vida del audio:

| Estado | Clase CSS | Texto del botón | Comportamiento del botón |
|---|---|---|---|
| Listo | — | `playAudio` / `audioGuide` | Clic → reproduce |
| Reproduciendo | — | `pauseAudio` | Clic → pausa |
| Cargando | `.is-loading` | `audioLoading` | Animación pulse, deshabilitado |
| Error | `.is-error` | `audioError` | Texto rojo, no interactivo |

**Reseteo automático al cambiar idioma:** todos los audios se pausan, vuelven a `currentTime = 0` y recargan el fichero del nuevo idioma (porque `src` apunta a rutas distintas según el locale).

**Al terminar el audio:** se marca `isPlayed[index] = false` y los subtítulos se ocultan automáticamente (`onAudioEnded` en `Scenes.vue`).

---

## Feature: Subtítulos sincronizados

**Activación:**
1. Usuario pulsa "Activar Subtítols"
2. Se hace un **fetch único** del JSON de subtítulos de esa escena (`messages.subtitle1`, `messages.subtitleIntroduction`, etc.)
3. Se inicia un `setInterval` cada 100ms que lee `audio.currentTime`
4. El segmento activo se muestra en un pill dorado semitransparente

**Durante la reproducción:** cada 100ms se busca en el cache el segmento cuyo `start ≤ currentTime ≤ end`. Si lo hay, se muestra; si no, el pill desaparece.

**Desactivación:**
- Usuario pulsa "Desactivar Subtítols" → se limpia el intervalo, se borra el cache, el pill desaparece
- El audio termina de forma natural → `onAudioEnded` llama a `resetSubtitles()` automáticamente
- El usuario cambia de escena → `handleSlideChange` llama a `resetSubtitles()`

**Formato del JSON de subtítulos:**
```json
{
  "stab_segments": [
    { "start": 0.0,  "end": 1.8,  "word": "Banyar" },
    { "start": 1.8,  "end": 3.2,  "word": "és sinònim de piler del foc," },
    { "start": 3.2,  "end": 5.0,  "word": "és l'humitat de l'estiu" }
  ]
}
```

---

## Feature: Selector de idioma

- Visible **solo** en la pantalla de introducción (`initScene === -1`)
- Dos botones con banderas: valenciana y española
- Estado activo: borde dorado + opacidad 100% + `aria-pressed="true"`
- Estado inactivo: sin borde + opacidad 55% + `aria-pressed="false"`
- Por defecto: **valenciano** (`va`)
- Sobrescribible con `?lang=es` en la URL

**Cambiar idioma:**
1. `setLanguage('va'|'es')` → cambia `locale.value`
2. El watcher en `App.vue` → actualiza `messages.value` + `document.documentElement.lang`
3. Los `<audio>` se recargan automáticamente (nueva `src` del nuevo idioma)
4. El `$t('audioX')` de los elementos `<source>` apunta a rutas distintas según el locale

---

## Feature: Accesibilidad

| Función | Implementación |
|---|---|
| Skip links | Tab desde el inicio muestra enlace "Saltar al menú" / "Saltar al contingut" |
| Teclado | Todos los botones son navegables y activables con Enter/Space |
| Estados anunciados | `aria-live="polite"` en el área de subtítulos |
| Foco visible | `:focus-visible` con outline dorado 3px (solo al navegar con teclado) |
| Movimiento reducido | `prefers-reduced-motion: reduce` desactiva animaciones CSS y transiciones |
| Zoom | Viewport permite hasta 5× de zoom (usuarios con baja visión) |
| Contraste | Dorado `#FFD700` sobre negro `#000` — ratio alto |
| Touch targets | Mínimo 44px en todos los elementos interactivos |
