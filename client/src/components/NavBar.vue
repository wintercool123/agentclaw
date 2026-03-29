<template>
  <nav class="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2">
          <LogoIcon :size="32" />
          <span class="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            CodeClaw
          </span>
        </RouterLink>

        <!-- Nav links -->
        <div class="hidden md:flex items-center gap-8">
          <RouterLink to="/chat" class="text-gray-400 hover:text-white transition-colors text-sm">
            Chat
          </RouterLink>
          <RouterLink to="/pricing" class="text-gray-400 hover:text-white transition-colors text-sm">
            Pricing
          </RouterLink>
          <RouterLink to="/analytics" class="text-gray-400 hover:text-white transition-colors text-sm">
            Analytics
          </RouterLink>
          <a href="https://github.com" target="_blank" class="text-gray-400 hover:text-white transition-colors text-sm">
            Docs
          </a>
        </div>

        <!-- Auth -->
        <div class="flex items-center gap-3">
          <template v-if="authStore.user">
            <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg text-sm">
              <span class="text-indigo-400">⚡</span>
              <span class="text-gray-300">{{ formatBalance(authStore.user.balance) }}</span>
            </div>
            <RouterLink to="/dashboard" class="btn-secondary text-sm px-3 py-1.5">
              Dashboard
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/auth" class="text-gray-400 hover:text-white text-sm transition-colors">
              Sign in
            </RouterLink>
            <RouterLink to="/auth?tab=register" class="btn-primary text-sm px-3 py-1.5">
              Get Started Free
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import LogoIcon from './LogoIcon.vue';
import LogoIcon from './LogoIcon.vue';

const authStore = useAuthStore();

const formatBalance = (balance: number) => {
  if (balance >= 1000000) return `${(balance / 1000000).toFixed(1)}M tokens`;
  if (balance >= 1000) return `${(balance / 1000).toFixed(0)}K tokens`;
  return `${balance} tokens`;
};
</script>
