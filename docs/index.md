# Foguera Sant Blai de Dalt — Documentación

## ¿Qué es este proyecto?

Guía multimedia interactiva para la **Foguera Sant Blai de Dalt** de Alacant (Festes de Sant Joan). Diseñada para uso **móvil en el evento presencial**: los visitantes pueden escanear un QR, escuchar la audioguía de cada escena con subtítulos sincronizados y acceder a una introducción en lengua de signos.

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Vue 3 | 3.4.37 | Framework UI (Composition API + `<script setup>`) |
| Vite | 5.4.2 | Build tool y dev server |
| Swiper | 11.1.10 | Carrusel táctil con efecto fade |
| vue-i18n | 9.14.0 | Internacionalización (español + valenciano) |
| Bootstrap | 5.3.3 | Utilidades CSS (grid, helpers) |
| Sass | 1.99.0 | Preprocesador CSS con tokens de diseño |

---

## Quickstart

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (hot reload)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Compilar SCSS manualmente (si editas custom.scss)
npx sass src/scss/custom.scss src/scss/custom.css --style=compressed --no-source-map
```

---

## Parámetros de URL

| Parámetro | Valores | Descripción |
|---|---|---|
| `?lang=` | `es` / `va` | Fuerza idioma (español / valenciano) |
| `?init=` | `1`–`5` | Abre directamente una escena del carrusel |

**Ejemplos:**
- `?lang=es` → abre en español
- `?lang=va&init=3` → abre en valenciano directamente en la escena 3

---

## Documentación disponible

| Fichero | Contenido |
|---|---|
| [architecture.md](./architecture.md) | Estructura de carpetas, diagrama de componentes, flujo de bootstrap, configuración Vite |
| [functionality.md](./functionality.md) | Modos de pantalla, flujos de usuario, features de audio y subtítulos |
| [business-logic.md](./business-logic.md) | Composables, i18n, gestión de estado, formato de datos |
| [visual-system.md](./visual-system.md) | Tokens de diseño, sistema de botones, SCSS, tipografía |
