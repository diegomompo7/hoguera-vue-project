<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQueryParams } from "@/composables/useQueryParams";
import { useAudioControl } from "@/composables/useAudioControl";
import { useSubtitles } from "@/composables/useSubtitles";

const isNextButtonVisible = ref(true);

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

const modules = [Navigation];
const navigation = {
  nextEl: ".swiper-button-next",
  prevEl: ".swiper-button-prev",
};

const { t } = useI18n();
const { initScene } = useQueryParams();

const {
  audioRefs, isPlayed, isLoading, isError,
  controlAudio, pauseAll, handleAudioEnded: audioEnded,
  handleLoadStart, handleCanPlay, handleAudioError,
} = useAudioControl(() => props.language);

const { showSubtitles, currentSubtitle, sceneNumber, toggleSubtitles, resetSubtitles } =
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
  document.querySelector(".swiper-button-next")?.click();
};

const navigatePrev = () => {
  document.querySelector(".swiper-button-prev")?.click();
};

const gotoScene = (scene) => {
  initScene.value = scene;
};

</script>

<template>
  <div class="" role="region" :aria-label="messages.scenes">
    <swiper v-if="initScene === -1" class="bg-black mt-4_6 text-yellow swiper-container"
      :aria-label="messages.introduction">
      <swiper-slide class="d-flex mt-4_2 flex-column text-center" :key="getSlideKey(index)">
        <h1 class="fw-bold" role="heading" aria-level="1">
          {{ messages.introduction }}
        </h1>
        <div class="d-flex justify-content-between mt-5 mb-3">
          <audio id="audioPlayerIntroduction" :ref="(el) => {
            (audioRefs[initScene + 1] = el), (sceneNumber = initScene + 1);
          }
            " @ended="onAudioEnded(initScene + 1)"
            @loadstart="handleLoadStart(initScene + 1)"
            @canplay="handleCanPlay(initScene + 1)"
            @error="handleAudioError(initScene + 1)">
            <source :src="$t(`audioIntroduction`)" type="audio/mpeg" />
          </audio>
          <div class="d-flex flex-column justify-content-center w-1_2" role="group">
            <button @click="controlAudio(initScene + 1)" @keydown.enter="controlAudio(initScene + 1)"
              @keydown.space="controlAudio(initScene + 1)"
              class="m-auto fs-text_xl py-2_5 w-9 border border-0 bg-black text-yellow shadow-shadowYellow1 rounded-5"
              aria-controls="audioPlayerIntroduction" role="button"
              :aria-label="isError[initScene + 1] ? messages.audioError : isLoading[initScene + 1] ? messages.audioLoading : isPlayed[initScene + 1] ? messages.pauseAudio : messages.playAudio"
              :disabled="isError[initScene + 1] || isLoading[initScene + 1]"
              tabindex="0">
              {{ isError[initScene + 1] ? messages.audioError : isLoading[initScene + 1] ? messages.audioLoading : isPlayed[initScene + 1] ? "Pause" : messages.audioGuide }}
            </button>

            <button @click="toggleSubtitles"
              class="mt-5 m-auto fs-text_base w-9 border border-0 bg-black text-yellow shadow-shadowYellow1 rounded-5"
              role="button" tabindex="0" :aria-label="!showSubtitles
                ? messages.enableSubtitle
                : messages.disableSubtitle
                " aria-labelledby="audioControlDesc">
              {{
                !showSubtitles
                  ? messages.enableSubtitle
                  : messages.disableSubtitle
              }}
            </button>
          </div>
          <div class="flex-grow-1 mt-5 ">
            <button @click="gotoScene(6)"
              class="m-auto fs-text_l py-2_5 w-9 border border-0 bg-black text-yellow shadow-shadowYellow1 rounded-5"
              role="button" :aria-label="messages.videoSignLanguage" tabindex="0">
              {{ messages.signLanguageButton }}
            </button>
          </div>
        </div>
      </swiper-slide>
      <p id="audioControlDesc" v-if="currentSubtitle && showSubtitles" role="status" aria-live="polite"
        class="subtitles fs-text_base text-center m-auto pt-4_4 w-5_6">
        {{ currentSubtitle.word }}
      </p>
    </swiper>
    <swiper v-if="initScene === 6" class="bg-black mt-4_6 text-yellow" role="contentinfo"
      :aria-label="messages.signLanguage">
      <swiper-slide class="d-flex mt-4_2 flex-column text-center">
        <h1 class="fw-bold">{{ messages.signLanguage }}</h1>
        <video src="../assets/video/signLanguageIntroduction.mp4" class="w-5_12 m-auto pb-2_5" controls autoplay playsinline
          :aria-label="messages.videoSignLanguage">
          <track kind="captions" src="/assets/captions/signLanguageIntroduction.vtt" srclang="es" label="Español" default />
        </video>
      </swiper-slide>
    </swiper>
    <swiper v-if="initScene < 5 && initScene != -1" class="bg-black mt-4_6 text-yellow swiper-container"
      :navigation="navigation" :modules="modules" :loop="true" :initial-slide="initScene != null ? initScene : 0"
      @swiper="onSwiper" @slideChangeTransitionStart="handleSlideChange" role="contentinfo" :aria-label="messages.swiperScenes + ' (' + (currentSlide + 1) + ' / 5)'">
      <swiper-slide class="d-flex mt-4_2 flex-column text-center" v-for="(_, index) in 5" :key="getSlideKey(index)">
        <h1 class="fw-bold" role="heading" aria-level="1">
          {{ getSceneMessage(index) }}
        </h1>
        <audio :id="`audioPlayer${((5 + index) % 5) + 1}`" :ref="(el) => {
            audioRefs[((5 + index) % 5) + 1] = el;
          }
          " @ended="onAudioEnded(((5 + index) % 5) + 1)"
          @loadstart="handleLoadStart(((5 + index) % 5) + 1)"
          @canplay="handleCanPlay(((5 + index) % 5) + 1)"
          @error="handleAudioError(((5 + index) % 5) + 1)">
          <source :src="$t(`audio${((5 + index) % 5) + 1}`)" type="audio/mpeg" />
        </audio>
        <div class="d-flex flex-column justify-content-center" role="group">
          <button @click="controlAudio(((5 + index) % 5) + 1)" @keydown.enter="controlAudio(((5 + index) % 5) + 1)"
            @keydown.space="controlAudio(((5 + index) % 5) + 1)"
            class="mt-5 m-auto fs-text_2xl py-2_5 w-1_3 border border-0 bg-black text-yellow shadow-shadowYellow1 rounded-5"
            :aria-controls="`audioPlayer${((5 + index) % 5) + 1}`" role="button"
            :aria-label="isError[((5 + index) % 5) + 1] ? messages.audioError : isLoading[((5 + index) % 5) + 1] ? messages.audioLoading : isPlayed[((5 + index) % 5) + 1] ? messages.pauseAudio : messages.playAudio"
            :disabled="isError[((5 + index) % 5) + 1] || isLoading[((5 + index) % 5) + 1]"
            tabindex="0">
            {{ isError[((5 + index) % 5) + 1] ? messages.audioError : isLoading[((5 + index) % 5) + 1] ? messages.audioLoading : isPlayed[((5 + index) % 5) + 1] ? "Pause" : "Play" }}
          </button>
          <button @click="toggleSubtitles((5 + index) % 5)" @keydown.enter="toggleSubtitles((5 + index) % 5)"
            @keydown.space="toggleSubtitles((5 + index) % 5)"
            class="mt-5 m-auto fs-text_base w-1_3 border border-0 bg-black text-yellow shadow-shadowYellow1 rounded-5"
            role="button" tabindex="0" :aria-label="!showSubtitles
                ? messages.enableSubtitle
                : messages.disableSubtitle
              " aria-labelledby="audioControlDesc">
            {{
              !showSubtitles
                ? messages.enableSubtitle
                : messages.disableSubtitle
            }}
          </button>
        </div>
      </swiper-slide>
      <div ref="prevButton" class="swiper-button-next text-yellow shadow-shadowYellow2 w-5 h-4_8" role="button"
        tabindex="0" @keydown.enter="navigateNext" @keydown.space="navigateNext" :aria-label="messages.nextScene"
        v-show="isNextButtonVisible" :tabindex="isNextButtonVisible ? 0 : -1"></div>
      <div ref="nextButton" class="swiper-button-prev text-yellow shadow-shadowYellow2 w-5 h-4_8" role="button"
        tabindex="0" @keydown.enter="navigatePrev" @keydown.space="navigatePrev" :aria-label="messages.previousScene"
        v-show="isNextButtonVisible" :tabindex="isNextButtonVisible ? 0 : -1"></div>
      <p id="audioControlDesc" v-if="currentSubtitle && showSubtitles" role="status" aria-live="polite"
        class="subtitles fs-text_base text-center m-auto pt-4_4 w-5_6">
        {{ currentSubtitle.word }}
      </p>
    </swiper>
  </div>
</template>

<style scoped>
.swiper-button-next,
.swiper-button-prev {
  position: absolute;
  top: 70%;
  --swiper-navigation-size: 1.25rem;
  position: absolute;
  bottom: 1.25rem;
}
</style>
