# Business Logic

## Gestión de idioma y locale

### Detección inicial (`main.js`)
```js
// Lee el atributo lang del HTML como locale inicial
const locale = document.documentElement.lang || 'ca-valencia';

createI18n({
  legacy: false,
  locale: locale,
  defaultLocale: 'ca-valencia',
  messages: { 'es': Spanish, 'ca-valencia': Valencia }
})
```

### Sobrescritura por URL y propagación (`App.vue`)
```js
// Prioridad: ?lang > HTML lang > 'va'
onMounted(() => {
  locale.value = lang ?? 'va';  // lang viene de useQueryParams
});

// Cuando cambia el locale: actualiza messages + HTML lang
watch(locale, (newLocale) => {
  switch (newLocale) {
    case 'es':
      messages.value = Spanish;
      document.documentElement.lang = 'es';
      break;
    case 'va':
      messages.value = Valencia;
      document.documentElement.lang = 'ca-valencia';
      break;
  }
});
```

> **Importante:** `messages` en `App.vue` es un `ref` manual (no el de vue-i18n). Se pasa como prop a los componentes hijos. Los componentes usan `messages.header`, `messages.playAudio`, etc. directamente — no usan `$t()`.

---

## Composable: `useQueryParams`

**Fichero:** `src/composables/useQueryParams.js`

```js
export function useQueryParams() {
  const params = new URLSearchParams(window.location.search)
  const lang = params.get('lang')                           // 'es' | 'va' | null
  const initParam = params.get('init')
  const initScene = ref(initParam !== null ? Number(initParam) - 1 : -1)
  return { lang, initScene }
}
```

**Regla de conversión:**
- URL `?init=1` → `initScene = 0` (escena 1, índice 0)
- URL `?init=5` → `initScene = 4` (escena 5, índice 4)
- Sin `?init` → `initScene = -1` (pantalla de introducción)
- `?init=7` → `initScene = 6` (vídeo lengua de signos, navegación interna)

**Uso en componentes:**
```js
const { lang, initScene } = useQueryParams()
// initScene es un ref reactivo
// lang es un string plano (no reactivo, solo se lee al montar)
```

---

## Composable: `useAudioControl`

**Fichero:** `src/composables/useAudioControl.js`

### Índices del array de audio

El composable gestiona **7 slots de audio** (índices 0–6):

| Índice | Audio |
|---|---|
| 0 | Introducción (`audioPlayerIntroduction`, `initScene + 1 = 0`) |
| 1–5 | Escenas 1–5 del carrusel |
| 6 | (reservado / lengua de signos) |

### Estado reactivo
```js
const audioRefs  = ref(new Array(7).fill(null))   // Referencias a los <audio> del DOM
const isPlayed   = ref(new Array(7).fill(false))  // true = reproduciendo
const isLoading  = ref(new Array(7).fill(false))  // true = cargando
const isError    = ref(new Array(7).fill(false))  // true = error de carga
```

### Funciones
```js
controlAudio(index)      // Toggle play/pause para el audio en [index]
pauseAll()               // Pausa y resetea TODOS los audios activos
handleAudioEnded(index)  // Callback @ended: marca isPlayed[index] = false
handleLoadStart(index)   // Callback @loadstart: isLoading = true
handleCanPlay(index)     // Callback @canplay: isLoading = false
handleAudioError(index)  // Callback @error: isError = true, isPlayed = false
```

### Reset automático al cambiar idioma
```js
watch(getLanguage, () => {
  audioRefs.value.forEach((audioRef, index) => {
    if (audioRef) {
      audioRef.pause()
      audioRef.currentTime = 0
      audioRef.load()              // Recarga el src del nuevo idioma
      isPlayed.value[index] = false
      isLoading.value[index] = false
      isError.value[index] = false
    }
  })
})
```
El `src` del audio cambia porque viene de `$t('audio1')`, `$t('audio2')` etc., que apuntan a rutas diferentes según el locale.

---

## Composable: `useSubtitles`

**Fichero:** `src/composables/useSubtitles.js`

### Flujo al activar subtítulos
```
Usuario pulsa "Activar Subtítols"
  → toggleSubtitles(sceneIndex)
  → showSubtitles = true
  → sceneNumber = sceneIndex + 1  (mismo índice que audioRefs)
  → Fetch JSON desde messages[`subtitle${key}`]
  → Almacena stab_segments[] en subtitleCache (cache en memoria)
  → Inicia setInterval(updateCurrentSubtitle, 100ms)

Cada 100ms:
  → Lee audio.currentTime
  → Busca en subtitleCache el segmento donde start <= t <= end
  → Actualiza currentSubtitle (o null si no hay match)

Vue renderiza: v-if="currentSubtitle && showSubtitles"
  → Muestra el .word del segmento activo
```

### Flujo al desactivar
```
Usuario pulsa "Desactivar Subtítols"
  → showSubtitles = false
  → currentSubtitle = null
  → subtitleCache = null
  → clearInterval()
```

### Cleanup automático
```js
onUnmounted(() => {
  clearInterval_()  // Evita memory leak si el componente se destruye con subtítulos activos
})
```

### Formato JSON de subtítulos
```json
{
  "stab_segments": [
    { "start": 0.0,  "end": 1.4,  "word": "Banyar" },
    { "start": 1.4,  "end": 4.2,  "word": "és sinònim de piler del foc," },
    { "start": 4.2,  "end": 6.0,  "word": "és l'humitat" }
  ]
}
```

Las rutas a los JSON se almacenan en los ficheros de traducción:
- `es.json` → `"subtitle1": "/assets/audio/Spanish/Scene1.json"`
- `va.json` → `"subtitle1": "/assets/audio/Valencia/Scene12025.json"`

---

## Sistema de traducciones (vue-i18n)

Los ficheros `src/lang/es.json` y `src/lang/va.json` contienen **dos tipos de claves**:

### 1. Textos de la interfaz
```json
{
  "introduction": "Introducció",
  "playAudio": "Reproduir audioguia",
  "pauseAudio": "Pausar audioguia",
  "audioLoading": "Carregant...",
  "audioError": "Error al carregar l'àudio",
  "enableSubtitle": "Activar Subtítols",
  "disableSubtitle": "Desactivar Subtítols",
  "nextScene": "Escena següent",
  "previousScene": "Escena anterior",
  "scene1": "Banyà",
  "scene2": "La nympha del aigua"
}
```

### 2. Rutas de assets multimedia
```json
{
  "audioIntroduction": "/assets/audio/Valencia/SceneIntroduction.mp3",
  "audio1": "/assets/audio/Valencia/Scene12025.mp3",
  "subtitle1": "/assets/audio/Valencia/Scene12025.json",
  "subtitleIntroduction": "/assets/audio/Valencia/SceneIntroduction.json"
}
```

> **Patrón clave:** Cambiar el idioma no solo cambia los textos — también cambia las **rutas de los ficheros de audio y subtítulos**. El mismo componente `<audio :src="$t('audio1')">` apunta a ficheros diferentes según el locale.

---

## Gestión del carrusel de escenas

### Índice de escenas

En el carrusel, los slides se renderizan con `v-for="(_, index) in 5"` (índices 0–4). El mapeo a las claves de traducción y audio usa la fórmula:

```js
// Convierte el índice del slide al número de escena (1-5, con loop circular)
const sceneKey = ((5 + index) % 5) + 1
// index=0 → sceneKey=1, index=4 → sceneKey=5
```

### Cambio de escena
```js
// Evento @slideChangeTransitionStart del Swiper
const handleSlideChange = (swiper) => {
  currentSlide.value = swiper.realIndex   // Para el contador "1/5"
  pauseAll()                               // Para el audio de la escena anterior
  resetSubtitles()                         // Oculta subtítulos
}
```

### Navegación externa
Los botones `‹` / `›` están **fuera del Swiper** para evitar solapamientos con el contenido:
```html
<div class="scene-nav bg-black">
  <button @click="navigatePrev">‹</button>
  <span class="scene-nav__counter">{{ currentSlide + 1 }} / 5</span>
  <button @click="navigateNext">›</button>
</div>
```
```js
const navigateNext = () => swiperInstance.value?.slideNext()
const navigatePrev = () => swiperInstance.value?.slidePrev()
```
