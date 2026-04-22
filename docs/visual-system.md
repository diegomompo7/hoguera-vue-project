# Sistema Visual

## Filosofía de diseño

- **Mobile-first:** diseñado para pantallas de 375px+, event presencial
- **Paleta oscura con acento dorado:** negro `#000` + dorado `#FFD700` + fondo cyan
- **Tipografía dual:** Inter (cuerpo) + Playfair Display (títulos de escena)
- **Touch targets:** mínimo 44px, ideal 48px en todos los elementos interactivos
- **Accesibilidad:** `prefers-reduced-motion`, `:focus-visible`, contraste WCAG

---

## Design Tokens (`src/scss/tokens/_tokens.scss`)

Todos los valores se definen como CSS Custom Properties en `:root`.

### Colores

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#000000` | Fondo de tarjetas y botones |
| `--color-surface` | `#111111` | Superficies elevadas |
| `--color-accent` | `#FFD700` | Dorado — color de marca principal |
| `--color-accent-dim` | `rgba(255,215,0, 0.6)` | Dorado atenuado |
| `--color-accent-glow` | `rgba(255,215,0, 0.30)` | Base de las sombras glow |
| `--color-text` | `#FFD700` | Texto principal |
| `--color-text-muted` | `rgba(255,215,0, 0.55)` | Texto secundario |
| `--color-body-bg` | `#00BFFF` | Referencia del fondo cyan |
| `--color-error` | `#FF6B6B` | Estado de error |
| `--color-error-glow` | `rgba(255,107,107, 0.30)` | Glow de error |

### Tipografía

| Token | Valor | Resultado |
|---|---|---|
| `--font-body` | `'Inter', system-ui` | Cuerpo, botones, navegación |
| `--font-display` | `'Playfair Display', Georgia` | Títulos de escena |
| `--text-xs` | `clamp(0.75rem, 1.8vw, 0.875rem)` | 12–14px |
| `--text-sm` | `clamp(0.875rem, 2.2vw, 1rem)` | 14–16px |
| `--text-base` | `clamp(1rem, 2.5vw, 1.125rem)` | 16–18px |
| `--text-lg` | `clamp(1.125rem, 3vw, 1.25rem)` | 18–20px |
| `--text-xl` | `clamp(1.25rem, 3.5vw, 1.5rem)` | 20–24px |
| `--text-2xl` | `clamp(1.5rem, 4vw, 2rem)` | 24–32px |
| `--text-3xl` | `clamp(1.875rem, 5vw, 2.5rem)` | 30–40px |

### Espaciado

| Token | Valor | px |
|---|---|---|
| `--space-xs` | `0.25rem` | 4px |
| `--space-sm` | `0.5rem` | 8px |
| `--space-md` | `1rem` | 16px |
| `--space-lg` | `1.5rem` | 24px |
| `--space-xl` | `2rem` | 32px |
| `--space-2xl` | `3rem` | 48px |
| `--space-3xl` | `4rem` | 64px |

### Efectos glow (sombras)

```scss
--glow-sm:    0 0 0.4em 0.25em var(--color-accent-glow)   // Botón en reposo
--glow-md:    0 0 0.7em 0.45em var(--color-accent-glow)   // Hover / focus
--glow-lg:    0 0 1em   0.65em var(--color-accent-glow)   // Loading pulse
--glow-error: 0 0 0.5em 0.3em  var(--color-error-glow)    // Estado error
```

### Transiciones

| Token | Valor | Uso |
|---|---|---|
| `--transition-fast` | `150ms ease` | Hover/active en botones |
| `--transition-base` | `250ms ease` | Transiciones generales |
| `--transition-slow` | `400ms ease` | Fade entre slides Swiper |

> Con `prefers-reduced-motion: reduce` todos se ponen a `0ms` y las animaciones CSS se fuerzan a `0.01ms`.

---

## Sistema de botones (`src/scss/components/_buttons.scss`)

### `.btn-audio` — Botón primario

```scss
.btn-audio {
  width: 100%;
  max-width: 280px;
  min-height: var(--touch-ideal, 48px);  // Touch target ideal
  padding: 0.75rem 1.5rem;
  font-size: var(--text-lg);             // 18–20px
  font-weight: 600;
  background: var(--color-bg, #000);
  color: var(--color-accent, #FFD700);
  border: 2px solid var(--color-accent, #FFD700);
  border-radius: var(--radius-full, 9999px);
  box-shadow: var(--glow-sm);
}
```

**Estados:**

| Estado | Visual |
|---|---|
| Reposo | Negro + borde dorado + glow sm |
| `:hover` | Fondo dorado + texto negro + glow md + sube 1px |
| `:active` | Scale 0.97, vuelve al glow sm |
| `:focus-visible` | Outline dorado 3px, offset 4px |
| `:disabled` | Opacidad 40%, cursor not-allowed |
| `.is-loading` | Pulse animation 1.4s (glow sm ↔ lg) + opacidad 75% |
| `.is-error` | Borde/texto rojo + glow-error, no interactivo |

### `.btn-audio--secondary` — Botón secundario (subtítulos)

```scss
.btn-audio--secondary {
  max-width: 240px;
  min-height: var(--touch-min, 44px);  // Touch target mínimo
  font-size: var(--text-sm);
  border-width: 1px;                   // Más discreto que el primario
  box-shadow: none;                    // Sin glow en reposo
  opacity: 0.82;
}
```

### `.audio-controls` — Contenedor de botones

```scss
.audio-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg, 1.5rem);  // 24px entre botones
  width: 100%;
}
```

---

## Scene Card (`src/scss/components/_scenes.scss`)

```scss
.scene-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2xl, 3rem);    // 48px entre título y controles
  padding: var(--space-xl, 2rem) var(--space-md, 1rem);
  text-align: center;
  width: 100%;
}

.scene-card__title {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 6vw, 2.5rem);  // 28–40px responsive
  font-weight: 700;
  color: var(--color-accent, #FFD700);
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin: 0;
}
```

**Animación de entrada (slide activo):**

```scss
.swiper-slide-active .scene-card__title {
  animation: titleFadeIn 0.35s ease forwards;
}

@keyframes titleFadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Override en `Scenes.vue` (scoped):**

```scss
.scene-card { padding-bottom: 0; }
// Evita que el carrusel tenga más altura de la necesaria.
// La intro usa padding-bottom a través de .intro-controls.
```

---

## Header (`src/scss/components/_header.scss`)

```scss
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  gap: 0.5rem;
}

.site-header__logo    { width: 90px; }   // Mobile
.site-header__sponsor { width: 45%; max-width: 200px; }

@media (min-width: 768px) {
  .site-header__logo    { width: 120px; }
  .site-header__sponsor { width: 50%; max-width: 300px; }
}
```

---

## Intro controls (scoped en `Scenes.vue`)

```scss
.intro-controls {
  margin-top: var(--space-lg, 1.5rem);
  padding-bottom: var(--space-xl, 2rem);  // Margen inferior bajo el último botón
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

// Mobile: botones compactos para caber en pantallas pequeñas
.intro-controls .btn-audio,
.intro-controls .btn-audio--secondary {
  min-height: 44px;
  font-size: 0.9rem;
  padding: 0.5rem 1.25rem;
}

// Separador vertical solo en sm+
.intro-controls__sep {
  display: none;  // Mobile: oculto
}

@media (min-width: 576px) {
  .intro-controls {
    flex-direction: row;       // Desktop: botones en fila
    justify-content: space-evenly;
  }
  .intro-controls__sep {
    display: block;
    width: 1px;
    height: 80px;
    background: rgba(255, 215, 0, 0.25);
  }
}
```

---

## Subtítulos pill (scoped en `Scenes.vue`)

```scss
.subtitles {
  display: block;
  width: fit-content;
  max-width: 85%;
  margin: 1.5rem auto 0;
  padding: 0.5rem 1.25rem;
  background: rgba(255, 215, 0, 0.08);
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 2rem;
  font-size: var(--text-sm, 0.875rem);
  line-height: 1.5;
}
```

**Transición Vue:**

```scss
.subtitle-fade-enter-active,
.subtitle-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.subtitle-fade-enter-from,
.subtitle-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
```

---

## Navegación externa (`scene-nav`, scoped en `Scenes.vue`)

```scss
.scene-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 0.625rem 0 calc(0.75rem + env(safe-area-inset-bottom, 0px));
  // ↑ safe area para iPhones con notch
}

.scene-nav__btn {
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 215, 0, 0.6);
  border-radius: 50%;
  font-size: 1.75rem;
  color: var(--color-accent, #FFD700);
}
```

---

## Utilidades CSS personalizadas

Las clases usan **guion bajo** en lugar de punto decimal (compatible con HTML):

| Clase | CSS generado | Valor |
|---|---|---|
| `.w-5_12` | `width: 41.666%` | 5/12 del contenedor |
| `.w-5_6` | `width: 83.333%` | 5/6 del contenedor |
| `.mt-4_6` | `margin-top: 2.5rem` | 40px |
| `.mt-2` | `margin-top: 0.5rem` | 8px |
| `.mb-3_5` | `margin-bottom: 1.25rem` | 20px |
| `.pb-2_5` | `padding-bottom: 0.75rem` | 12px |
| `.me-2_25` | `margin-right: 0.625rem` | 10px |
| `.pt-1` | `padding-top: 0.375rem` | 6px |
| `.fs-text_base` | `font-size: 1rem` | 16px |
| `.w-5` | `width: 3rem` | 48px (banderas de idioma) |

---

## Fondo y estilos base (`src/style.css`)

```css
body {
  background: linear-gradient(160deg, #00CFFF 0%, #00A8E0 60%, #0090C8 100%);
  background-attachment: fixed;      /* El gradiente no se mueve al hacer scroll */
  padding-bottom: env(safe-area-inset-bottom, 0px);  /* iOS notch */
  font-family: var(--font-body);
  color: var(--color-text);          /* Dorado por defecto */
  max-width: 1200px;
  margin: 0 auto;
}

#app {
  animation: appFadeIn 0.4s ease forwards;  /* Fade-in al cargar */
}

@keyframes appFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## Fuentes (Google Fonts)

Cargadas en `index.html` con `preconnect` para máxima velocidad:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700
            &family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
```

| Fuente | Pesos | Uso |
|---|---|---|
| Inter | 400, 600, 700 | Cuerpo, botones, navegación, subtítulos |
| Playfair Display | 700 | `.scene-card__title` (títulos de escena) |

---

## Focus ring global (`src/scss/custom.scss`)

```scss
/* Solo aparece al navegar con teclado — no al hacer clic */
:focus-visible {
  outline: 3px solid var(--color-accent, #FFD700);
  outline-offset: 3px;
  border-radius: var(--radius-sm, 0.375rem);
}

:focus:not(:focus-visible) {
  outline: none;
}
```
