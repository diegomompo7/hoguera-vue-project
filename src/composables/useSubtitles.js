import { ref, onUnmounted } from 'vue'

export function useSubtitles(audioRefs, getMessages) {
  const showSubtitles = ref(false)
  const currentSubtitle = ref(null)
  const sceneNumber = ref(0)

  // Cache: loaded once per subtitle toggle, queried in memory every tick
  let subtitleCache = null
  let intervalId = null

  const clearInterval_ = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  const resetSubtitles = () => {
    showSubtitles.value = false
    currentSubtitle.value = null
    subtitleCache = null
    clearInterval_()
  }

  const updateCurrentSubtitle = () => {
    if (!subtitleCache) return
    const audio = audioRefs.value[sceneNumber.value]
    if (!audio) return
    const t = audio.currentTime
    currentSubtitle.value =
      subtitleCache.find((sub) => t >= sub.start && t <= sub.end) ?? null
  }

  const toggleSubtitles = async (subtitleNumber) => {
    showSubtitles.value = !showSubtitles.value
    sceneNumber.value = subtitleNumber + 1

    if (showSubtitles.value) {
      const messages = getMessages()
      const audio = audioRefs.value[sceneNumber.value]
      if (audio) {
        const key = audio.id.replace('audioPlayer', '')
        const url = messages[`subtitle${key}`]
        subtitleCache = null
        if (url) {
          try {
            const response = await fetch(url)
            if (response.ok) {
              const data = await response.json()
              subtitleCache = data.stab_segments ?? []
            }
          } catch (e) {
            console.error('Error loading subtitles:', e)
          }
        }
        intervalId = setInterval(updateCurrentSubtitle, 100)
      }
    } else {
      currentSubtitle.value = null
      subtitleCache = null
      clearInterval_()
    }
  }

  // 2.5 — Cleanup garantizado al destruir el componente (evita memory leak)
  onUnmounted(() => {
    clearInterval_()
  })

  return { showSubtitles, currentSubtitle, sceneNumber, toggleSubtitles, resetSubtitles }
}
