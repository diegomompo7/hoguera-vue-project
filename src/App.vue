<script setup>
import English from "./lang/en.json";
import Spanish from "./lang/es.json";
import Valencia from "./lang/va.json";
import { ref, watch, onMounted } from 'vue';


let locale = ref(navigator.language);
let messages = ref();

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

    console.log(messages.pageValencia)
</script>

<template>
  <div class="text-center pt-3">
    <h1 class="visually-hidden">Idioma</h1>
    <img src="./assets/img/valencia.svg" alt="messages.pageValencia" class=" w-12 me-2" @click="setLanguage('va')"/>
    <img src="./assets/img/spain.svg" alt="Página en Castellano"  class=" w-12 me-2" @click="setLanguage('es')"/>
    <img src="./assets/img/uk.svg" alt="Página en Inglés"   class="w-12 me-2" @click="setLanguage('en')"/>
    <p>{{messages}}</p>
  </div>

</template>