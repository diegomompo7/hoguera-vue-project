import { ref, onUnmounted } from 'vue'

// Module-level cache: url → stab_segments[]
const subtitleCache = new Map()

export function useSubtitles(audioRefs, getMessages) {
  const showSubtitles   = ref(false)
  const currentSubtitle = ref(null)

  let pollTimer   = null
  let segments    = []
  let activeIndex = null  // subtitle track index (-1 = intro, 0–4 = scenes)

  const stopPolling = () => {
    if (pollTimer !== null) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  const startPolling = () => {
    stopPolling()
    pollTimer = setInterval(() => {
      // Map subtitle index to audioRefs index: -1 → 0, 0 → 1, 1 → 2 …
      const refIdx = activeIndex === -1 ? 0 : activeIndex + 1
      const el = audioRefs.value[refIdx]
      if (!el || !segments.length) { currentSubtitle.value = null; return }
      const t = el.currentTime
      const seg = segments.find(s => t >= s.start && t < s.end) ?? null
      currentSubtitle.value = seg
    }, 100)
  }

  const getSubtitleUrl = (index) => {
    const msgs = getMessages()
    if (index === -1) return msgs.subtitleIntroduction
    return msgs[`subtitle${index + 1}`]
  }

  const loadSegments = async (index) => {
    const url = getSubtitleUrl(index)
    if (!url) { segments = []; return }
    if (subtitleCache.has(url)) { segments = subtitleCache.get(url); return }
    try {
      const res  = await fetch(url)
      const data = await res.json()
      segments = data.stab_segments ?? []
      subtitleCache.set(url, segments)
    } catch {
      segments = []
    }
  }

  const toggleSubtitles = async (index) => {
    if (showSubtitles.value && activeIndex === index) {
      // Same track — turn off
      showSubtitles.value   = false
      currentSubtitle.value = null
      stopPolling()
      activeIndex = null
    } else {
      // New track or first activation
      activeIndex = index
      await loadSegments(index)
      showSubtitles.value = true
      startPolling()
    }
  }

  const resetSubtitles = () => {
    showSubtitles.value   = false
    currentSubtitle.value = null
    stopPolling()
    activeIndex = null
    segments    = []
  }

  onUnmounted(stopPolling)

  return { showSubtitles, currentSubtitle, toggleSubtitles, resetSubtitles }
}
