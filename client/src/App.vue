<template>
  <div class="min-h-screen bg-gray-950">
    <NavBar />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import NavBar from './components/NavBar.vue';
</script>
