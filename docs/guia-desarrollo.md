# Guia de desarrollo - Hoguera Sant Blai de Dalt

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior
- Git

---

## Instalacion y arranque

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd hoguera-vue-project-main

# Instalar dependencias
npm install

# Arrancar servidor de desarrollo (http://localhost:5173)
npm run dev

# Construir para produccion
npm run build

# Previsualizar la build de produccion localmente
npm run preview
```

---

## Como anadir una nueva escena

Para anadir una sexta escena al carrusel se requieren cambios en cuatro lugares:

### 1. Archivos de audio y subtitulos

Crear los archivos en las carpetas correspondientes:

```
src/assets/audio/Spanish/
  Scene6.mp3
  Scene6.json

src/assets/audio/Valencia/
  Scene62025.mp3
  Scene6.json
```

El JSON de subtitulos debe seguir el formato:

```json
{
  "result": "Transcripcion completa del audio",
  "stab_segments": [
    { "start": 0.0, "end": 2.5, "word": "Texto del primer segmento" },
    { "start": 2.6, "end": 5.0, "word": "Texto del segundo segmento" }
  ]
}
```

### 2. Archivos de idioma

Anadir las nuevas claves en `src/lang/es.json` y `src/lang/va.json`:

```json
{
  "scene6": "Nombre de la escena 6",
  "audio6": "/assets/audio/Spanish/Scene6.mp3",
  "subtitle6": "/assets/audio/Spanish/Scene6.json"
}
```

```json
{
  "scene6": "Nom de l'escena 6",
  "audio6": "/assets/audio/Valencia/Scene62025.mp3",
  "subtitle6": "/assets/audio/Valencia/Scene6.json"
}
```

### 3. Scenes.vue - Ampliar los arrays

Actualizar el tamaño de `audioRefs` e `isPlayed` para que incluyan el indice 6:

```js
// Antes
const audioRefs = ref(new Array(7).fill())
const isPlayed = ref([false, false, false, false, false, false, false])

// Despues
const audioRefs = ref(new Array(8).fill())
const isPlayed = ref([false, false, false, false, false, false, false, false])
```

### 4. Scenes.vue - Ampliar el carrusel

Cambiar el `v-for` del carrusel de 5 a 6 slides y ajustar la formula de normalizacion de indice:

```html
<!-- Antes -->
<swiper-slide v-for="(slide, index) in 5" ...>

<!-- Despues -->
<swiper-slide v-for="(slide, index) in 6" ...>
```

Y actualizar la formula de normalizacion de `5` a `6` en todas sus apariciones dentro del slide:

```js
// Antes
((5 + index) % 5) + 1

// Despues
((6 + index) % 6) + 1
```

Ademas, actualizar la condicion del `v-if` del carrusel:

```html
<!-- Antes -->
<swiper v-if="initScene < 5 && initScene != -1" ...>

<!-- Despues -->
<swiper v-if="initScene < 6 && initScene != -1" ...>
```

---

## Como anadir un nuevo idioma

### 1. Crear el archivo de diccionario

Crear `src/lang/xx.json` (donde `xx` es el codigo de idioma, ej. `en` para ingles) copiando la estructura de `es.json` y traduciendo todos los valores.

Claves obligatorias:

| Clave | Descripcion |
|---|---|
| `introduction` | Texto del titulo de la introduccion |
| `audioGuide` | Texto del boton de audioguia |
| `enableSubtitle` | Texto del boton para activar subtitulos |
| `disableSubtitle` | Texto del boton para desactivar subtitulos |
| `signLanguageButton` | Texto del boton de lenguaje de signos |
| `signLanguage` | Titulo de la seccion de lenguaje de signos |
| `nextScene` | Aria-label del boton siguiente |
| `previousScene` | Aria-label del boton anterior |
| `scene1` a `scene5` | Nombres de las escenas |
| `audio1` a `audio5` | Rutas de los archivos MP3 |
| `audioIntroduction` | Ruta del MP3 de introduccion |
| `subtitle1` a `subtitle5` | Rutas de los JSON de subtitulos |
| `pageSpanish` | Aria-label de la bandera española |
| `pageValencia` | Aria-label de la bandera valenciana |
| `language` | Texto del encabezado del selector de idioma |
| `header` | Texto del heading oculto de la cabecera |

### 2. Crear los archivos de audio

Anadir los archivos MP3 y sus JSON de subtitulos en una nueva subcarpeta:

```
src/assets/audio/English/
  SceneIntroduction.mp3
  SceneIntroduction.json
  Scene1.mp3
  Scene1.json
  ... etc.
```

### 3. Registrar el idioma en main.js

```js
// Antes
import Spanish from "./lang/es.json"
import Valencia from "./lang/va.json"

const messages = {
  'es': Spanish,
  'ca-valencia': Valencia
}

// Despues
import Spanish from "./lang/es.json"
import Valencia from "./lang/va.json"
import English from "./lang/en.json"

const messages = {
  'es': Spanish,
  'ca-valencia': Valencia,
  'en': English
}
```

### 4. Anadir el case en App.vue

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
    // Anadir:
    case 'en':
      messages.value = English
      document.documentElement.lang = 'en'
      break
  }
})
```

### 5. Anadir el boton en Language.vue

```html
<img src="../assets/img/uk.svg"
  @click="setLanguage('en')"
  @keypress.enter="setLanguage('en')"
  @keydown.space="setLanguage('en')"
  role="button" tabindex="0"
  :aria-label="messages.pageEnglish"
  :aria-pressed="locale === 'en' ? 'true' : 'false'" />
```

Nota: el archivo `uk.svg` ya existe en `src/assets/img/`.

---

## Como actualizar los subtitulos de una escena

Los archivos JSON de subtitulos se generan normalmente mediante un servicio de transcripcion automatica. Si necesitas editarlos manualmente:

1. Abre el archivo correspondiente en `src/assets/audio/Spanish/SceneX.json` o `Valencia/`
2. Localiza el array `stab_segments`
3. Cada entrada tiene `start` (segundos), `end` (segundos) y `word` (texto a mostrar)
4. Asegurate de que los rangos no se solapan y cubren todo el audio

```json
{
  "stab_segments": [
    { "start": 0.0,  "end": 2.5,  "word": "Primer fragmento" },
    { "start": 2.6,  "end": 5.0,  "word": "Segundo fragmento" },
    { "start": 5.1,  "end": 8.3,  "word": "Tercer fragmento" }
  ]
}
```

---

## Despliegue

El despliegue es automatico via GitHub Actions al hacer `push` a la rama `main`.

### Flujo del pipeline

1. Se conecta via SSH al servidor Bitnami
2. Ejecuta `npm install` y `git pull origin main`
3. Limpia el directorio web de Nginx (`/opt/bitnami/nginx/html/`)
4. Ejecuta `npm run build`
5. Mueve los archivos generados a Nginx

### Configurar los secretos de GitHub

En la configuracion del repositorio (Settings > Secrets and variables > Actions) deben existir:

| Secret | Descripcion |
|---|---|
| `HOST` | IP o dominio del servidor |
| `USERNAME` | Usuario SSH del servidor |
| `SSH_PRIVATE_KEY` | Contenido completo de la clave privada SSH |
| `PORT` | Puerto SSH (normalmente `22`) |

### Despliegue manual (sin CI/CD)

```bash
npm run build
# Copiar contenido de dist/ al webroot de Nginx
```

---

## Issues conocidos del codigo

Estos son problemas existentes en el codigo base que deben tenerse en cuenta:

### 1. Variable English no definida en App.vue (linea 39)

El `switch` en `App.vue` tiene un `case 'en'` que referencia `English`, pero esa variable no esta importada. Si en algun momento `locale` toma el valor `'en'`, se producira un error en tiempo de ejecucion.

**Archivo:** `src/App.vue:39`

```js
case 'en':
  messages.value = English  // English no esta importado
```

### 2. subtitle5 faltante en es.json

El archivo `src/lang/va.json` define `subtitle5` pero `src/lang/es.json` no. Si un usuario en español activa los subtitulos de la escena 5, el fetch fallara silenciosamente.

**Archivo:** `src/lang/es.json`

### 3. toggleSubtitles sin parametro en la introduccion

En la pantalla de introduccion, el boton de subtitulos llama a `toggleSubtitles()` sin argumentos:

```html
<button @click="toggleSubtitles" ...>
```

Esto hace que `subtitleNumber` sea `undefined`, y por tanto `sceneNumber` quede como `NaN`, lo que impide que `updateSubtitles()` encuentre el elemento de audio correcto.

**Archivo:** `src/components/Scenes.vue:207`

### 4. videoSignLanguage no definida

El boton de acceso al video de lenguaje de signos usa `aria-label="videoSignLanguage"` pero esa variable no esta definida en el componente. El aria-label quedara vacio.

**Archivo:** `src/components/Scenes.vue:223`

### 5. Console.logs en produccion

Hay multiples llamadas a `console.log()` en `Scenes.vue` que fueron usadas para depuracion y no se han eliminado. Deben removerse antes de cualquier release de produccion.

**Archivos:** `src/components/Scenes.vue`, `src/App.vue`

### 6. locale no disponible en Language.vue

El componente `Language.vue` usa `locale` en el binding de `aria-pressed` pero no importa `useI18n()` ni recibe `locale` como prop. El valor de `aria-pressed` no se actualizara correctamente.

**Archivo:** `src/components/Language.vue:28-31`
