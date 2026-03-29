<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Outer bracket shape -->
    <path
      d="M25 15 L15 25 L15 75 L25 85"
      stroke="url(#gradient1)"
      stroke-width="8"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
    <path
      d="M75 15 L85 25 L85 75 L75 85"
      stroke="url(#gradient1)"
      stroke-width="8"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
    <!-- Inner claw/code symbol -->
    <path
      d="M35 50 L45 35 L55 50 L45 65 Z"
      fill="url(#gradient2)"
    />
    <!-- Slash element -->
    <path
      d="M60 30 L40 70"
      stroke="url(#gradient1)"
      stroke-width="6"
      stroke-linecap="round"
    />
    <defs>
      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1" />
        <stop offset="100%" stop-color="#a855f7" />
      </linearGradient>
      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#818cf8" />
        <stop offset="100%" stop-color="#c084fc" />
      </linearGradient>
    </defs>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  size?: number
}>()
</script>
