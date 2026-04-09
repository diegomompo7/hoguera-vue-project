<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQueryParams } from "@/composables/useQueryParams";
import { useAudioControl } from "@/composables/useAudioControl";
import { useSubtitles } from "@/composables/useSubtitles";

const props = defineProps({
  messages: {
    type: Object,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
});


const { t } = useI18n();
const { initScene } = useQueryParams();

const {
  audioRefs, isPlayed, isLoading, isError,
  controlAudio, pauseAll, handleAudioEnded: audioEnded,
  handleLoadStart, handleCanPlay, handleAudioError,
} = useAudioControl(() => props.language);

const { showSubtitles, currentSubtitle, toggleSubtitles, resetSubtitles } =
  useSubtitles(audioRefs, () => props.messages);

const swiperInstance = ref(null);
const currentSlide = ref(0);
const onSwiper = (swiper) => {
  swiperInstance.value = swiper;
};

const getSlideKey = (index) => `${((5 + index) % 5) + 1}`;
const getSceneMessage = (index) => t(`scene${((5 + index) % 5) + 1}`);

const handleSlideChange = () => {
  if (swiperInstance.value) {
    currentSlide.value = swiperInstance.value.realIndex;
  }
  pauseAll();
  resetSubtitles();
};

const onAudioEnded = (index) => {
  audioEnded(index);
  resetSubtitles();
};

const navigateNext = () => {
  swiperInstance.value?.slideNext();
};

const navigatePrev = () => {
  swiperInstance.value?.slidePrev();
};

const gotoScene = (scene) => {
  initScene.value = scene;
};

// Helpers reactivos para texto y aria-label de los botones de audio
const audioLabel = (key) => {
  if (isError.value[key]) return props.messages.audioError;
  if (isLoading.value[key]) return props.messages.audioLoading;
  return isPlayed.value[key] ? props.messages.pauseAudio : props.messages.playAudio;
};

const audioText = (key, playText) => {
  if (isError.value[key]) return props.messages.audioError;
  if (isLoading.value[key]) return props.messages.audioLoading;
  return isPlayed.value[key] ? props.messages.pauseAudio : playText;
};
</script>

<template>
  <div role="region" :aria-label="messages.scenes">

    <!-- ── Pantalla de introducción ─────────────────────── -->
    <swiper
      v-if="initScene === -1"
      class="bg-black mt-4_6 text-yellow swiper-container"
      :aria-label="messages.introduction">
      <swiper-slide class="scene-card">
        <h1 class="scene-card__title" role="heading" aria-level="1">
          {{ messages.introduction }}
        </h1>

        <audio
          id="audioPlayerIntroduction"
          :ref="(el) => { audioRefs[initScene + 1] = el; }"
          @ended="onAudioEnded(initScene + 1)"
          @loadstart="handleLoadStart(initScene + 1)"
          @canplay="handleCanPlay(initScene + 1)"
          @error="handleAudioError(initScene + 1)">
          <source :src="$t('audioIntroduction')" type="audio/mpeg" />
        </audio>

        <!-- Layout mobile-first: columna en móvil, fila en sm+ -->
        <div class="intro-controls">
          <!-- Controles de audio + subtítulos -->
          <div class="audio-controls" role="group" :aria-label="messages.audioControls">
            <button
              class="btn-audio"
              :class="{ 'is-loading': isLoading[initScene + 1], 'is-error': isError[initScene + 1] }"
              @click="controlAudio(initScene + 1)"
              aria-controls="audioPlayerIntroduction"
              :aria-label="audioLabel(initScene + 1)"
              :disabled="isError[initScene + 1]">
              {{ audioText(initScene + 1, messages.audioGuide) }}
            </button>

            <button
              class="btn-audio btn-audio--secondary"
              @click="toggleSubtitles(-1)"
              :aria-label="showSubtitles ? messages.disableSubtitle : messages.enableSubtitle">
              {{ showSubtitles ? messages.disableSubtitle : messages.enableSubtitle }}
            </button>
          </div>

          <!-- Separador visual solo en sm+ -->
          <div class="intro-controls__sep" aria-hidden="true"></div>

          <!-- Botón lengua de signos -->
          <div class="audio-controls">
            <button
              class="btn-audio"
              @click="gotoScene(6)"
              :aria-label="messages.videoSignLanguage">
              {{ messages.signLanguageButton }}
            </button>
          </div>
        </div>
      </swiper-slide>

      <Transition name="subtitle-fade">
        <p
          v-if="currentSubtitle && showSubtitles"
          role="status"
          aria-live="polite"
          class="subtitles">
          {{ currentSubtitle.word }}
        </p>
      </Transition>
    </swiper>

    <!-- ── Video lengua de signos ────────────────────────── -->
    <swiper
      v-if="initScene === 6"
      class="bg-black mt-4_6 text-yellow"
      role="contentinfo"
      :aria-label="messages.signLanguage">
      <swiper-slide class="scene-card">
        <h1 class="scene-card__title">{{ messages.signLanguage }}</h1>
        <video
          src="../assets/video/signLanguageIntroduction.mp4"
          class="w-5_12 m-auto pb-2_5"
          controls autoplay playsinline
          :aria-label="messages.videoSignLanguage">
          <track kind="captions" src="/assets/captions/signLanguageIntroduction.vtt" srclang="es" label="Español" default />
        </video>
      </swiper-slide>
    </swiper>

    <!-- ── Carrusel de escenas ───────────────────────────── -->
    <template v-if="initScene < 5 && initScene != -1">
    <swiper
      class="bg-black mt-4_6 text-yellow swiper-container"
      :loop="true"
      :speed="400"
      effect="fade"
      :modules="[EffectFade]"
      :initial-slide="initScene != null ? initScene : 0"
      @swiper="onSwiper"
      @slideChangeTransitionStart="handleSlideChange"
      role="region"
      :aria-label="`${messages.swiperScenes} (${currentSlide + 1} / 5)`">

      <swiper-slide
        class="scene-card"
        v-for="(_, index) in 5"
        :key="getSlideKey(index)">

        <h1 class="scene-card__title" role="heading" aria-level="1">
          {{ getSceneMessage(index) }}
        </h1>

        <audio
          :id="`audioPlayer${((5 + index) % 5) + 1}`"
          :ref="(el) => { audioRefs[((5 + index) % 5) + 1] = el; }"
          @ended="onAudioEnded(((5 + index) % 5) + 1)"
          @loadstart="handleLoadStart(((5 + index) % 5) + 1)"
          @canplay="handleCanPlay(((5 + index) % 5) + 1)"
          @error="handleAudioError(((5 + index) % 5) + 1)">
          <source :src="$t(`audio${((5 + index) % 5) + 1}`)" type="audio/mpeg" />
        </audio>

        <div class="audio-controls" role="group" :aria-label="messages.audioControls">
          <button
            class="btn-audio"
            :class="{ 'is-loading': isLoading[((5 + index) % 5) + 1], 'is-error': isError[((5 + index) % 5) + 1] }"
            @click="controlAudio(((5 + index) % 5) + 1)"
            :aria-controls="`audioPlayer${((5 + index) % 5) + 1}`"
            :aria-label="audioLabel(((5 + index) % 5) + 1)"
            :disabled="isError[((5 + index) % 5) + 1]">
            {{ audioText(((5 + index) % 5) + 1, messages.playAudio) }}
          </button>

          <button
            class="btn-audio btn-audio--secondary"
            @click="toggleSubtitles((5 + index) % 5)"
            :aria-label="showSubtitles ? messages.disableSubtitle : messages.enableSubtitle">
            {{ showSubtitles ? messages.disableSubtitle : messages.enableSubtitle }}
          </button>
        </div>
      </swiper-slide>

      <Transition name="subtitle-fade">
        <p
          v-if="currentSubtitle && showSubtitles"
          role="status"
          aria-live="polite"
          class="subtitles fs-text_base text-center">
          {{ currentSubtitle.word }}
        </p>
      </Transition>
    </swiper>

    <!-- Navegación fuera del swiper: sin posibilidad de solapamiento -->
    <div class="scene-nav bg-black" role="group" :aria-label="messages.swiperScenes">
      <button
        class="scene-nav__btn"
        @click="navigatePrev"
        :aria-label="messages.previousScene">
        ‹
      </button>
      <span class="scene-nav__counter" aria-live="polite" aria-atomic="true">
        {{ currentSlide + 1 }} / 5
      </span>
      <button
        class="scene-nav__btn"
        @click="navigateNext"
        :aria-label="messages.nextScene">
        ›
      </button>
    </div>
    </template>
  </div>
</template>

<style scoped>
.scene-card {
  padding-bottom: 0;
}

/* ── Subtítulos: badge/pill bajo los controles de audio */
.subtitles {
  display: block;
  width: fit-content;
  max-width: 85%;
  margin: 0.75rem auto 0;
  padding: 0.5rem 1.25rem;
  text-align: center;
  background: rgba(255, 215, 0, 0.08);
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 2rem;
  font-size: var(--text-sm, 0.875rem);
  line-height: 1.5;
}

/* ── Navegación externa: fila bajo el swiper ─────────────── */
.scene-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 0.625rem 0 calc(0.75rem + env(safe-area-inset-bottom, 0px));
}

.scene-nav__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: transparent;
  color: var(--color-accent, #FFD700);
  border: 1px solid rgba(255, 215, 0, 0.6);
  border-radius: 50%;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;
}

.scene-nav__btn:hover {
  background: rgba(255, 215, 0, 0.12);
  border-color: var(--color-accent, #FFD700);
}

.scene-nav__btn:active {
  transform: scale(0.88);
  transition: transform 100ms ease;
}

.scene-nav__btn:focus-visible {
  outline: 3px solid var(--color-accent, #FFD700);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .scene-nav__btn:active {
    transform: none;
  }
}

.scene-nav__counter {
  color: rgba(255, 215, 0, 0.85);
  font-size: var(--text-base, 1rem);
  font-family: var(--font-body, system-ui);
  min-width: 2.5rem;
  text-align: center;
}

/* ── Intro: layout mobile-first ─────────────────────────────
   Columna centrada en móvil → fila en pantallas sm (≥576px)  */
/* Solo en slides del carrusel, donde audio-controls es hijo directo de scene-card */
.scene-card > .audio-controls {
  margin-top: var(--space-2xl, 3rem);
}

.intro-controls {
  margin-top: var(--space-lg, 1.5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* Botones más compactos en la intro para que quepan los subtítulos */
.intro-controls .btn-audio,
.intro-controls .btn-audio--secondary {
  min-height: 44px;
  font-size: 0.9rem;
  padding: 0.5rem 1.25rem;
}

.intro-controls__sep {
  display: none;
}

@media (min-width: 576px) {
  .intro-controls {
    flex-direction: row;
    justify-content: space-evenly;
    align-items: flex-start;
  }

  .intro-controls__sep {
    display: block;
    width: 1px;
    height: 80px;
    background: rgba(255, 215, 0, 0.25);
    align-self: center;
  }
}

/* ── Subtitle fade transition ────────────────────────────── */
.subtitle-fade-enter-active,
.subtitle-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.subtitle-fade-enter-from,
.subtitle-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
@media (prefers-reduced-motion: reduce) {
  .subtitle-fade-enter-active,
  .subtitle-fade-leave-active {
    transition: none;
  }
}
</style>
