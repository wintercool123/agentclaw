<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold">Analytics & Growth</h1>
        <p class="text-gray-500 text-sm mt-1">Real-time platform metrics and pricing recommendations</p>
      </div>
      <button @click="store.fetchAll()" :disabled="store.loading"
        class="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
        <span :class="store.loading ? 'animate-spin' : ''">↻</span>
        Refresh
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="store.loading && !store.overview" class="flex items-center justify-center py-20">
      <div class="text-gray-500">Loading analytics...</div>
    </div>

    <template v-else-if="store.overview">
      <!-- KPI cards row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Est. Monthly Revenue"
          :value="`$${store.overview.revenue.estimatedRevenue.toFixed(2)}`"
          :sub="`${store.overview.revenue.momGrowth >= 0 ? '+' : ''}${store.overview.revenue.momGrowth}% MoM`"
          :positive="store.overview.revenue.momGrowth >= 0"
          icon="💰"
        />
        <KpiCard
          label="DAU / MAU"
          :value="`${store.overview.activeUsers.dau} / ${store.overview.activeUsers.mau}`"
          :sub="`WAU: ${store.overview.activeUsers.wau}`"
          icon="👥"
        />
        <KpiCard
          label="Tokens This Month"
          :value="formatTokens(store.overview.revenue.thisMonthTokens)"
          :sub="`Last month: ${formatTokens(store.overview.revenue.lastMonthTokens)}`"
          icon="⚡"
        />
        <KpiCard
          label="Paid Conversions"
          :value="store.overview.funnel.paidConversions"
          :sub="`${store.overview.funnel.activationToPaid}% activation→paid`"
          icon="💳"
        />
      </div>

      <!-- Main content grid -->
      <div class="grid md:grid-cols-3 gap-6 mb-6">
        <!-- Conversion Funnel -->
        <div class="card md:col-span-1">
          <h2 class="font-semibold mb-4 flex items-center gap-2">
            <span>🔽</span> Conversion Funnel
          </h2>
          <div class="space-y-3">
            <FunnelStep label="Visitors" :count="store.overview.funnel.visitors" :max="store.overview.funnel.visitors" color="bg-blue-500" />
            <FunnelStep label="Sign-ups" :count="store.overview.funnel.signups" :max="store.overview.funnel.visitors"
              color="bg-indigo-500"
              :rate="`${store.overview.funnel.visitorToSignup}%`" />
            <FunnelStep label="First API Call" :count="store.overview.funnel.firstCalls" :max="store.overview.funnel.visitors"
              color="bg-violet-500"
              :rate="`${store.overview.funnel.signupToActivation}% of signups`" />
            <FunnelStep label="Paid" :count="store.overview.funnel.paidConversions" :max="store.overview.funnel.visitors"
              color="bg-green-500"
              :rate="`${store.overview.funnel.activationToPaid}% of active`" />
          </div>
        </div>

        <!-- Hourly Usage Heatmap -->
        <div class="card md:col-span-2">
          <h2 class="font-semibold mb-4 flex items-center gap-2">
            <span>📊</span> Hourly Call Volume (Last 24h)
          </h2>
          <div class="flex items-end gap-1 h-24">
            <div v-for="bucket in store.hourly" :key="bucket.hour"
              class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full rounded-sm bg-indigo-500 transition-all"
                :style="`height: ${maxHourlyBar(bucket.calls)}px; opacity: ${bucket.calls > 0 ? 0.4 + 0.6 * bucket.calls / maxHourlyCalls : 0.1}`"
                :title="`${bucket.hour}:00 — ${bucket.calls} calls`">
              </div>
            </div>
          </div>
          <div class="flex justify-between text-xs text-gray-600 mt-1 px-0.5">
            <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>24h</span>
          </div>
        </div>
      </div>

      <!-- Model performance table -->
      <div class="card mb-6" v-if="store.modelData">
        <h2 class="font-semibold mb-4 flex items-center gap-2">
          <span>🤖</span> Model Performance
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-800 text-left">
                <th class="py-2 pr-4 text-gray-400 font-medium">Model</th>
                <th class="py-2 pr-4 text-gray-400 font-medium text-right">Calls</th>
                <th class="py-2 pr-4 text-gray-400 font-medium text-right">Total Tokens</th>
                <th class="py-2 pr-4 text-gray-400 font-medium text-right">Avg Latency</th>
                <th class="py-2 pr-4 text-gray-400 font-medium text-right">P95 Latency</th>
                <th class="py-2 text-gray-400 font-medium text-right">Error Rate</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800/50">
              <tr v-for="row in mergedModelRows" :key="row.model"
                class="hover:bg-gray-800/30 transition-colors">
                <td class="py-2.5 pr-4 font-medium">{{ row.model }}</td>
                <td class="py-2.5 pr-4 text-right text-gray-300">{{ row.calls.toLocaleString() }}</td>
                <td class="py-2.5 pr-4 text-right text-gray-300">{{ formatTokens(row.tokens) }}</td>
                <td class="py-2.5 pr-4 text-right" :class="latencyColor(row.avg)">{{ row.avg }}ms</td>
                <td class="py-2.5 pr-4 text-right" :class="latencyColor(row.p95)">{{ row.p95 }}ms</td>
                <td class="py-2.5 text-right" :class="row.errorRate > 5 ? 'text-red-400' : row.errorRate > 2 ? 'text-yellow-400' : 'text-green-400'">
                  {{ row.errorRate }}%
                </td>
              </tr>
              <tr v-if="mergedModelRows.length === 0">
                <td colspan="6" class="py-6 text-center text-gray-600">No data yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pricing Recommendations -->
      <div class="card mb-6" v-if="store.pricingRecs">
        <h2 class="font-semibold mb-2 flex items-center gap-2">
          <span>🎯</span> Pricing & Growth Recommendations
        </h2>
        <p class="text-gray-500 text-xs mb-4">Auto-generated based on your usage patterns</p>

        <!-- Summary strip -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div class="bg-gray-800 rounded-lg px-3 py-2 text-center">
            <div class="text-xs text-gray-500">ARPU</div>
            <div class="font-semibold">${{ store.pricingRecs.summary.arpu }}</div>
          </div>
          <div class="bg-gray-800 rounded-lg px-3 py-2 text-center">
            <div class="text-xs text-gray-500">Power Users</div>
            <div class="font-semibold text-yellow-400">{{ store.pricingRecs.summary.powerUsers }}</div>
          </div>
          <div class="bg-gray-800 rounded-lg px-3 py-2 text-center">
            <div class="text-xs text-gray-500">MoM Growth</div>
            <div :class="['font-semibold', store.pricingRecs.summary.momGrowth >= 0 ? 'text-green-400' : 'text-red-400']">
              {{ store.pricingRecs.summary.momGrowth >= 0 ? '+' : '' }}{{ store.pricingRecs.summary.momGrowth }}%
            </div>
          </div>
          <div class="bg-gray-800 rounded-lg px-3 py-2 text-center">
            <div class="text-xs text-gray-500">Est. Revenue</div>
            <div class="font-semibold text-green-400">${{ store.pricingRecs.summary.estimatedMonthlyRevenue }}</div>
          </div>
        </div>

        <!-- Recommendation cards -->
        <div class="space-y-3">
          <div v-for="rec in store.pricingRecs.recommendations" :key="rec.title"
            :class="['rounded-lg border p-4', priorityStyle(rec.priority)]">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span :class="['text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wide', priorityBadge(rec.priority)]">
                    {{ rec.priority }}
                  </span>
                  <span class="text-xs text-gray-500 uppercase tracking-wide">{{ rec.type }}</span>
                </div>
                <h3 class="font-medium text-sm">{{ rec.title }}</h3>
                <p class="text-gray-400 text-xs mt-1">{{ rec.detail }}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs text-gray-500">Est. impact</div>
                <div class="text-sm font-medium text-green-400">{{ rec.estimatedImpact }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Model margin table -->
      <div class="card" v-if="store.pricingRecs?.modelMargins?.length">
        <h2 class="font-semibold mb-4 flex items-center gap-2">
          <span>📈</span> Model Cost & Margin Analysis
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-800 text-left">
                <th class="py-2 pr-4 text-gray-400 font-medium">Model</th>
                <th class="py-2 pr-4 text-gray-400 font-medium text-right">Tokens Used</th>
                <th class="py-2 pr-4 text-gray-400 font-medium text-right">Est. Cost</th>
                <th class="py-2 pr-4 text-gray-400 font-medium text-right">Est. Revenue</th>
                <th class="py-2 text-gray-400 font-medium text-right">Margin</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800/50">
              <tr v-for="row in store.pricingRecs.modelMargins" :key="row.model"
                class="hover:bg-gray-800/30 transition-colors">
                <td class="py-2.5 pr-4 font-medium">{{ row.model }}</td>
                <td class="py-2.5 pr-4 text-right text-gray-300">{{ formatTokens(row.totalTokens) }}</td>
                <td class="py-2.5 pr-4 text-right text-red-400">${{ row.estimatedCost }}</td>
                <td class="py-2.5 pr-4 text-right text-green-400">${{ row.estimatedRevenue }}</td>
                <td class="py-2.5 text-right font-semibold"
                  :class="row.marginPercent > 0 ? 'text-green-400' : 'text-red-400'">
                  {{ row.marginPercent }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-gray-600 mt-3">
          * Margin based on $1.00/1M tokens blended average sell price. Actual margins vary by plan.
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useAnalyticsStore } from '../stores/analytics';
import KpiCard from '../components/KpiCard.vue';
import FunnelStep from '../components/FunnelStep.vue';

const store = useAnalyticsStore();

onMounted(() => store.fetchAll());

const formatTokens = (n: number) => {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

const maxHourlyCalls = computed(() =>
  store.hourly.reduce((m, b) => Math.max(m, b.calls), 1)
);
const maxHourlyBar = (calls: number) =>
  Math.max(4, Math.round((calls / maxHourlyCalls.value) * 88));

const mergedModelRows = computed(() => {
  if (!store.modelData) return [];
  const { byModel, errorRates, latency } = store.modelData;
  return Object.entries(byModel).map(([model, stats]) => {
    const err = errorRates.find(e => e.model === model);
    const lat = latency.find(l => l.model === model);
    return {
      model,
      calls: stats.calls,
      tokens: stats.input + stats.output,
      avg: lat?.avg || 0,
      p95: lat?.p95 || 0,
      errorRate: err?.errorRate || 0
    };
  }).sort((a, b) => b.calls - a.calls);
});

const latencyColor = (ms: number) =>
  ms < 1000 ? 'text-green-400' : ms < 2500 ? 'text-yellow-400' : 'text-red-400';

const priorityStyle = (p: string) =>
  p === 'high'
    ? 'border-red-800/60 bg-red-900/10'
    : p === 'medium'
    ? 'border-yellow-800/60 bg-yellow-900/10'
    : 'border-gray-700 bg-gray-800/30';

const priorityBadge = (p: string) =>
  p === 'high'
    ? 'bg-red-900 text-red-300'
    : p === 'medium'
    ? 'bg-yellow-900 text-yellow-300'
    : 'bg-gray-700 text-gray-400';
</script>
