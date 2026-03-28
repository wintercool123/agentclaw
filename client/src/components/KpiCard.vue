<template>
  <div class="bg-gray-900 rounded-xl border border-gray-800 p-5">
    <div class="flex items-start justify-between">
      <div>
        <div class="text-sm text-gray-500 mb-1">{{ label }}</div>
        <div class="text-2xl font-bold">{{ value }}</div>
        <div class="text-xs mt-1" :class="positive ? 'text-green-400' : 'text-gray-500'">{{ sub }}</div>
      </div>
      <div class="text-2xl opacity-70">{{ icon }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  positive?: boolean;
}>();
</script>
