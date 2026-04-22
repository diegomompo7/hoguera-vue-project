import { ref } from 'vue'

// Singleton — parsed once at module import time.
// All components share the SAME reactive ref.
const params    = new URLSearchParams(window.location.search)
const _lang     = params.get('lang')
const initParam = params.get('init')
const _initScene = ref(initParam !== null ? Number(initParam) - 1 : -1)

export function useQueryParams() {
  return { lang: _lang, initScene: _initScene }
}
