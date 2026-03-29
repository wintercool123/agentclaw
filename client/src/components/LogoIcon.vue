<template>
  <svg :width="size" :height="size" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="clawGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#818cf8" />
        <stop offset="100%" stop-color="#a855f7" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="10" fill="url(#clawGrad)" opacity="0.15" />
    <path d="M13 10 C9 14 9 26 13 30" stroke="url(#clawGrad)" stroke-width="2.8" stroke-linecap="round" fill="none" />
    <path d="M27 10 C31 14 31 26 27 30" stroke="url(#clawGrad)" stroke-width="2.8" stroke-linecap="round" fill="none" />
    <path d="M22 9 L18 31" stroke="url(#clawGrad)" stroke-width="2.4" stroke-linecap="round" />
  </svg>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 32 });
</script>
