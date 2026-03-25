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