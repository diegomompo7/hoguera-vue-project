# Business Logic

## Gestión de idioma y locale

### Detección inicial (`main.js`)

```js
const i18n = createI18n({
  legacy: false,
  locale: document.documentElement.lang || 'ca-valencia',  // lee <html lang="...">
  defaultLocale: 'ca-valencia',
  messages: { 'es': Spanish, 'ca-valencia': Valencia },
})
```

`index.html` tiene `<html lang="ca-valencia">`, así que el locale inicial es siempre `'ca-valencia'`.

### Sobrescritura y propagación (`App.vue`)

```js
// Prioridad: ?lang > HTML lang > 'va'
onMounted(() => {
  locale.value = lang ?? 'va'  // lang viene de useQueryParams
})

// Cuando cambia el locale: actualiza el ref messages + el atributo HTML lang
watch(locale, (newLocale) => {
  switch (newLocale) {
    case 'es':
      messages.value = Spanish
      document.documentElement.lang = 'es'
      break
    case 'va':
    default:
      messages.value = Valencia
      document.documentElement.lang = 'ca-valencia'
      break
  }
}, { immediate: true })
```

> **Nota importante:** `messages` en `App.vue` es un `ref` manual, **no** el objeto de vue-i18n. Se pasa como prop a los componentes. Los componentes usan `messages.header`, `messages.playAudio`, etc. directamente para los textos UI.
>
> Los componentes también usan `$t('audioIntroduction')`, `$t('audio1')`, etc. para obtener **rutas de assets**. Esto permite que el mismo `<audio :src="$t('audio1')">` apunte a ficheros distintos según el locale sin lógica condicional.

### Por qué dos sistemas en paralelo

| Sistema | Qué maneja | Usado en |
|---|---|---|
| `messages` ref (manual) | Textos de la interfaz | Atributos, textos de botón, aria-labels |
| `$t()` de vue-i18n | Rutas de assets (audio, subtítulos) | `<source :src>`, fetch en useSubtitles |

---

## Composable: `useQueryParams`

**Fichero:** `src/composables/useQueryParams.js`

```js
// Singleton: se parsea UNA vez al importar el módulo.
// Todos los componentes reciben el MISMO ref reactivo.
const params = new URLSearchParams(window.location.search)
const _lang      = params.get('lang')
const initParam  = params.get('init')
const _initScene = ref(initParam !== null ? Number(initParam) - 1 : -1)

export function useQueryParams() {
  return { lang: _lang, initScene: _initScene }
}
```

**Por qué singleton:** `initScene` se muta desde `Scenes.vue` al navegar (p.ej. `initScene.value = 6` al ir a lengua de signos). Si se creara un `ref` nuevo en cada llamada, `Language.vue`, `App.vue` y `Scenes.vue` tendrían instancias independientes y los cambios no se propagarían.

**Regla de conversión URL → índice interno:**

| URL | `initScene` | Pantalla |
|---|---|---|
| Sin `?init` | `-1` | Introducción |
| `?init=1` | `0` | Escena 1 del carrusel |
| `?init=5` | `4` | Escena 5 del carrusel |
| (navegación interna) | `6` | Vídeo lengua de signos |

---

## Composable: `useAudioControl`

**Fichero:** `src/composables/useAudioControl.js`

### Índices del array de audio

El composable gestiona **7 slots** (índices 0–6):

| Índice | Audio |
|---|---|
| `0` | Introducción (`audioPlayerIntroduction`) |
| `1`–`5` | Escenas 1–5 del carrusel |
| `6` | Reservado (no usado actualmente) |

### Estado reactivo

```js
const audioRefs  = ref(new Array(7).fill(null))  // refs a los <audio> del DOM
const isPlayed   = ref(new Array(7).fill(false)) // true = reproduciendo ahora
const isLoading  = ref(new Array(7).fill(false)) // true = cargando (loadstart)
const isError    = ref(new Array(7).fill(false)) // true = error de carga
```

### API del composable

```js
controlAudio(index)      // Toggle play/pause
pauseAll()               // Pausa y resetea currentTime en todos los activos
handleAudioEnded(index)  // @ended: isPlayed[index] = false
handleLoadStart(index)   // @loadstart: isLoading = true, isError = false
handleCanPlay(index)     // @canplay: isLoading = false
handleAudioError(index)  // @error: isError = true, isPlayed = false
```

### Reset al cambiar idioma

```js
watch(getLanguage, () => {
  audioRefs.value.forEach((audioRef, index) => {
    if (audioRef) {
      audioRef.pause()
      audioRef.currentTime = 0
      audioRef.load()              // Recarga el src apuntando al nuevo idioma
      isPlayed.value[index]  = false
      isLoading.value[index] = false
      isError.value[index]   = false
    }
  })
})
```

### Wrapper `onAudioEnded` en `Scenes.vue`

```js
// En Scenes.vue — combina dos acciones en un solo callback
const onAudioEnded = (index) => {
  handleAudioEnded(index)  // isPlayed[index] = false
  resetSubtitles()         // Oculta subtítulos + limpia polling
}
```

El template usa `@ended="onAudioEnded(index)"`. Si se usara `handleAudioEnded` directamente, los subtítulos quedarían visibles aunque el audio ya hubiera terminado.

---

## Composable: `useSubtitles`

**Fichero:** `src/composables/useSubtitles.js`

### Flujo al activar subtítulos

```
Usuario pulsa "Activar Subtítols"
  → toggleSubtitles(subtitleNumber)
  → showSubtitles.value = true
  → sceneNumber = subtitleNumber + 1   (mismo índice que audioRefs)
  → Lee audio.id para construir la clave: id.replace('audioPlayer', '')
    Ej: 'audioPlayerIntroduction' → 'Introduction' → messages.subtitleIntroduction
  → fetch(url) → almacena stab_segments[] en subtitleCache (cache en memoria)
  → setInterval(updateCurrentSubtitle, 100ms)

Cada 100ms:
  → lee audio.currentTime
  → busca en subtitleCache el segmento con start ≤ t ≤ end
  → actualiza currentSubtitle.value (o null si no hay match)
```

### Flujo al desactivar

```
Usuario pulsa "Desactivar Subtítols"
  → showSubtitles.value = false
  → currentSubtitle.value = null
  → subtitleCache = null
  → clearInterval()
```

### Cleanup automático

```js
onUnmounted(() => {
  clearInterval_()  // Evita memory leak si el componente se destruye
})
```

### Claves de subtítulos en los ficheros de traducción

| Audio | Clave en messages | Ruta ES | Ruta VA |
|---|---|---|---|
| Intro | `subtitleIntroduction` | `/assets/audio/Spanish/SceneIntroduction.json` | `/assets/audio/Valencia/SceneIntroduction.json` |
| Escena 1 | `subtitle1` | `/assets/audio/Spanish/Scene1.json` | `/assets/audio/Valencia/Scene1.json` |
| Escena 2 | `subtitle2` | `/assets/audio/Spanish/Scene2.json` | `/assets/audio/Valencia/Scene2.json` |
| ... | ... | ... | ... |

---

## Ficheros de traducción (`es.json` / `va.json`)

Cada fichero contiene **dos tipos de claves**:

### 1. Textos de la interfaz

```json
{
  "introduction":      "Introducció",
  "audioGuide":        "Audioguia",
  "playAudio":         "Reproduir audioguia",
  "pauseAudio":        "Pausar audioguia",
  "audioLoading":      "Carregant...",
  "audioError":        "Error en carregar l'àudio",
  "enableSubtitle":    "Activar Subtítols",
  "disableSubtitle":   "Desactivar Subtítols",
  "signLanguageButton":"Llenguatge de signes",
  "signLanguage":      "Introducció en llenguatge de signes",
  "scene1":            "Banyà",
  "scene2":            "La nympha del aigua",
  "nextScene":         "Següent escena",
  "previousScene":     "Anterior escena",
  "language":          "Idioma",
  "header":            "Capçalera",
  "sponsors":          "Patrocinadors",
  "pageValencia":      "Pàgina en Valencià",
  "pageSpanish":       "Pàgina en Castellà"
}
```

### 2. Rutas de assets multimedia

```json
{
  "audioIntroduction": "/assets/audio/Valencia/SceneIntroduction.mp3",
  "audio1":            "/assets/audio/Valencia/Scene12025.mp3",
  "audio2":            "/assets/audio/Valencia/Scene22025.mp3",
  "subtitleIntroduction": "/assets/audio/Valencia/SceneIntroduction.json",
  "subtitle1":         "/assets/audio/Valencia/Scene1.json"
}
```

> **Patrón clave:** cambiar el idioma cambia simultáneamente los **textos** y las **rutas de los ficheros de audio y subtítulos**. El mismo `<audio>` apunta a un MP3 diferente según el locale.

---

## Gestión del carrusel

### Índice circular de escenas

Los slides del carrusel se renderizan con `v-for="(_, index) in 5"` (índices 0–4). El mapeado a las claves de traducción usa aritmética modular:

```js
const sceneKey = ((5 + index) % 5) + 1
// index=0 → sceneKey=1, index=1 → sceneKey=2, ... index=4 → sceneKey=5
```

La fórmula `(5 + index) % 5` es necesaria para que el carrusel en loop no use índices negativos.

### Cambio de escena

```js
// Evento @slideChangeTransitionStart de Swiper
const handleSlideChange = (swiper) => {
  currentSlide.value = swiper.realIndex  // Para el contador "1/5"
  pauseAll()                              // Para el audio de la escena anterior
  resetSubtitles()                        // Oculta subtítulos
}
```

### Navegación externa

Los botones `‹` / `›` están **fuera del Swiper** (`.scene-nav`) para evitar que el DOM de Swiper los desplace al hacer loop:

```js
const navigateNext = () => swiperInstance.value?.slideNext()
const navigatePrev = () => swiperInstance.value?.slidePrev()
```
