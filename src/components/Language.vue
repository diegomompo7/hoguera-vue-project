<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

defineProps({
  messages: {
    type: Object,
    required: true, // Puedes ajustar esto según sea necesario
  },
  setLanguage: {
    type: Function,
    required: true, // Puedes ajustar esto según sea necesario
  },
});

const params = new URLSearchParams(window.location.search);
let initParam = params.get("init");
const initScene = ref(-1)

initParam !== null ? initScene.value = Number(initParam) - 1
 : initScene.value = -1
</script>

<template>
  <div class="text-center mb-3_5" aria-label="Language selection" role="navigation" v-if="initScene === -1">
    <h1 class="visually-hidden" role="heading">{{ messages.language }}</h1>
    <img src="../assets/img/valencia.svg" :alt="messages.pageValencia" class="w-5 me-2_25" @click="setLanguage('va')"
      @keypress.enter="setLanguage('va')" @keydown.space="setLanguage('va')" tabindex="0" role="button"
      :aria-label="messages.pageValencia" :aria-pressed="locale === 'va' ? 'true' : 'false'" />
    <img src="../assets/img/spain.svg" :alt="messages.pageSpanish" class="w-5 me-2_25" @click="setLanguage('es')"
      @keypress.enter="setLanguage('es')" @keydown.space="setLanguage('es')" tabindex="0" role="button"
      :aria-label="messages.pageSpanish" :aria-pressed="locale === 'es' ? 'true' : 'false'" />
  </div>
</template>
