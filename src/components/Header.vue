<script setup>
defineProps({
  messages:    { type: Object,   required: true },
  setLanguage: { type: Function, required: true },
})
</script>

<template>
  <header class="site-header" :aria-label="messages.header">
    <span class="visually-hidden">{{ messages.header }}</span>
    <img
      src="../assets/img/logo.png"
      alt=""
      class="site-header__logo"
      role="none" />
    <div class="site-header__sponsor" :aria-label="messages.sponsors">
      <h2 class="visually-hidden">{{ messages.sponsors }}</h2>
      <img
        src="../assets/img/anis_tenis.png"
        :alt="messages.sponsors"
        class="w-100" />
    </div>
  </header>
</template>
