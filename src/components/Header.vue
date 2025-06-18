<script setup>
defineProps({
    messages: {
        type: Object,
        required: true, // Puedes ajustar esto según sea necesario
    },
    setLanguage: {
        type: Function,
        required: true, // Puedes ajustar esto según sea necesario
    },
});
</script>

<template>
    <h1 class="text-center visually-hidden" role="heading">
        {{ messages.header }}
    </h1>
    <div class="d-flex justify-content-center" :role="messages.header">
        <img src="../assets/img/logo.png" alt="" class="w-25 mx-4_2" role="none" />
        <div class="w-50 align-self-center" :role="messages.sponsors">
            <h2 class="visually-hidden">{{ messages.sponsors }}</h2>
            <img src="../assets/img/anis_tenis.png" alt="Anis Tenis" class="w-100" tabindex="0" />

        </div>
    </div>
</template>
