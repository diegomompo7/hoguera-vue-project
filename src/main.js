import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createI18n } from 'vue-i18n'
import Spanish from './lang/es.json'
import Valencia from './lang/va.json'

const i18n = createI18n({
  legacy: false,
  locale: document.documentElement.lang || 'ca-valencia',
  fallbackLocale: 'ca-valencia',
  messages: {
    'es': Spanish,
    'ca-valencia': Valencia,
  },
})

const app = createApp(App)
app.use(i18n)
app.mount('#app')
