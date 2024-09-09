<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { ref, reactive, watch, onMounted, onUnmounted} from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    messages: {
        type: Object,
        required: true, // Puedes ajustar esto según sea necesario
    },
    language: {
        type: String,
        required: true,
    },
})

const modules = [Navigation];

// Navigation options
const navigation = {
  nextEl: '.swiper-button-next',
  prevEl: '.swiper-button-prev',
};


const { t } = useI18n()
const audioRefs = ref(new Array(7).fill());
const isPlayed = ref([false, false, false, false, false, false, false]);
let sceneNumber = ref(0);
const params = new URLSearchParams(window.location.search);
let initScene = params.get('init');
initScene !== null ? initScene -= 1 : initScene = -1
let currentSubtitle = ref(null);
const showSubtitles = ref(false);
let audio = ref()
let intervalId = null;
const getSlideKey = (index) => `${(4 + (index)) % 4 + 1}`;
const getSceneMessage = (index) => t(`scene${(4 + (index)) % 4 + 1}`);

console.log(showSubtitles)


console.log(props.language)

watch(() => props.language, () => {
    audioRefs.value.forEach((audioRef, index) => {
        if (audioRef) {
            audioRef.pause();
            audioRef.currentTime = 0;
            audioRef.load();
            isPlayed.value = isPlayed.value.map((state, i) => i === index ? false : state);
           
        }
    });

})


const handleSlideChange = () => {

    console.log("Entra a la función")

    audioRefs.value.forEach((ref, index) => {
        if (ref && isPlayed.value[index]) {
            console.log(`Pausando audio de escena: ${sceneNumber.value}`);
            ref.pause();
            ref.currentTime = 0;
            isPlayed.value[index] = false;
            showSubtitles.value = false;
 
        }
    });

    currentSubtitle.value = null;

};

const controlAudio = (index) => {
    console.log(index)
    isPlayed.value[index] = !isPlayed.value[index];
    audio = audioRefs.value[index];

    console.log(isPlayed.value[index])

    if (audio) {
        console.log("1")
        if (isPlayed.value[index]) {
            console.log("2")
            audio.play();
        } else {
            console.log("3")
            audio.pause();
        }
    }
}

const handleAudioEnded = (sceneNumber) => {
    console.log(sceneNumber)
    isPlayed.value[sceneNumber] = false;
    currentSubtitle.value = null; 

};



/*const updateSubtitles = async() => {
    
    if (showSubtitles.value) {
        const audio = audioRefs.value[sceneNumber.value];
        if (audio) {
            const foundWord = audio?.id.replace("audioPlayer", "");
            try {
                const response = await fetch(props.messages[`subtitle${foundWord}`]);
                const data = await response.json();
                const currentTime = audio.currentTime;
                currentSubtitle.value = data.stab_segments.find(sub => currentTime >= sub.start && currentTime <= sub.end);
            } catch (error) {
                console.error("Error fetching subtitles:", error);
            }
    }
};
}*/


const updateSubtitles = async () => {
    console.log("Actualización de subtítulos iniciada");
    if (showSubtitles.value) {
        const audio = audioRefs.value[sceneNumber.value];
        console.log("Audio actual:", audio);
        if (audio) {
            const foundWord = audio.id.replace("audioPlayer", "");
            console.log("Palabra encontrada:", foundWord);
            try {
                const response = await fetch(props.messages[`subtitle${foundWord}`]);
                const data = await response.json();
                console.log("Datos de subtítulos:", data);
                const currentTime = audio.currentTime;
                console.log("Tiempo actual del audio:", currentTime);
                currentSubtitle.value = data.stab_segments.find(sub => currentTime >= sub.start && currentTime <= sub.end);
                console.log("Subtítulo actual:", currentSubtitle.value);
            } catch (error) {
                console.error("Error al obtener los subtítulos:", error);
            }
        }
    }
};
const toggleSubtitles = (subtitleNumber) => {
    showSubtitles.value = !showSubtitles.value;
    sceneNumber.value = subtitleNumber + 1;
};

watch(showSubtitles, (newValue) => {
    console.log(newValue)
    if (newValue) {
        intervalId = setInterval(updateSubtitles, 100);
    } else {
        if (intervalId) {
            clearInterval(intervalId);
        }
        currentSubtitle.value = null; 
    }
});


</script>

<template>
    <div class="" role="scenes">
        <swiper v-if="initScene === -1" class="bg-black mt-4_6 text-yellow">
            <swiper-slide class="d-flex mt-4_2 flex-column text-center ">
                <h1 class="fw-bold" role="title">{{ messages.sceneAdult }}</h1>
                <img src="../assets/img/imgAdult.png" alt="" class="w-1_3 m-auto">
                <audio id="audioPlayerAdult" :ref="(el) => { audioRefs[initScene + 1] = el, sceneNumber = initScene + 1 }" 
                    @ended="handleAudioEnded(initScene + 1)">
                    <source :src="$t(`audioAdult`)" type="audio/mpeg"/>
                </audio>
                <div class="d-flex justify-content-center">
                <button @click="controlAudio(initScene + 1)" class="mt-5 m-auto fs-text_2xl py-2_5 w-1_3 border border-0 bg-black text-yellow shadow-shadowYellow1 rounded-5" :title="messages.titleAudioAdult">
                    {{ isPlayed[initScene + 1] ? 'Pause' : 'Play' }}
                </button>
                <button @click="toggleSubtitles" class="mt-5 m-auto fs-text_base w-1_3 border border-0 bg-black text-yellow shadow-shadowYellow1 rounded-5" :title="!showSubtitles ? messages.enableSubtitle : messages.disableSubtitle" > {{ showSubtitles ? messages.disableSubtitle : messages.enableSubtitle }}</button>
            </div>
                <p v-if="currentSubtitle"  class="subtitles w-4_5 fs-text_base text-center m-auto pt-4_4">
                    {{ currentSubtitle.word }}
                </p>
            </swiper-slide>
        </swiper>
        <swiper v-if="initScene === 4" class="bg-black mt-4_6 text-yellow ">
            <swiper-slide class="d-flex mt-4_2 flex-column text-center ">
                <h1 class="fw-bold" role="title">{{ messages.sceneKid }}</h1>
                <img src="../assets/img/imgKid.png" alt="" class="w-1_3 m-auto">
                <audio id="audioPlayerKid" :ref="(el) => { audioRefs[initScene + 1] = el, sceneNumber = initScene + 1 }"
                    @ended="handleAudioEnded(initScene + 1)">
                    <source :src="$t(`audioKid`)" type="audio/mpeg"/>
                </audio>
                <div class="d-flex justify-content-center">
                <button @click="controlAudio(initScene + 1)" class="mt-5 m-auto fs-text_2xl py-2_5 w-1_3 border border-0 bg-black text-yellow shadow-shadowYellow1 rounded-5" :title="messages.titleAudioAdult">
                    {{ isPlayed[initScene + 1] ? 'Pause' : 'Play' }}
                </button>
                <button @click="toggleSubtitles" class="mt-5 m-auto fs-text_base w-1_3 border border-0 bg-black text-yellow shadow-shadowYellow1 rounded-5"  title="Activar Subitutlos" > {{ !showSubtitles ? messages.enableSubtitle : messages.disableSubtitle }}</button>
            </div>
                <p v-if="currentSubtitle"  class="subtitles w-4_5 fs-text_base text-center m-auto pt-4_4">
                    {{ currentSubtitle.word }}
                </p>
            </swiper-slide>
        </swiper>
        <swiper v-if="initScene < 4 && initScene !=-1" class="bg-black mt-4_6 text-yellow swiper-container" :navigation="navigation" :modules="modules" :loop="true" :initial-slide="initScene != null ? initScene : 0"  @slideChangeTransitionEnd="handleSlideChange">
            <swiper-slide class="d-flex mt-4_2 flex-column text-center " v-for="(slide, index) in 4" :key="getSlideKey(index)">
                <h1 class="fw-bold" role="title">{{getSceneMessage(index)}}</h1>
                <audio :id="`audioPlayer${((4 + index)) % 4 + 1}`" :ref="(el) => { audioRefs[((4 + index)) % 4 + 1] = el}"
                    @ended="handleAudioEnded(((4 + index)) % 4 + 1)">
                    <source :src="$t(`audio${((4 + index)) % 4 +1}`)" type="audio/mpeg"/>
                </audio>
                <div class="d-flex flex-column justify-content-center">
                <button @click="controlAudio(((4 + index)) % 4 + 1)" class="mt-5 m-auto fs-text_2xl py-2_5 w-1_3 border border-0 bg-black text-yellow shadow-shadowYellow1 rounded-5" :title="messages.titleAudioAdult">
                    {{ isPlayed[((4 + index)) % 4 + 1 ]  ? 'Pause' : 'Play' }}
                </button>
                <button @click="toggleSubtitles(((4 + index)) % 4)" class="mt-5 m-auto fs-text_base w-1_3 border border-0 bg-black text-yellow shadow-shadowYellow1 rounded-5"  title="Activar Subitutlos" > {{ !showSubtitles ? messages.enableSubtitle : messages.disableSubtitle }}</button>
            </div>
            <p v-if="currentSubtitle"  class="subtitles w-4_5 fs-text_base text-center m-auto pt-4_4">
                {{ currentSubtitle.word }}
            </p>
            </swiper-slide>
            <div ref="prevButton" class="swiper-button-next text-yellow shadow-shadowYellow2 w-5 h-4_8"></div>
            <div ref="nextButton" class="swiper-button-prev text-yellow shadow-shadowYellow2 w-5 h-4_8"></div>
        </swiper>
    </div>
</template>

<style scoped>
  .swiper-button-next, .swiper-button-prev{
    position: absolute;
    top: auto;
    --swiper-navigation-size: 1.25rem;
    position: absolute;
    bottom:1.25rem;
  }
</style>