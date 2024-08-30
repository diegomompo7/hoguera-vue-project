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


console.log(props.language)

watch(() => props.language, () => {
    audioRefs.value.forEach((audioRef, index) => {
        if (audioRef) {
            audioRef.pause();
            audioRef.currentTime = 0;
            audioRef.load();
            isPlayed.value = isPlayed.value.map((state, i) => i === index ? false : state); // Reiniciar el estado de reproducción de la 
        }
    });

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
    sceneNumber = sceneNumber
    audio = audioRefs.value[sceneNumber];

    console.log(audio)

    console.log(isPlayed)

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
    isPlayed.value[sceneNumber] = false;
    currentSubtitle.value = null; 
};

let subtitleData = null

const updateSubtitles = async() => {
    if (showSubtitles.value) {
        console.log(sceneNumber.value)
        const audio = audioRefs.value[sceneNumber.value];
        const foundWord = audio.id.replace("audioPlayer", "");
        console.log(foundWord)
        if (audio) {
            await fetch(props.messages[`subtitle${foundWord}`])
            .then(response => response.json())
            .then(data => {
                console.log(data)
                const currentTime = audio.currentTime;
            currentSubtitle.value = data.stab_segments.find(sub => currentTime >= sub.start && currentTime <= sub.end);
    
            })
    }
};
}


const toggleSubtitles = () => {
    showSubtitles.value = !showSubtitles.value;
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

console.log(props.messages)


</script>

<template>
    <div class="" role="scenes">
        <swiper v-if="initScene === -1" class="bg-black mt-4_6 text-yellow-500 ">
            <swiper-slide class="d-flex mt-4_2 flex-column text-center ">
                <h1 class="fw-bold" role="title">{{ messages.sceneAdult }}</h1>
                <img src="../assets/img/imgAdult.png" alt="" class="w-1_3 m-auto">
                <audio id="audioPlayerAdult" :ref="(el) => { audioRefs[initScene + 1] = el, sceneNumber = initScene + 1 }" 
                    @ended="handleAudioEnded(initScene + 1)">
                    <source :src="$t(`audioAdult`)" type="audio/mpeg"/>
                </audio>
                <div class="d-flex justify-content-center">
                <button @click="controlAudio(initScene + 1)" class="mt-5 m-auto fs-text_2xl py-2_5 w-1_3 border border-0 bg-black text-yellow-500 shadow-shadowYellow rounded-5" :title="messages.titleAudioAdult">
                    {{ isPlayed[initScene + 1] ? 'Pause' : 'Play' }}
                </button>
                <button @click="toggleSubtitles" class="mt-5 m-auto fs-text_base w-1_3 border border-0 bg-black text-yellow-500 shadow-shadowYellow rounded-5" :title="!showSubtitles ? messages.enableSubtitle : messages.disableSubtitle" > {{ !showSubtitles ? messages.enableSubtitle : messages.disableSubtitle }}</button>
            </div>
                <p v-if="currentSubtitle"  class="subtitles w-4_5 fs-text_base text-center m-auto pt-4_4">
                    {{ currentSubtitle.word }}
                </p>
            </swiper-slide>
        </swiper>
        <swiper v-if="initScene === 4" class="bg-black mt-4_6 text-yellow-500 ">
            <swiper-slide class="d-flex mt-4_2 flex-column text-center ">
                <h1 class="fw-bold" role="title">{{ messages.sceneKid }}</h1>
                <img src="../assets/img/imgKid.png" alt="" class="w-1_3 m-auto">
                <audio id="audioPlayerKid" :ref="(el) => { audioRefs[initScene + 1] = el, sceneNumber = initScene + 1 }"
                    @ended="handleAudioEnded(initScene + 1)">
                    <source :src="$t(`audioKid`)" type="audio/mpeg"/>
                </audio>
                <div class="d-flex justify-content-center">
                <button @click="controlAudio(initScene + 1)" class="mt-5 m-auto fs-text_2xl py-2_5 w-1_3 border border-0 bg-black text-yellow-500 shadow-shadowYellow rounded-5" :title="messages.titleAudioAdult">
                    {{ isPlayed[initScene + 1] ? 'Pause' : 'Play' }}
                </button>
                <button @click="toggleSubtitles" class="mt-5 m-auto fs-text_base w-1_3 border border-0 bg-black text-yellow-500 shadow-shadowYellow rounded-5"  title="Activar Subitutlos" > {{ !showSubtitles ? messages.enableSubtitle : messages.disableSubtitle }}</button>
            </div>
                <p v-if="currentSubtitle"  class="subtitles w-4_5 fs-text_base text-center m-auto pt-4_4">
                    {{ currentSubtitle.word }}
                </p>
            </swiper-slide>
        </swiper>
    </div>

</template>