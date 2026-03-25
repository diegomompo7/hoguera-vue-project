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
    <header class="d-flex justify-content-center" :aria-label="messages.header">
        <h1 class="visually-hidden">{{ messages.header }}</h1>
        <img src="../assets/img/logo.png" alt="" class="w-25 mx-4_2" role="none" />
        <div class="w-50 align-self-center" :aria-label="messages.sponsors">
            <h2 class="visually-hidden">{{ messages.sponsors }}</h2>
            <img src="../assets/img/anis_tenis.png" :alt="messages.sponsors" class="w-100" />
        </div>
    </header>
</template>
