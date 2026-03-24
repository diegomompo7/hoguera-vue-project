# Funcionalidad de la aplicacion - Hoguera Sant Blai de Dalt

## Proposito

La aplicacion es una guia multimedia interactiva de la festividad "Foguera Sant Blai de Dalt" de Alicante. Permite al visitante escuchar una audioguia narrada de la instalacion o monumento, dividida en una introduccion y 5 escenas tematicas, con subtitulos sincronizados en tiempo real y acceso a un video en lengua de signos para personas sordas o con discapacidad auditiva.

La aplicacion no requiere registro ni interaccion del servidor; todos los recursos son estaticos.

---

## Flujo de usuario

### 1. Seleccion de idioma

Al entrar a la aplicacion sin parametros de URL, el usuario ve el selector de idioma con dos banderas:

- Bandera valenciana → idioma valenciano (`va`)
- Bandera española → idioma español (`es`)

El selector solo aparece en la pantalla de introduccion. Una vez dentro de una escena, ya no es accesible visualmente.

### 2. Pantalla de introduccion

Despues de seleccionar idioma (o si el idioma ya estaba en la URL), el usuario accede a la introduccion. Esta pantalla tiene:

- Un titulo con el nombre de la introduccion
- Un boton de audioguia (Play/Pause)
- Un boton para activar/desactivar subtitulos
- Un boton para acceder al video de lenguaje de signos

La introduccion narra el contexto general de la foguera y sirve como puerta de entrada al contenido.

### 3. Escenas 1-5

Las escenas se presentan en un carrusel deslizante (Swiper). Cada escena tiene:

- Un titulo tematico (diferente en español y valenciano)
- Un boton Play/Pause para la audioguia de esa escena
- Un boton para activar/desactivar subtitulos
- Flechas de navegacion para ir a la escena anterior o siguiente

Las escenas son:

| N | Español | Valenciano |
|---|---|---|
| 1 | Fuego | Banya |
| 2 | Tierra de luz y color | La nympha del aigua |
| 3 | Agua | Papallones a la panxa |
| 4 | Noche | Angels que banyen a alacant i a als alacantins |
| 5 | (Escena 5) | Una banya centenaria |

### 4. Video de lenguaje de signos

Desde la pantalla de introduccion, el usuario puede acceder a un video de la introduccion interpretada en lengua de signos. El video se reproduce con `autoplay` y tiene controles nativos del navegador.

---

## Sistema de audioguia

Cada escena tiene un archivo de audio MP3 asociado. Los archivos difieren segun el idioma activo:

- Idioma español → archivos en `src/assets/audio/Spanish/`
- Idioma valenciano → archivos en `src/assets/audio/Valencia/`

La reproduccion es controlada manualmente por el usuario mediante el boton Play/Pause. Solo puede estar activo un audio a la vez por escena; al cambiar de diapositiva en el carrusel, el audio activo se detiene automaticamente.

Al terminar el audio, el boton vuelve al estado "Play" y los subtitulos se desactivan.

---

## Sistema de subtitulos sincronizados

### Activacion

El usuario activa los subtitulos pulsando el boton correspondiente en cada escena. El texto del boton cambia dinamicamente segun el estado:

- Subtitulos desactivados → muestra `messages.enableSubtitle`
- Subtitulos activados → muestra `messages.disableSubtitle`

### Sincronizacion

Cuando los subtitulos estan activos, la aplicacion:

1. Inicia un intervalo de 100ms
2. En cada tick, lee el `currentTime` del elemento `<audio>` activo
3. Hace `fetch` al archivo JSON de subtitulos de esa escena
4. Busca en `stab_segments` el segmento cuyo rango `start`-`end` engloba el tiempo actual
5. Muestra el campo `word` de ese segmento en pantalla

### Formato del JSON de subtitulos

```json
{
  "stab_segments": [
    { "start": 0.7, "end": 3.0, "word": "(Musica)" },
    { "start": 3.1, "end": 5.5, "word": "Bienvenidos a la foguera" }
  ]
}
```

La ruta del JSON para cada escena viene definida en los archivos de idioma:

```json
// es.json
{
  "subtitle1": "/assets/audio/Spanish/Scene1.json",
  "subtitle2": "/assets/audio/Spanish/Scene2.json"
}
```

### Visualizacion

Los subtitulos se muestran en un parrafo con `role="status"` y `aria-live="polite"`, lo que permite a los lectores de pantalla anunciar el texto actualizado sin interrumpir la narracion en curso.

---

## Soporte multiidioma

### Idiomas disponibles

| Codigo | Idioma | Archivo de diccionario |
|---|---|---|
| `va` | Valenciano | `src/lang/va.json` |
| `es` | Español | `src/lang/es.json` |

### Como afecta el idioma al contenido

El cambio de idioma afecta a:

- Todos los textos de la interfaz (botones, titulos, etiquetas ARIA)
- Las rutas de los archivos de audio (archivos distintos por idioma)
- Las rutas de los archivos de subtitulos
- Los titulos de las escenas
- El atributo `lang` del elemento `<html>` del documento

Al cambiar de idioma mientras hay audio en reproduccion, este se detiene, se reinicia y se recarga con la nueva ruta de audio.

### Seleccion de idioma por URL

Se puede forzar el idioma mediante el parametro `?lang`:

```
https://dominio.com/?lang=es    → Carga en español
https://dominio.com/?lang=va    → Carga en valenciano
```

---

## Parametros de URL

La aplicacion acepta dos parametros de URL para configurar el estado inicial:

### ?lang

Establece el idioma al cargar la pagina.

```
?lang=es   → Español
?lang=va   → Valenciano
```

Si no se especifica, el valor por defecto es `va` (valenciano).

### ?init

Permite saltar directamente a una escena concreta sin pasar por la introduccion.

| Valor | Resultado |
|---|---|
| Sin parametro | Pantalla de introduccion |
| `?init=1` | Escena 1 del carrusel |
| `?init=2` | Escena 2 del carrusel |
| `?init=3` | Escena 3 del carrusel |
| `?init=4` | Escena 4 del carrusel |
| `?init=5` | Escena 5 del carrusel |
| `?init=6` | Video de lenguaje de signos |

Cuando se especifica `?init`, el selector de idiomas no se muestra (el idioma debe venir del parametro `?lang` o del atributo `lang` del HTML).

Ejemplo de URL completa:
```
https://dominio.com/?lang=es&init=3
```
Cargaria directamente en la escena 3 en español.

---

## Accesibilidad

La aplicacion esta disenada con un fuerte enfoque en accesibilidad:

### Skip links

Dos enlaces de salto ocultos visualmente que aparecen al tabular:
- "Saltar al menu" → lleva al selector de idiomas (`#languages`)
- "Saltar al contenido" → lleva al carrusel de escenas (`#main-content`)

### Soporte de teclado

Todos los elementos interactivos (botones Play/Pause, botones de subtitulos, flechas del carrusel, selector de idiomas) responden a:
- Click de raton
- Tecla Enter
- Tecla Espacio

### Roles ARIA

| Elemento | Role |
|---|---|
| Selector de idiomas | `navigation` |
| Botones de bandera | `button` |
| Titulo oculto | `heading` |
| Contenedor de escenas | `contentinfo` |
| Texto de subtitulos | `status` con `aria-live="polite"` |
| Botones de navegacion Swiper | `button` |

### Focus visible

Todos los elementos focusables muestran un borde amarillo dorado `outline: 3px solid #FFD700` al recibir el foco, garantizando visibilidad para usuarios que navegan con teclado.

### Servicio de accesibilidad externo

La aplicacion carga el script de ACS Barrier-Free (`acsbapp.com`) que proporciona una barra de herramientas de accesibilidad adicional en la interfaz.

### Lenguaje de signos

Hay disponible un video de la introduccion interpretada en lengua de signos, accesible desde el boton en la pantalla de introduccion.

### Idioma del documento

El atributo `lang` del elemento `<html>` se actualiza dinamicamente al cambiar el idioma, permitiendo a los lectores de pantalla usar la pronunciacion correcta.
