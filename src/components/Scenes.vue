<script setup>

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

import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { ref, reactive, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';


const {t} = useI18n()
const audioRefs = ref([new Array(7).fill()]);
const isPlayed = ref([false, false, false, false, false, false, false]);

const params = new URLSearchParams(window.location.search);
let initScene = params.get('init');
initScene !== null ? initScene -= 1 : initScene = -1

console.log(initScene)

watch(() => props.language, () => {
    audioRefs.value.forEach((audioRef, index) => {
        if (audioRef) {
            audioRef.pause();
            audioRef.currentTime = 0;
            audioRef.src = t('audioAdult')
            audioRef.load();
            isPlayed.value = isPlayed.value.map((state, i) => i === index ? false : state); // Reiniciar el estado de reproducción de la 
        }
    });

    console.log( t('audioAdult'))


})


const handleSlideChange = () => {
    audioRefs.value.forEach((ref, index) => {
        if (audio && isPlayed[index]) {
            audio.value.pause();
            audio.currentTime = 0;
            isPlayed.value = isPlayed.map((state, i) => i === index ? false : state);
        }
    });
};

const controlAudio = (sceneNumber) => {
    isPlayed.value[sceneNumber] = !isPlayed.value[sceneNumber];
    
    const audio = audioRefs.value[sceneNumber];

    console.log(isPlayed.value[sceneNumber])

    if (audio) {
        console.log("1")
        if (isPlayed.value[sceneNumber]) {
            console.log("2")
            audio.play();
        } else {
            console.log("3")
            audio.pause();
        }
    }
}

const handleAudioEnded = (sceneNumber) => {
    isPlayed[sceneNumber] = false;
};



</script>

<template>
    <div class="" role="scenes">
        <swiper v-if="initScene === -1" class="bg-black mt-4_6 text-yellow-500 ">
            <swiper-slide class="d-flex mt-4_2 flex-column text-center ">
                <h1 class="fw-bold" role="title">{{ messages.sceneAdult }}</h1>
                <img src="../assets/img/imgAdult.png" alt="" class="w-1_3 m-auto">
                <audio id="audioPlayerAdult"  :ref="(el) => { audioRefs[initScene+1] = el}" @ended="handleAudioEnded(initScene + 1)">
                    <source :src="$t(`audioAdult`)"
                        type="audio/mpeg" />
                    <track
                        label="Spanish"
                        kind="captions"
                        srclang="es"
                        src="../assets/subtitles/SceneAdult.vtt"
                    default />
                    Tu navegador no soporta el elemento de audio.
                    <h1>El audio no se pudo cargar: {{ t('audioAdult') }}</h1>
                </audio>
                <button @click="controlAudio(initScene + 1)">
                    <component :is="isPlayed[initScene + 1] ? 'Pause' : 'Play'" />
                </button>
            </swiper-slide>
        </swiper>
    </div>

</template>