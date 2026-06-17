<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <nav class="skip-links" :aria-label="t('skipLinks')">
    <a
      href="#languages"
      class="skip-link"
      tabindex="0">
      {{ t('skipLanguages') }}
    </a>
    <a
      href="#main-content"
      class="skip-link"
      tabindex="0">
      {{ t('skipContent') }}
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
