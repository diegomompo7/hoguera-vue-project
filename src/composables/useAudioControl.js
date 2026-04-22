import { ref, watch } from 'vue'

export function useAudioControl(getLanguage) {
  const SLOTS = 7  // 0 = intro, 1–5 = scenes, 6 = reserved

  const audioRefs = ref(new Array(SLOTS).fill(null))
  const isPlayed  = ref(new Array(SLOTS).fill(false))
  const isLoading = ref(new Array(SLOTS).fill(false))
  const isError   = ref(new Array(SLOTS).fill(false))

  const pauseAll = () => {
    audioRefs.value.forEach((el, i) => {
      if (el && !el.paused) {
        el.pause()
        isPlayed.value[i] = false
      }
    })
  }

  const controlAudio = (index) => {
    const el = audioRefs.value[index]
    if (!el) return
    if (isPlayed.value[index]) {
      el.pause()
      isPlayed.value[index] = false
    } else {
      pauseAll()
      el.play().catch(() => {
        isError.value[index]  = true
        isPlayed.value[index] = false
      })
      isPlayed.value[index] = true
    }
  }

  const handleAudioEnded = (index) => {
    isPlayed.value[index] = false
  }

  const handleLoadStart = (index) => {
    isLoading.value[index] = true
    isError.value[index]   = false
  }

  const handleCanPlay = (index) => {
    isLoading.value[index] = false
  }

  const handleAudioError = (index) => {
    isLoading.value[index] = false
    isError.value[index]   = true
    isPlayed.value[index]  = false
  }

  // Reload all audio when language changes (new src paths)
  watch(getLanguage, () => {
    audioRefs.value.forEach((el, i) => {
      if (el) {
        el.pause()
        el.currentTime = 0
        el.load()
        isPlayed.value[i]  = false
        isLoading.value[i] = false
        isError.value[i]   = false
      }
    })
  })

  return {
    audioRefs,
    isPlayed, isLoading, isError,
    controlAudio, pauseAll,
    handleAudioEnded, handleLoadStart, handleCanPlay, handleAudioError,
  }
}
