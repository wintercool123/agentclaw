<template>
  <div class="max-w-5xl mx-auto px-4 py-12">
    <h1 class="text-2xl font-bold mb-8">Dashboard</h1>

    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <div class="card">
        <div class="text-sm text-gray-500 mb-1">Total tokens used</div>
        <div class="text-3xl font-bold">{{ stats.tokensUsed.toLocaleString() }}</div>
        <div class="text-xs text-gray-600 mt-1">This month</div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-500 mb-1">Balance remaining</div>
        <div class="text-3xl font-bold text-indigo-400">{{ (authStore.user?.balance || 0).toLocaleString() }}</div>
        <div class="text-xs text-gray-600 mt-1">tokens</div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-500 mb-1">Money saved vs Claude</div>
        <div class="text-3xl font-bold text-green-400">${{ stats.moneySaved }}</div>
        <div class="text-xs text-gray-600 mt-1">vs Claude Sonnet 3.5</div>
      </div>
    </div>

    <!-- API Key section -->
    <div class="card mb-6">
      <h2 class="font-semibold mb-4">API Key</h2>
      <div class="flex gap-3 items-center">
        <code class="flex-1 px-4 py-2.5 bg-gray-800 rounded-lg text-sm font-mono text-gray-300">
          {{ showKey ? apiKey : '•'.repeat(32) }}
        </code>
        <button @click="showKey = !showKey" class="btn-secondary text-sm px-3 py-2.5">
          {{ showKey ? 'Hide' : 'Show' }}
        </button>
        <button @click="copyKey" class="btn-secondary text-sm px-3 py-2.5">
          {{ copied ? '✓ Copied!' : 'Copy' }}
        </button>
      </div>
      <p class="text-gray-600 text-xs mt-3">Use this key in your API requests: <code>Authorization: Bearer YOUR_KEY</code></p>
    </div>

    <!-- Quick start -->
    <div class="card">
      <h2 class="font-semibold mb-4">Quick start</h2>
      <pre class="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto text-gray-300"><code>from openai import OpenAI

client = OpenAI(
    base_url="https://api.codeclaw.ai/v1",
    api_key="{{ showKey ? apiKey : 'YOUR_API_KEY' }}"
)

response = client.chat.completions.create(
    model="deepseek-v3",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const showKey = ref(false);
const copied = ref(false);

const apiKey = computed(() => `cc_${authStore.user?.id || 'anonymous'}_live_xxxxxxxxxxxxxxxx`);

const stats = computed(() => ({
  tokensUsed: Math.floor(Math.random() * 50000),
  moneySaved: ((Math.floor(Math.random() * 50000) / 1000) * 0.003 * 10).toFixed(2)
}));

const copyKey = () => {
  navigator.clipboard.writeText(apiKey.value);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
};
</script>
