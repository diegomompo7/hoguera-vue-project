<script setup>

defineProps({
    messages: {
        type: Object,
        required: true, // Puedes ajustar esto según sea necesario
    },
    setLanguage: {
        type: Function,
        required: true, // Puedes ajustar esto según sea necesario
    }
})

</script>

<template>
    <div class="text-center mb-3_5" role="language">
        <h1 class="visually-hidden">{{ messages.language }}</h1>
        <img src="../assets/img/valencia.svg" :alt="messages.pageValencia" class=" w-5 me-2_25" @click="setLanguage('va')"
            @keypress="setLanguage('va')" tabindex="0"/>
        <img src="../assets/img/spain.svg" :alt="messages.pageSpanish" class=" w-5 me-2_25" @click="setLanguage('es')"
            @keypress="setLanguage('es')" tabindex="0"/>
        <img src="../assets/img/uk.svg" :alt="messages.pageEnglish" class="w-5 me-2_25" @click="setLanguage('en')"
            @keypress="setLanguage('en')" tabindex="0"/>
    </div>

</template>