<!-- components/SkipLinks.vue -->

<script>
const removeAriaHidden = (event) => {
  event.target.setAttribute("aria-hidden", "false");
};

const addAriaHidden = (event) => {
  event.target.setAttribute("aria-hidden", "true");
};
</script>

<template>
  <nav class="skip-links" aria-label="Enlaces de salto">
    <a href="#languages" class="skip-link" aria-label="Saltar al menú de idiomas" tabindex="-1" aria-hidden="true"
      @focus="removeAriaHidden($event)" @blur="addAriaHidden($event)">Saltar al menú</a>
    <a href="#main-content" class="skip-link" aria-label="Saltar al contenido principal" tabindex="-1"
      aria-hidden="true" @focus="removeAriaHidden($event)" @blur="addAriaHidden($event)">Saltar al contenido</a>
  </nav>
</template>

<style scoped>
.skip-link {
  position: absolute;
  left: -999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
  z-index: 100;
}

.skip-link:focus {
  left: 0;
  top: 0;
  width: auto;
  height: auto;
  padding: 1rem;
  background: #000;
  color: #fff;
  text-decoration: none;
}
</style>
