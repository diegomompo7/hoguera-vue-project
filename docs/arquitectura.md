# Arquitectura del proyecto - Hoguera Sant Blai de Dalt

## Descripcion general

Aplicacion web de pagina unica (SPA) desarrollada con Vue 3 que actua como guia multimedia interactiva de la festividad "Foguera Sant Blai de Dalt" de Alicante. Permite al usuario explorar 5 escenas tematicas con audioguia sincronizada con subtitulos, en dos idiomas (español y valenciano), y con soporte de lenguaje de signos.

No tiene backend ni servidor de APIs: todos los recursos (audio, video, subtitulos) son archivos estaticos servidos directamente.

---

## Stack tecnologico

| Tecnologia | Version | Rol |
|---|---|---|
| Vue 3 | ^3.4.37 | Framework principal (Composition API) |
| Vite | ^5.3.4 | Bundler y servidor de desarrollo |
| vue-i18n | ^9.14.0 | Internacionalizacion (ES / VA) |
| Bootstrap | ^5.3.3 | Framework CSS base |
| Swiper | ^11.1.10 | Carrusel de escenas |
| @vueuse/core | ^11.0.3 | Composables reutilizables de Vue |
| vtt.js | ^0.13.0 | Parsing de subtitulos VTT |

---

## Estructura de directorios

```
hoguera-vue-project-main/
├── .github/
│   └── workflows/
│       └── main.yml          # Pipeline CI/CD (deploy via SSH a Nginx)
├── public/
│   └── assets/               # Assets procesados por Vite en produccion
├── src/
│   ├── assets/
│   │   ├── audio/
│   │   │   ├── Spanish/      # Audios e5 MP3 + JSON de subtitulos (español)
│   │   │   └── Valencia/     # Audios MP3 + JSON de subtitulos (valenciano)
│   │   ├── img/              # Imagenes: logos, banderas
│   │   └── video/
│   │       └── signLanguageIntroduction.mp4
│   ├── components/
│   │   ├── Header.vue        # Cabecera con logo y patrocinador
│   │   ├── Language.vue      # Selector de idioma
│   │   ├── Scenes.vue        # Componente principal (carrusel + audio)
│   │   └── SkipLink.vue      # Enlaces de salto para accesibilidad
│   ├── lang/
│   │   ├── es.json           # Diccionario español
│   │   └── va.json           # Diccionario valenciano
│   ├── scss/
│   │   ├── custom.scss       # Estilos personalizados + Bootstrap
│   │   └── utilities/        # Clases utilitarias SCSS (colores, fuentes, medidas)
│   ├── App.vue               # Componente raiz
│   ├── main.js               # Punto de entrada, registro de plugins
│   └── style.css             # Estilos base del body
├── index.html                # HTML raiz
├── package.json
└── vite.config.js
```

---

## Arbol de componentes y flujo de datos

```
index.html
    └── main.js (inicializa Vue + vue-i18n)
            └── App.vue  [locale, messages]
                    ├── SkipLink.vue
                    │     (sin props - solo accesibilidad)
                    │
                    ├── Language.vue
                    │     props: messages, setLanguage
                    │     emite cambio de idioma a App via setLanguage()
                    │
                    ├── Header.vue
                    │     props: messages, setLanguage
                    │
                    └── Scenes.vue
                          props: messages, language
                          (gestiona todo el estado multimedia)
```

El estado de idioma vive en `App.vue` y se distribuye hacia abajo mediante props. No se usa ningun gestor de estado global (sin Pinia ni Vuex).

---

## Sistema de internacionalizacion (i18n)

### Inicializacion

En `main.js`, se crea la instancia de vue-i18n con los dos diccionarios de idioma:

```js
// src/main.js
const messages = {
  'es': Spanish,        // src/lang/es.json
  'ca-valencia': Valencia  // src/lang/va.json
}
const locale = document.documentElement.lang || 'ca-valencia'

app.use(createI18n({ legacy: false, locale, messages }))
```

El idioma inicial se lee del atributo `lang` del elemento `<html>` (definido en `index.html` como `ca-valencia`).

### Cambio de idioma en tiempo de ejecucion

`App.vue` expone la funcion `setLanguage(lang)` que actualiza `locale.value`. Un `watch` sobre `locale` detecta el cambio, actualiza el objeto `messages` reactivo pasado como prop y modifica `document.documentElement.lang`.

Los hijos reciben `messages` como prop y simplemente leen `messages.claveTraduccion` para mostrar texto en el idioma activo.

### Rutas de audio por idioma

Cada archivo de idioma define rutas de audio distintas:

- `es.json` → apunta a `src/assets/audio/Spanish/Scene1.mp3`, etc.
- `va.json` → apunta a `src/assets/audio/Valencia/Scene12025.mp3`, etc.

Cuando el idioma cambia, `Scenes.vue` detecta el cambio via un `watch` sobre `props.language` y recarga los elementos `<audio>` con `audio.load()`.

---

## Navegacion sin router

El proyecto no usa Vue Router. La navegacion entre vistas se controla con:

1. **Parametros de URL** leidos en `onMounted`:
   - `?lang=es` o `?lang=va` → establece el idioma inicial
   - `?init=1` a `?init=5` → salta directamente a una escena del carrusel
   - `?init=6` → muestra directamente el video de lenguaje de signos

2. **Estado interno `initScene`** en `Scenes.vue`:
   - `-1` → pantalla de introduccion (por defecto)
   - `0` a `4` → carrusel de 5 escenas
   - `6` → video de lenguaje de signos

La funcion `gotoScene(scene)` permite navegar programaticamente entre modos cambiando `initScene.value`.

---

## Sistema de estilos

### Bootstrap

Se usa Bootstrap 5.3.3 para layout y utilidades base. Se carga via CDN en `index.html` y tambien se importa en `custom.scss` para poder sobreescribir variables.

### SCSS personalizado

`src/scss/custom.scss` importa Bootstrap completo y añade:

- **Sombras personalizadas** en la variable `$customShadow`:
  - `.shadow-shadowYellow1`: resplandor amarillo difuso
  - `.shadow-shadowYellow2`: resplandor amarillo intenso (botones de navegacion)

- **Focus global** con borde dorado para accesibilidad:
  ```scss
  :focus {
    outline: 3px solid #FFD700;
    outline-offset: 2px;
  }
  ```

### Utilidades SCSS propias (`src/scss/utilities/`)

| Archivo | Clases generadas |
|---|---|
| `_colors.scss` | `.text-yellow` |
| `_fontSize.scss` | `.fs-text_xs` a `.fs-text_9xl` |
| `_heights.scss` | `.h-0_5`, `.h-1_2`, `.h-2_3`, etc. |
| `_widths.scss` | `.w-1_3`, `.w-5_12`, `.w-1_1`, etc. |
| `_marginPadding.scss` | `.mt-*`, `.mb-*`, `.px-*`, etc. con escala en rem |

Estas utilidades complementan las de Bootstrap y usan notacion de fracciones (ej. `w-5_12` = 41.67%) para medidas porcentuales y nombres numericos para medidas en rem.

---

## Pipeline de despliegue (CI/CD)

Archivo: `.github/workflows/main.yml`

**Disparador:** `push` a la rama `main`

**Secuencia:**

```
1. GitHub Actions hace checkout del repositorio
2. Se conecta via SSH al servidor (Bitnami/Nginx)
3. En el servidor remoto:
   a. cd hoguera-vue-project/
   b. npm install
   c. git pull origin main
   d. rm -rf /opt/bitnami/nginx/html/*   (limpia el webroot)
   e. npm run build                        (genera carpeta dist/)
   f. mv dist/* /opt/bitnami/nginx/html/  (publica en Nginx)
```

**Secretos de GitHub requeridos:**

| Secret | Descripcion |
|---|---|
| `HOST` | IP o dominio del servidor |
| `USERNAME` | Usuario SSH |
| `SSH_PRIVATE_KEY` | Clave privada SSH |
| `PORT` | Puerto SSH (normalmente 22) |

---

## Estructura de assets multimedia

### Audio

Cada escena tiene dos archivos asociados:

```
src/assets/audio/
├── Spanish/
│   ├── SceneIntroduction.mp3   # Audio de introduccion en español
│   ├── SceneIntroduction.json  # Subtitulos de introduccion (español)
│   ├── Scene1.mp3
│   ├── Scene1.json
│   └── ... (Scene2-5)
└── Valencia/
    ├── SceneIntroduction.mp3
    ├── SceneIntroduction.json
    ├── Scene12025.mp3           # Archivos actualizados 2025
    ├── Scene1.json
    └── ... (Scene2-5)
```

### Formato del JSON de subtitulos

```json
{
  "result": "Texto completo del audio",
  "stab_segments": [
    {
      "start": 0.7,
      "end": 3.0,
      "word": "(Musica)",
      "probability": 0.532,
      "segmentNo": 0
    }
  ]
}
```

El campo `stab_segments` es el que consume `Scenes.vue` para sincronizar subtitulos con el tiempo de reproduccion del audio.

### Video

```
src/assets/video/
└── signLanguageIntroduction.mp4   # Video de introduccion en lengua de signos
```
