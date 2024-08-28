import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createI18n } from 'vue-i18n';
import English from "./lang/en.json";
import Spanish from "./lang/es.json";
import Valencia from "./lang/va.json";

const messages = {
    'en': English,
    'es': Spanish,
    'ca-valencia': Valencia
}

const locale = document.documentElement.lang || 'ca-valencia';

const app = createApp(App)
app.use(
    createI18n({
      legacy: false,
      locale: locale,
      defaultLocale: 'ca-valencia',
      messages: messages
    })
  )
app.mount('#app')
