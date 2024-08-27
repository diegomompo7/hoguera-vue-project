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
    <div class="text-center pt-3" role="language">
        <h1 class="visually-hidden">{{ messages.language }}</h1>
        <img src="../assets/img/valencia.svg" :alt="messages.pageValencia" class=" w-12 me-2" @click="setLanguage('va')"
            @keypress="setLanguage('va')" />
        <img src="../assets/img/spain.svg" :alt="messages.pageSpanish" class=" w-12 me-2" @click="setLanguage('es')"
            @keypress="setLanguage('es')" />
        <img src="../assets/img/uk.svg" :alt="messages.pageEnglish" class="w-12 me-2" @click="setLanguage('en')"
            @keypress="setLanguage('en')" />
    </div>

</template>