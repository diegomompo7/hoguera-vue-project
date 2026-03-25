<script setup>
import Spanish from "./lang/es.json";
import Valencia from "./lang/va.json";
import SkipLink from "./components/SkipLink.vue";
import Language from "./components/Language.vue";
import Header from "./components/Header.vue";
import Scenes from "./components/Scenes.vue";
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQueryParams } from '@/composables/useQueryParams';

const { locale } = useI18n();
const { lang } = useQueryParams();

let messages = ref({});

onMounted(() => {
  locale.value = lang ?? 'va';
});

const setLanguage = (lang) =>{
  locale.value = lang
}


watch(locale, (newLocale) => {
      switch (newLocale) {
        case 'es':
          locale.value = 'es';
          messages.value = Spanish;
          document.documentElement.lang = 'es'
          break;
        case 'va':
        locale.value = 'va';
          messages.value = Valencia;
          document.documentElement.lang = 'ca-valencia'
          break;
      }
      
    });

</script>

<template>
  <SkipLink />
  <main role="main">
  <div class="text-center pt-3">
    <Language :messages="messages" :setLanguage="setLanguage" id="languages"></Language>
  </div>
  <Header :messages="messages" :setLanguage="setLanguage"></Header>
  <Scenes :messages="messages" :language="locale" id="main-content"></Scenes>
</main>

</template>