<template>
  <div>
    <div class="flex items-center justify-between mb-1">
      <span class="text-sm text-gray-300">{{ label }}</span>
      <div class="text-right">
        <span class="text-sm font-medium">{{ count.toLocaleString() }}</span>
        <span v-if="rate" class="text-xs text-gray-500 ml-2">{{ rate }}</span>
      </div>
    </div>
    <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
      <div :class="['h-full rounded-full transition-all', color]"
        :style="`width: ${max > 0 ? Math.round(count / max * 100) : 0}%`">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  count: number;
  max: number;
  color: string;
  rate?: string;
}>();
</script>
