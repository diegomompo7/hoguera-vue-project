<script setup>
import English from "./lang/en.json";
import Spanish from "./lang/es.json";
import Valencia from "./lang/va.json";
import Language from "./components/Language.vue";
import Header from "./components/Header.vue";
import Scenes from "./components/Scenes.vue";
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

let messages = ref({});

const params = new URLSearchParams(window.location.search);
const lang = params.get('lang');

onMounted(() => {
      if (lang != null) {
        locale.value = lang;
      } else {
        locale.value = 'va';
      }
});

const setLanguage = (lang) =>{
  locale.value = lang
}

watch(locale, (newLocale) => {
      switch (newLocale) {
        case 'es':
          messages.value = Spanish;
          document.documentElement.lang = 'es'
          break;
        case 'en':
          messages.value = English;
          document.documentElement.lang = 'en'
          break;
        case 'va':
          messages.value = Valencia;
          document.documentElement.lang = 'ca-valencia'
          break;
      }
      
    });

</script>

<template>
  <div class="">
  <div class="text-center pt-3">
    <Language :messages="messages" :setLanguage="setLanguage"></Language>
  </div>
  <Header :messages="messages" :setLanguage="setLanguage"></Header>
  <Scenes :messages="messages" :language="locale"></Scenes>
  </div>

</template>