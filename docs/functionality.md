# Funcionalidad

## Modos de pantalla

La app tiene tres modos controlados por el parámetro `initScene` (derivado de `?init` en la URL):

| Valor `initScene` | URL | Pantalla |
|---|---|---|
| `-1` (por defecto) | `/` o `/?init=` sin valor | **Introducción** |
| `0`–`4` | `/?init=1` → `/?init=5` | **Carrusel de escenas** (escena 1–5) |
| `6` | (navegación interna) | **Vídeo lengua de signos** |

---

## Pantalla 1: Introducción

Se muestra cuando no hay `?init` en la URL.

**Contenido:**
- Selector de idioma (banderas valenciana y española) — solo visible en esta pantalla
- Cabecera con logo y patrocinador (Anís Tenis)
- Título "Introducció / Introducción"
- Botón **Audioguía** — reproduce el audio de introducción
- Botón **Activar/Desactivar Subtítulos** — muestra subtítulos sincronizados
- Botón **Llenguatge de signes / Lenguaje de signos** — navega a la pantalla de vídeo

**Flujo de usuario típico:**
```
1. Usuario selecciona idioma (valenciano por defecto)
2. Pulsa "Audioguía" → se reproduce el audio de introducción
3. Pulsa "Activar Subtítols" → aparecen subtítulos sincronizados
4. Pulsa "Língua de signes" → navega al vídeo
   O bien:
4. Navega manualmente a las escenas via URL (?init=1)
```

---

## Pantalla 2: Carrusel de escenas

Se accede con `?init=1` hasta `?init=5` (o navegando con las flechas desde cualquier escena).

**Estructura de cada slide:**
```
┌─────────────────────────────┐
│  [Título de la escena]      │  ← .scene-card__title (Playfair Display, dorado)
│                             │
│  [Botón Reproduir audioguia]│  ← .btn-audio (primario)
│  [Botón Activar Subtítols]  │  ← .btn-audio--secondary
│                             │
│  [Subtítulos pill]          │  ← solo si showSubtitles && hay subtítulo activo
└─────────────────────────────┘
│  ‹    1 / 5    ›            │  ← .scene-nav (fuera del Swiper)
└─────────────────────────────┘
```

**Navegación:**
- Flechas `‹` / `›` — cambio de escena con efecto fade (400ms)
- Swipe táctil — funciona por defecto con Swiper
- El carrusel es **loop**: después de la escena 5 vuelve a la 1
- Al cambiar de escena: el audio de la escena anterior se **pausa y resetea**

**5 escenas:**

| Escena | Valenciano | Español |
|---|---|---|
| 1 | Banyà | Banyà (El Baño) |
| 2 | La nympha del aigua | La ninfa del agua |
| 3 | Papallones a la panxa | Mariposas en el estómago |
| 4 | Memòria de foc | Memoria de fuego |
| 5 | Cendra i flama | Ceniza y llama |

---

## Pantalla 3: Vídeo lengua de signos

Se accede desde el botón "Llengua de signes" de la introducción.

**Contenido:**
- Título "Introducció en llengua de signes"
- Vídeo `signLanguageIntroduction.mp4` con controles nativos, autoplay, playsinline
- Track de captions VTT adjunto

---

## Feature: Reproducción de audio

Cada pantalla tiene su propio elemento `<audio>` con ID único (`audioPlayerIntroduction`, `audioPlayer1`–`audioPlayer5`).

**Estados del botón de audio:**

| Estado | Clase CSS | Texto del botón | Comportamiento |
|---|---|---|---|
| Listo | (ninguna) | "Reproduir audioguia" | Clic → reproduce |
| Reproduciendo | (ninguna) | "Pausar audioguia" | Clic → pausa |
| Cargando | `.is-loading` | "Carregant..." | Pulse animation, deshabilitado |
| Error | `.is-error` | "Error al carregar l'àudio" | Rojo, deshabilitado |

**Reseteo automático:** cuando el usuario cambia de idioma, todos los audios se pausan, vuelven a `currentTime = 0` y recargan el fichero de la nueva lengua.

---

## Feature: Subtítulos sincronizados

**Activación:**
1. Usuario pulsa "Activar Subtítols"
2. Se hace un **fetch único** del JSON de subtítulos para esa escena
3. Se inicia un `setInterval` cada 100ms que lee `audio.currentTime`
4. El subtítulo activo se muestra en un pill dorado semitransparente

**Desactivación:**
1. Usuario pulsa "Desactivar Subtítols"
2. Se limpia el intervalo y se borra el cache

**Formato del fichero JSON de subtítulos:**
```json
{
  "stab_segments": [
    { "start": 0.0, "end": 1.8, "word": "Banyar" },
    { "start": 1.8, "end": 3.2, "word": "és sinònim de piler del foc" },
    ...
  ]
}
```

La ruta del JSON de subtítulos viene del fichero de traducciones: `es.json` → `subtitle1`, `subtitle2`… apuntan a `/assets/audio/Spanish/Scene1.json` etc.

---

## Feature: Selector de idioma

- Solo visible en la pantalla de introducción (`initScene === -1`)
- Banderas como botones con `aria-pressed` (indica idioma activo)
- Idioma activo: borde dorado + opacidad 100%
- Idioma inactivo: sin borde + opacidad 55%
- Por defecto: **valenciano** (`va`)
- Sobrescribible con `?lang=es`

---

## Feature: Accesibilidad

- **Skip links:** al pulsar Tab desde el inicio, aparecen dos enlaces para saltar al menú de idiomas o al contenido principal
- **Teclado:** todos los botones son navegables y activables con Enter/Space
- **ARIA:** cada audio tiene `aria-controls`, el carrusel tiene `aria-label` con "escena X de 5"
- **Zoom:** viewport permite hasta 5× (accesibilidad visual)
- **Reduced motion:** si el usuario tiene activado `prefers-reduced-motion`, se desactivan todas las animaciones y transiciones CSS
