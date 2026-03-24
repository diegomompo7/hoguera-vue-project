# Documentacion de componentes

## Indice

1. [main.js - Punto de entrada](#mainjs)
2. [App.vue - Componente raiz](#appvue)
3. [SkipLink.vue - Accesibilidad](#skiplinkvue)
4. [Language.vue - Selector de idioma](#languagevue)
5. [Header.vue - Cabecera](#headervue)
6. [Scenes.vue - Carrusel principal](#scenesvue)

---

## main.js

**Ruta:** `src/main.js`

Punto de entrada de la aplicacion. Responsabilidades:

- Crea la instancia de Vue con `createApp(App)`
- Registra el plugin `vue-i18n` con los dos diccionarios de idioma
- Lee el atributo `lang` del elemento `<html>` para determinar el idioma inicial (cae en `ca-valencia` si no esta definido)
- Monta la aplicacion en el elemento `<div id="app">` del `index.html`

```js
const messages = {
  'es': Spanish,
  'ca-valencia': Valencia
}
const locale = document.documentElement.lang || 'ca-valencia'

app.use(createI18n({ legacy: false, locale, messages }))
app.mount('#app')
```

---

## App.vue

**Ruta:** `src/App.vue`

Componente raiz. Gestiona el estado de idioma y lo distribuye a todos los hijos.

### Estado reactivo

| Variable | Tipo | Descripcion |
|---|---|---|
| `locale` | `Ref<string>` (vue-i18n) | Idioma activo (`'es'` o `'va'`) |
| `messages` | `Ref<Object>` | Objeto de traducciones activo |

### Lectura de parametros de URL

Al montarse, lee el parametro `?lang` de la URL. Si existe, lo aplica como idioma inicial; si no, usa `'va'` (valenciano) por defecto.

```js
const params = new URLSearchParams(window.location.search)
const lang = params.get('lang')

onMounted(() => {
  locale.value = lang ?? 'va'
})
```

### Funcion setLanguage

```js
const setLanguage = (lang) => {
  locale.value = lang
}
```

Se pasa como prop a `Language.vue` y `Header.vue` para que los hijos puedan cambiar el idioma.

### Watch sobre locale

Cuando `locale` cambia, el watcher actualiza `messages` con el diccionario correspondiente y cambia el atributo `lang` del documento HTML:

```js
watch(locale, (newLocale) => {
  switch (newLocale) {
    case 'es':
      messages.value = Spanish
      document.documentElement.lang = 'es'
      break
    case 'va':
      messages.value = Valencia
      document.documentElement.lang = 'ca-valencia'
      break
  }
})
```

### Template

```html
<SkipLinks />
<main role="main">
  <Language :messages="messages" :setLanguage="setLanguage" id="languages" />
  <Header :messages="messages" :setLanguage="setLanguage" />
  <Scenes :messages="messages" :language="locale" id="main-content" />
</main>
```

### Issues conocidos

- El case `'en'` referencia la variable `English` que no esta importada, lo que causaria un error en tiempo de ejecucion si se activara ese idioma.
- Hay un `console.log(locale)` que no deberia estar en produccion.

---

## SkipLink.vue

**Ruta:** `src/components/SkipLink.vue`

Componente de accesibilidad que proporciona dos enlaces de salto para usuarios de teclado y lectores de pantalla.

### Comportamiento

Los enlaces estan ocultos visualmente con posicion `left: -999px` y dimension de 1px. Al recibir el foco (tab), se muestran en la esquina superior izquierda con fondo negro y texto blanco.

| Enlace | Destino | Descripcion |
|---|---|---|
| "Saltar al menu" | `#languages` | Salta al selector de idiomas |
| "Saltar al contenido" | `#main-content` | Salta al carrusel de escenas |

### Gestion de aria-hidden

```js
const removeAriaHidden = (event) => {
  event.target.setAttribute("aria-hidden", "false")  // Al recibir foco
}
const addAriaHidden = (event) => {
  event.target.setAttribute("aria-hidden", "true")   // Al perder foco
}
```

Los enlaces tienen `tabindex="-1"` por defecto; son accesibles mediante Tab del teclado gracias a que los navegadores incluyen elementos con `href` en el orden de tabulacion independientemente del tabindex cuando estan visibles.

### Estilos clave

```css
.skip-link {
  position: absolute;
  left: -999px;      /* oculto fuera de pantalla */
  width: 1px;
  height: 1px;
}

.skip-link:focus {
  left: 0;
  top: 0;
  width: auto;
  height: auto;
  padding: 1rem;
  background: #000;
  color: #fff;
}
```

---

## Language.vue

**Ruta:** `src/components/Language.vue`

Selector de idioma que muestra los botones de bandera para cambiar entre español y valenciano.

### Props

| Prop | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `messages` | `Object` | Si | Objeto de traducciones activo |
| `setLanguage` | `Function` | Si | Callback para cambiar el idioma en App.vue |

### Visibilidad condicional

El componente solo se muestra cuando el usuario esta en la pantalla de introduccion (`initScene === -1`). Esto lo detecta leyendo el parametro `?init` de la URL de la misma manera que `Scenes.vue`:

```js
const params = new URLSearchParams(window.location.search)
let initParam = params.get("init")
const initScene = ref(-1)

initParam !== null
  ? initScene.value = Number(initParam) - 1
  : initScene.value = -1
```

Si se navega directamente a una escena con `?init=2`, el selector de idioma queda oculto.

### Template

```html
<div v-if="initScene === -1" role="navigation" aria-label="Language selection">
  <h1 class="visually-hidden" role="heading">{{ messages.language }}</h1>

  <!-- Boton valenciano -->
  <img src="../assets/img/valencia.svg"
    @click="setLanguage('va')"
    @keypress.enter="setLanguage('va')"
    @keydown.space="setLanguage('va')"
    role="button" tabindex="0"
    :aria-label="messages.pageValencia"
    :aria-pressed="locale === 'va' ? 'true' : 'false'" />

  <!-- Boton español -->
  <img src="../assets/img/spain.svg"
    @click="setLanguage('es')"
    @keypress.enter="setLanguage('es')"
    @keydown.space="setLanguage('es')"
    role="button" tabindex="0"
    :aria-label="messages.pageSpanish"
    :aria-pressed="locale === 'es' ? 'true' : 'false'" />
</div>
```

### Accesibilidad

- `role="navigation"` identifica la zona de seleccion de idioma
- `role="button"` en las imagenes las hace anunciables como botones
- `aria-pressed` indica cual es el idioma actualmente activo
- Soporte completo de teclado con Enter y Espacio

### Issues conocidos

- `aria-pressed` referencia `locale` pero este no esta en el scope del componente (no se importa `useI18n()`). En la practica el atributo podria no actualizarse correctamente.

---

## Header.vue

**Ruta:** `src/components/Header.vue`

Cabecera estatica con el logo de la foguera y la imagen del patrocinador.

### Props

| Prop | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `messages` | `Object` | Si | Objeto de traducciones (para el texto del heading oculto) |
| `setLanguage` | `Function` | Si | Se recibe pero no se usa internamente en la version actual |

### Contenido

- Un `<h1>` visualmente oculto con el texto `messages.header` para lectores de pantalla
- El logo de la foguera (`logo.png`) centrado
- La imagen del patrocinador (`anis_tenis.png`) al 100% de ancho

### Roles ARIA

Usa `role="heading"` para el titulo y `role="none"` en elementos contenedores para que no sean anunciados innecesariamente por los lectores de pantalla.

---

## Scenes.vue

**Ruta:** `src/components/Scenes.vue`

Componente principal de la aplicacion. Gestiona el carrusel de escenas, la reproduccion de audio, los subtitulos sincronizados y el video de lenguaje de signos.

### Props

| Prop | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `messages` | `Object` | Si | Objeto de traducciones con rutas de audio, subtitulos y textos de UI |
| `language` | `String` | Si | Idioma activo; cuando cambia, se recargan los audios |

### Estado reactivo

| Variable | Tipo | Valor inicial | Descripcion |
|---|---|---|---|
| `initScene` | `Ref<number>` | `-1` | Modo de vista actual |
| `isPlayed` | `Ref<boolean[]>` | `[false x7]` | Estado de reproduccion por indice de audio |
| `audioRefs` | `Ref<HTMLAudioElement[]>` | `Array(7)` | Referencias a los 7 elementos `<audio>` del DOM |
| `sceneNumber` | `Ref<number>` | `0` | Numero de escena activa (para subtitulos) |
| `currentSubtitle` | `Ref<object\|null>` | `null` | Segmento de subtitulo actualmente visible |
| `showSubtitles` | `Ref<boolean>` | `false` | Si los subtitulos estan activados |
| `intervalId` | `let` | `null` | ID del `setInterval` de actualizacion de subtitulos |

### Modos de vista (initScene)

El template usa tres bloques `v-if` mutuamente excluyentes:

| Valor de initScene | Vista |
|---|---|
| `-1` | Pantalla de introduccion con audio y acceso a lenguaje de signos |
| `6` | Video de lenguaje de signos |
| `0` a `4` | Carrusel Swiper con 5 escenas |

La funcion `gotoScene(scene)` permite transicionar entre modos:
```js
const gotoScene = (scene) => {
  initScene.value = scene
}
```

### Lectura del parametro ?init

Al inicializarse, Scenes.vue lee el parametro `?init` de la URL y calcula el `initScene` inicial:

```js
let initParam = params.get("init")
initParam !== null
  ? initScene.value = Number(initParam) - 1
  : initScene.value = -1
```

El parametro `?init=1` corresponde a `initScene=0` (primera escena del carrusel). `?init=6` corresponde a `initScene=6` (lenguaje de signos).

### Funcion controlAudio(index)

Alterna entre reproduccion y pausa del audio con indice `index`:

```js
const controlAudio = (index) => {
  isPlayed.value[index] = !isPlayed.value[index]
  audio = audioRefs.value[index]

  if (audio) {
    if (isPlayed.value[index]) {
      audio.play()
    } else {
      audio.pause()
    }
  }
}
```

Los indices de audio van del 0 al 6. El audio de la introduccion usa el indice `initScene + 1` (que es 0, por lo que el indice es 0). Las escenas 1-5 usan indices 1-5.

### Funcion toggleSubtitles(subtitleNumber)

Activa o desactiva los subtitulos. Cuando `showSubtitles` pasa a `true`, el watcher correspondiente inicia el intervalo de actualizacion.

```js
const toggleSubtitles = (subtitleNumber) => {
  showSubtitles.value = !showSubtitles.value
  sceneNumber.value = subtitleNumber + 1
}
```

El parametro `subtitleNumber` es el indice del slide de Swiper (0-4); se le suma 1 para obtener el numero de escena real (1-5).

### Funcion updateSubtitles()

Se ejecuta cada 100ms via `setInterval` cuando los subtitulos estan activos:

```js
const updateSubtitles = async () => {
  if (showSubtitles.value) {
    const audio = audioRefs.value[sceneNumber.value]
    if (audio) {
      const foundWord = audio.id.replace("audioPlayer", "")  // ej. "1", "Introduction"
      const response = await fetch(props.messages[`subtitle${foundWord}`])
      const data = await response.json()
      const currentTime = audio.currentTime

      currentSubtitle.value = data.stab_segments.find(
        (sub) => currentTime >= sub.start && currentTime <= sub.end
      )
    }
  }
}
```

Obtiene la ruta del JSON de subtitulos de `messages.subtitle{N}`, la carga, y busca el segmento cuyo rango `start`-`end` contiene el `currentTime` del audio.

### Watch sobre props.language

Cuando el idioma cambia, todos los audios se pausan, se reinicia su posicion a 0 y se recargan (lo que hace que el elemento `<source>` cargue la nueva ruta de audio):

```js
watch(() => props.language, () => {
  audioRefs.value.forEach((audioRef, index) => {
    if (audioRef) {
      audioRef.pause()
      audioRef.currentTime = 0
      audioRef.load()
      isPlayed.value = isPlayed.value.map((state, i) => i === index ? false : state)
    }
  })
})
```

### Watch sobre showSubtitles

Gestiona el ciclo de vida del intervalo de subtitulos:

```js
watch(showSubtitles, (newValue) => {
  if (newValue) {
    intervalId = setInterval(updateSubtitles, 100)
  } else {
    clearInterval(intervalId)
    currentSubtitle.value = null
  }
})
```

### Funcion handleSlideChange()

Se dispara en el evento `@slideChangeTransitionStart` del Swiper. Pausa todos los audios que esten en reproduccion y limpia los subtitulos:

```js
const handleSlideChange = () => {
  audioRefs.value.forEach((ref, index) => {
    if (ref && isPlayed.value[index]) {
      ref.pause()
      ref.currentTime = 0
      isPlayed.value[index] = false
      showSubtitles.value = false
    }
  })
  currentSubtitle.value = null
}
```

### Funcion handleAudioEnded(sceneNumber)

Callback del evento `@ended` del elemento `<audio>`. Marca el audio como detenido y limpia los subtitulos:

```js
const handleAudioEnded = (sceneNumber) => {
  isPlayed.value[sceneNumber] = false
  currentSubtitle.value = null
  showSubtitles.value = false
}
```

### Calculo de indice de escena en el carrusel

El carrusel Swiper tiene `:loop="true"`, lo que altera el orden interno de los slides. La formula `((5 + index) % 5) + 1` normaliza cualquier indice (incluyendo negativos por el loop) al rango 1-5:

```js
const getSlideKey = (index) => `${((5 + index) % 5) + 1}`
const getSceneMessage = (index) => t(`scene${((5 + index) % 5) + 1}`)
```

### Configuracion de Swiper

```js
const modules = [Navigation]
const navigation = {
  nextEl: ".swiper-button-next",
  prevEl: ".swiper-button-prev"
}
```

El Swiper del carrusel de escenas tiene:
- Modulo `Navigation` para flechas prev/next
- `:loop="true"` para navegacion circular
- `:initial-slide="initScene"` para saltar a la escena inicial por URL

### Accesibilidad en Scenes.vue

- Los subtitulos usan `role="status" aria-live="polite"` para que los lectores de pantalla anuncien cambios
- Los botones de audio tienen `aria-label` dinamico segun el estado de reproduccion
- Los botones prev/next del Swiper son `div` con `role="button"`, `tabindex="0"` y soporte de teclado via `@keydown.enter` y `@keydown.space`
- Los `<audio>` son elementos nativos del DOM, lo que garantiza compatibilidad con tecnologias de asistencia

### Issues conocidos

- La llamada a `toggleSubtitles()` en la pantalla de introduccion se hace sin parametro, lo que hace que `subtitleNumber` sea `undefined` y `sceneNumber` quede como `NaN`. Esto puede causar que los subtitulos no se carguen correctamente en la introduccion.
- La variable `videoSignLanguage` usada en `aria-label` del boton de lenguaje de signos no esta definida en el componente.
- Hay multiples `console.log()` de depuracion que no deberian estar en produccion.
