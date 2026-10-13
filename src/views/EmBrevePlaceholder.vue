<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section class="vazio">
    <h1>{{ route.meta.titulo }}</h1>
    <p>Esta tela ainda não foi montada. Envie o layout dela para eu criar.</p>
  </section>
</template>

<style scoped>
.vazio h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #14301f;
}
.vazio p {
  margin: 8px 0 0;
  font-size: 15px;
  color: #5b6f62;
}
</style>
