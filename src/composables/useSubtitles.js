import { ref, onUnmounted } from 'vue'

const subtitleCache = new Map()

function toSeconds(h, m, s, ms) {
  return +h * 3600 + +m * 60 + +s + +ms / 1000
}

function parseSRT(text) {
  return text.trim().split(/\n\n+/).flatMap(block => {
    const lines = block.trim().split('\n')
    if (lines.length < 3) return []
    const match = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/)
    if (!match) return []
    return [{
      start: toSeconds(match[1], match[2], match[3], match[4]),
      end:   toSeconds(match[5], match[6], match[7], match[8]),
      text:  lines.slice(2).join(' ')
    }]
  })
}

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
      const text = await res.text()
      segments = parseSRT(text)
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
