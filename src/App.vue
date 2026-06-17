<script setup>
import Spanish from './lang/es.json'
import Valencia from './lang/va.json'
import SkipLink from './components/SkipLink.vue'
import Language from './components/Language.vue'
import Header from './components/Header.vue'
import Scenes from './components/Scenes.vue'
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQueryParams } from '@/composables/useQueryParams'

const { locale } = useI18n()
const { lang } = useQueryParams()

const messages = ref({})

onMounted(() => {
  locale.value = lang ?? 'va'
})

const setLanguage = (newLang) => {
  locale.value = newLang
}

watch(locale, (newLocale) => {
  switch (newLocale) {
    case 'es':
      messages.value = Spanish
      document.documentElement.lang = 'es'
      break
    case 'va':
    default:
      messages.value = Valencia
      document.documentElement.lang = 'ca-valencia'
      break
  }
}, { immediate: true })
</script>

<template>
  <SkipLink />
  <main role="main">
    <h1 class="visually-hidden">{{ messages.scenes }}</h1>
    <div class="text-center pt-1">
      <Language :messages="messages" :setLanguage="setLanguage" id="languages" />
    </div>
    <Header :messages="messages" :setLanguage="setLanguage" />
    <Scenes :messages="messages" :language="locale" id="main-content" />
  </main>
</template>
