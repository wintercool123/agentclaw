<template>
  <div class="max-w-md mx-auto px-4 py-24">
    <div class="text-center mb-8">
      <span class="text-5xl">🦞</span>
      <h1 class="text-3xl font-bold mt-4 mb-2">{{ isRegister ? 'Get started free' : 'Welcome back' }}</h1>
      <p class="text-gray-400 text-sm">
        {{ isRegister ? '100K free tokens, no credit card required' : 'Sign in to your account' }}
      </p>
    </div>

    <div class="card">
      <!-- Tab toggle -->
      <div class="flex gap-1 p-1 bg-gray-800 rounded-lg mb-6">
        <button @click="isRegister = false"
          :class="['flex-1 py-1.5 text-sm rounded-md transition-colors', !isRegister ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300']">
          Sign in
        </button>
        <button @click="isRegister = true"
          :class="['flex-1 py-1.5 text-sm rounded-md transition-colors', isRegister ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300']">
          Register
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="text-sm text-gray-400 block mb-1.5">Email</label>
          <input v-model="form.email" type="email" required class="input" placeholder="you@example.com" />
        </div>

        <div>
          <label class="text-sm text-gray-400 block mb-1.5">Password</label>
          <input v-model="form.password" type="password" required class="input" placeholder="••••••••"
            minlength="8" />
        </div>

        <div v-if="error" class="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
          {{ error }}
        </div>

        <button type="submit" :disabled="isLoading" class="btn-primary w-full py-3 disabled:opacity-50">
          <span v-if="isLoading">⟳ Loading...</span>
          <span v-else>{{ isRegister ? 'Create account →' : 'Sign in →' }}</span>
        </button>
      </form>

      <p v-if="isRegister" class="text-xs text-gray-600 text-center mt-4">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>

    <!-- Free tier callout -->
    <div v-if="isRegister" class="mt-6 p-4 bg-indigo-900/20 border border-indigo-800/50 rounded-xl text-center">
      <div class="text-indigo-300 font-medium text-sm mb-1">🎁 Free tier includes</div>
      <div class="text-gray-400 text-xs space-y-1">
        <div>100,000 tokens to start</div>
        <div>Access to all 4 AI models</div>
        <div>Full API access</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isRegister = ref(route.query.tab === 'register');
const isLoading = ref(false);
const error = ref('');

const form = ref({
  email: '',
  password: ''
});

const handleSubmit = async () => {
  error.value = '';
  isLoading.value = true;
  
  try {
    if (isRegister.value) {
      await authStore.register(form.value.email, form.value.password);
    } else {
      await authStore.login(form.value.email, form.value.password);
    }
    router.push('/chat');
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Something went wrong. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>
