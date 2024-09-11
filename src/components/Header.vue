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
    <h1 class="text-center visually-hidden">{{ messages.header }}</h1>
    <div class="d-flex justify-content-center " :role="messages.header">
        <img src="../assets/img/logo.png" alt="" class=" w-25 mx-4_2" role="logo" />
        <div class="w-50 align-self-center" :role="messages.sponsors">
            <h2 class="visually-hidden">{{ messages.sponsors }}</h2>
            <img src="../assets/img/tecnocasa.png" alt="Tecnocasa" class=" w-100 " tabindex="0" />
            <img src="../assets/img/electrodepot.png" alt="Electrodepot" class="w-3_5 mt-4_2 ms-3_5" tabindex="0" />
        </div>
    </div>

</template>