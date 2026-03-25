import { ref } from 'vue'

export function useQueryParams() {
  const params = new URLSearchParams(window.location.search)

  const lang = params.get('lang')

  const initParam = params.get('init')
  const initScene = ref(initParam !== null ? Number(initParam) - 1 : -1)

  return { lang, initScene }
}
