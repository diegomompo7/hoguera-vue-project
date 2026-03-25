import { ref, watch } from 'vue'

export function useAudioControl(getLanguage) {
  const audioRefs = ref(new Array(7).fill(null))
  const isPlayed = ref(new Array(7).fill(false))
  const isLoading = ref(new Array(7).fill(false))
  const isError = ref(new Array(7).fill(false))

  watch(getLanguage, () => {
    audioRefs.value.forEach((audioRef, index) => {
      if (audioRef) {
        audioRef.pause()
        audioRef.currentTime = 0
        audioRef.load()
        isPlayed.value[index] = false
        isLoading.value[index] = false
        isError.value[index] = false
      }
    })
  })

  const controlAudio = (index) => {
    isPlayed.value[index] = !isPlayed.value[index]
    const audio = audioRefs.value[index]
    if (audio) {
      if (isPlayed.value[index]) audio.play()
      else audio.pause()
    }
  }

  const pauseAll = () => {
    audioRefs.value.forEach((audio, index) => {
      if (audio && isPlayed.value[index]) {
        audio.pause()
        audio.currentTime = 0
        isPlayed.value[index] = false
      }
    })
  }

  const handleAudioEnded = (index) => {
    isPlayed.value[index] = false
  }

  const handleLoadStart = (index) => {
    isLoading.value[index] = true
    isError.value[index] = false
  }

  const handleCanPlay = (index) => {
    isLoading.value[index] = false
  }

  const handleAudioError = (index) => {
    isLoading.value[index] = false
    isError.value[index] = true
    isPlayed.value[index] = false
  }

  return {
    audioRefs, isPlayed, isLoading, isError,
    controlAudio, pauseAll, handleAudioEnded,
    handleLoadStart, handleCanPlay, handleAudioError,
  }
}
