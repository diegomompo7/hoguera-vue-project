<template>
  <nav class="skip-links" aria-label="Enllaços de salt">
    <a
      href="#languages"
      class="skip-link"
      aria-label="Saltar al menú d'idiomes"
      tabindex="0">
      Saltar al menú
    </a>
    <a
      href="#main-content"
      class="skip-link"
      aria-label="Saltar al contingut principal"
      tabindex="0">
      Saltar al contingut
    </a>
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
  color: #FFD700;
  text-decoration: none;
  font-family: var(--font-body, system-ui);
}
</style>
