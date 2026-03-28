<template>
  <!-- Hero Section -->
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20 pointer-events-none"></div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <!-- Badge -->
      <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-900/40 border border-indigo-700/50 rounded-full text-indigo-300 text-sm mb-8">
        <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        Now in Beta · First 100 users get 1M free tokens
      </div>

      <!-- Headline -->
      <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
        Claude at
        <span class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          1/10 the price
        </span>
      </h1>

      <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
        Access DeepSeek V3, GLM-4, and Kimi — China's best AI models — through one unified API. 
        Same quality, 90% cheaper.
      </p>

      <!-- CTA -->
      <div class="flex items-center justify-center gap-4 flex-wrap">
        <RouterLink to="/chat" class="btn-primary text-lg px-8 py-3">
          Try it free →
        </RouterLink>
        <RouterLink to="/pricing" class="btn-secondary text-lg px-8 py-3">
          See pricing
        </RouterLink>
      </div>

      <!-- Social proof -->
      <p class="text-gray-500 text-sm mt-6">No credit card required · 100K free tokens on signup</p>
    </div>

    <!-- Comparison stats -->
    <div class="max-w-4xl mx-auto px-4 pb-20">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card text-center">
          <div class="text-3xl font-bold text-indigo-400">$0.001</div>
          <div class="text-gray-500 text-sm mt-1">per 1K tokens</div>
          <div class="text-gray-400 text-xs mt-0.5">vs $0.015 Claude Sonnet</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl font-bold text-purple-400">4</div>
          <div class="text-gray-500 text-sm mt-1">AI models</div>
          <div class="text-gray-400 text-xs mt-0.5">one unified API</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl font-bold text-green-400">99.9%</div>
          <div class="text-gray-500 text-sm mt-1">uptime SLA</div>
          <div class="text-gray-400 text-xs mt-0.5">auto failover</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl font-bold text-yellow-400">OpenAI</div>
          <div class="text-gray-500 text-sm mt-1">compatible API</div>
          <div class="text-gray-400 text-xs mt-0.5">drop-in replacement</div>
        </div>
      </div>
    </div>

    <!-- Features -->
    <div class="max-w-6xl mx-auto px-4 pb-24">
      <h2 class="text-3xl font-bold text-center mb-12">Everything developers need</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="card">
          <div class="text-3xl mb-4">🔀</div>
          <h3 class="font-semibold text-lg mb-2">Smart Model Router</h3>
          <p class="text-gray-400">Automatically selects the best model for your task — code, analysis, or writing.</p>
        </div>
        <div class="card">
          <div class="text-3xl mb-4">⚡</div>
          <h3 class="font-semibold text-lg mb-2">Stream by default</h3>
          <p class="text-gray-400">Real-time token streaming for faster perceived performance in your apps.</p>
        </div>
        <div class="card">
          <div class="text-3xl mb-4">🔌</div>
          <h3 class="font-semibold text-lg mb-2">OpenAI-compatible</h3>
          <p class="text-gray-400">Change one line of code to switch from OpenAI. Same SDK, same structure.</p>
        </div>
        <div class="card">
          <div class="text-3xl mb-4">📊</div>
          <h3 class="font-semibold text-lg mb-2">Usage analytics</h3>
          <p class="text-gray-400">Track token usage, costs, and performance across all models in one dashboard.</p>
        </div>
        <div class="card">
          <div class="text-3xl mb-4">🛡️</div>
          <h3 class="font-semibold text-lg mb-2">Auto failover</h3>
          <p class="text-gray-400">If one model is down, traffic automatically routes to the next best option.</p>
        </div>
        <div class="card">
          <div class="text-3xl mb-4">💳</div>
          <h3 class="font-semibold text-lg mb-2">Pay as you go</h3>
          <p class="text-gray-400">No subscriptions required. Top up credits and use only what you need.</p>
        </div>
      </div>
    </div>

    <!-- Pricing CTA -->
    <div class="text-center pb-24 px-4">
      <div class="card max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold mb-4">Start building today</h2>
        <p class="text-gray-400 mb-6">100,000 free tokens when you sign up. No credit card required.</p>
        <RouterLink to="/auth?tab=register" class="btn-primary text-lg px-8 py-3 inline-block">
          Create free account →
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
