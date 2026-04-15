<script setup>
import { useI18n } from 'vue-i18n'
import { useQueryParams } from '@/composables/useQueryParams'

const { locale } = useI18n()
const { initScene } = useQueryParams()

defineProps({
  messages:    { type: Object,   required: true },
  setLanguage: { type: Function, required: true },
})
</script>

<template>
  <nav
    v-if="initScene === -1"
    class="text-center mb-3_5"
    :aria-label="messages.language">
    <h2 class="visually-hidden">{{ messages.language }}</h2>

    <button
      type="button"
      class="language-btn"
      @click="setLanguage('va')"
      :aria-label="messages.pageValencia"
      :aria-pressed="locale === 'va' ? 'true' : 'false'">
      <img src="../assets/img/valencia.svg" alt="" class="w-5 me-2_25" />
    </button>

    <button
      type="button"
      class="language-btn"
      @click="setLanguage('es')"
      :aria-label="messages.pageSpanish"
      :aria-pressed="locale === 'es' ? 'true' : 'false'">
      <img src="../assets/img/spain.svg" alt="" class="w-5 me-2_25" />
    </button>
  </nav>
</template>

<style scoped>
.language-btn {
  background: none;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 4px;
  min-width: 44px;
  min-height: 44px;
  cursor: pointer;
  opacity: 0.55;
  transition: border-color 0.2s ease, opacity 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.language-btn:hover {
  opacity: 0.85;
}

.language-btn[aria-pressed="true"] {
  border-color: #FFD700;
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .language-btn { transition: none; }
}
</style>
