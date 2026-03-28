<template>
  <div class="max-w-5xl mx-auto px-4 py-24">
    <div class="text-center mb-16">
      <h1 class="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
      <p class="text-gray-400 text-lg">Pay only for what you use. No hidden fees.</p>
      
      <!-- Toggle -->
      <div class="flex items-center justify-center gap-3 mt-6">
        <span :class="['text-sm', !isAnnual ? 'text-white' : 'text-gray-500']">Monthly</span>
        <button @click="isAnnual = !isAnnual"
          :class="['relative w-12 h-6 rounded-full transition-colors', isAnnual ? 'bg-indigo-600' : 'bg-gray-700']">
          <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-transform', isAnnual ? 'translate-x-7' : 'translate-x-1']"></div>
        </button>
        <span :class="['text-sm', isAnnual ? 'text-white' : 'text-gray-500']">
          Annual <span class="text-green-400 text-xs">Save 20%</span>
        </span>
      </div>
    </div>

    <!-- Plans -->
    <div class="grid md:grid-cols-3 gap-6 mb-20">
      <div v-for="plan in plans" :key="plan.id"
        :class="['card relative', plan.popular ? 'border-indigo-500 ring-1 ring-indigo-500' : '']">
        
        <div v-if="plan.popular" class="absolute -top-3 left-1/2 -translate-x-1/2">
          <span class="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-medium">Most Popular</span>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-1">{{ plan.name }}</h3>
          <p class="text-gray-500 text-sm">{{ plan.description }}</p>
        </div>

        <div class="mb-6">
          <div class="flex items-end gap-1">
            <span class="text-4xl font-bold">${{ isAnnual ? Math.floor(plan.price * 0.8) : plan.price }}</span>
            <span class="text-gray-500 mb-1">/month</span>
          </div>
          <div v-if="plan.tokens > 0" class="text-sm text-gray-400 mt-1">
            {{ formatTokens(plan.tokens) }} tokens included
          </div>
          <div v-else class="text-sm text-green-400 mt-1">Unlimited tokens</div>
        </div>

        <button :class="['w-full py-2.5 rounded-lg font-medium transition-colors', plan.popular ? 'btn-primary' : 'btn-secondary']">
          {{ plan.price === 0 ? 'Get started free' : 'Subscribe now' }}
        </button>

        <ul class="mt-6 space-y-3">
          <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2 text-sm text-gray-400">
            <span class="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            {{ feature }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Token pricing table -->
    <div class="mb-20">
      <h2 class="text-2xl font-bold text-center mb-8">Pay-as-you-go token pricing</h2>
      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-800">
              <th class="text-left py-3 px-4 text-gray-400 font-medium">Model</th>
              <th class="text-right py-3 px-4 text-gray-400 font-medium">Input (per 1M tokens)</th>
              <th class="text-right py-3 px-4 text-gray-400 font-medium">Output (per 1M tokens)</th>
              <th class="text-right py-3 px-4 text-gray-400 font-medium">vs Claude Sonnet</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            <tr v-for="model in modelPricing" :key="model.name"
              class="hover:bg-gray-800/50 transition-colors">
              <td class="py-3 px-4 font-medium">{{ model.name }}</td>
              <td class="py-3 px-4 text-right text-green-400">${{ model.input }}</td>
              <td class="py-3 px-4 text-right text-green-400">${{ model.output }}</td>
              <td class="py-3 px-4 text-right">
                <span class="text-indigo-400 font-medium">{{ model.savings }} cheaper</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-center text-gray-600 text-xs mt-3">Claude Sonnet 3.5 is $3.00/1M input, $15.00/1M output for comparison</p>
    </div>

    <!-- FAQ -->
    <div>
      <h2 class="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
      <div class="space-y-4 max-w-2xl mx-auto">
        <div v-for="faq in faqs" :key="faq.q" class="card">
          <h3 class="font-medium mb-2">{{ faq.q }}</h3>
          <p class="text-gray-400 text-sm">{{ faq.a }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isAnnual = ref(false);

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for exploring',
    price: 0,
    tokens: 100000,
    popular: false,
    features: [
      '100K tokens on signup',
      'Access to all 4 models',
      'Streaming responses',
      'Community support',
      'API access'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individual developers',
    price: 9,
    tokens: 1000000,
    popular: true,
    features: [
      '1M tokens per month',
      'Access to all 4 models',
      'Smart model routing',
      'Priority processing',
      'Email support',
      'Usage analytics dashboard'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For power users & teams',
    price: 29,
    tokens: -1,
    popular: false,
    features: [
      'Unlimited tokens',
      'All Starter features',
      'Team collaboration (5 seats)',
      'Auto failover between models',
      'Dedicated support',
      'SLA guarantee',
      'Custom model fine-tuning (coming soon)'
    ]
  }
];

const modelPricing = [
  { name: 'DeepSeek V3', input: '0.28', output: '1.10', savings: '15x' },
  { name: 'DeepSeek Coder', input: '0.14', output: '0.28', savings: '20x' },
  { name: 'GLM-4', input: '0.36', output: '1.44', savings: '10x' },
  { name: 'Kimi K2', input: '0.60', output: '2.50', savings: '6x' }
];

const faqs = [
  {
    q: 'Is CodeClaw OpenAI-compatible?',
    a: 'Yes! Our API is fully compatible with the OpenAI SDK. Just change the base URL and API key — your existing code works immediately.'
  },
  {
    q: 'How does billing work?',
    a: 'You start with 100K free tokens. After that, subscribe to a plan for monthly token allowances, or top up with pay-as-you-go credits.'
  },
  {
    q: 'What happens if I hit my token limit?',
    a: 'You\'ll be notified when you reach 80% of your limit. You can top up credits or upgrade your plan at any time without interruption.'
  },
  {
    q: 'Are the Chinese AI models censored?',
    a: 'For coding and technical tasks, these models perform equivalently to Western models. Some topics may be filtered, but this doesn\'t affect developer use cases.'
  },
  {
    q: 'Is my data private?',
    a: 'We do not store your conversation content beyond the current session. API calls are passed through to model providers securely over HTTPS.'
  }
];

const formatTokens = (n: number) => {
  if (n >= 1000000) return `${n / 1000000}M`;
  return `${n / 1000}K`;
};
</script>
