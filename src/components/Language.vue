<script setup>
import { useI18n } from "vue-i18n";
import { useQueryParams } from "@/composables/useQueryParams";

const { locale } = useI18n();
const { initScene } = useQueryParams();

defineProps({
  messages: {
    type: Object,
    required: true,
  },
  setLanguage: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <nav class="text-center mb-3_5" aria-label="Language selection" v-if="initScene === -1">
    <h1 class="visually-hidden">{{ messages.language }}</h1>
    <button type="button" class="language-btn" @click="setLanguage('va')"
      :aria-label="messages.pageValencia" :aria-pressed="locale === 'va' ? 'true' : 'false'">
      <img src="../assets/img/valencia.svg" alt="" class="w-5 me-2_25" />
    </button>
    <button type="button" class="language-btn" @click="setLanguage('es')"
      :aria-label="messages.pageSpanish" :aria-pressed="locale === 'es' ? 'true' : 'false'">
      <img src="../assets/img/spain.svg" alt="" class="w-5 me-2_25" />
    </button>
  </nav>
</template>

<style scoped>
.language-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
</style>