import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export interface OverviewData {
  revenue: {
    thisMonthTokens: number;
    estimatedRevenue: number;
    momGrowth: number;
  };
  funnel: {
    visitors: number;
    signups: number;
    firstCalls: number;
    paidConversions: number;
    visitorToSignup: number;
    signupToActivation: number;
    activationToPaid: number;
  };
  activeUsers: { dau: number; wau: number; mau: number };
}

export interface ModelData {
  byModel: Record<string, { input: number; output: number; calls: number }>;
  errorRates: { model: string; total: number; errors: number; errorRate: number }[];
  latency: { model: string; avg: number; p50: number; p95: number; samples: number }[];
}

export interface PricingRec {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  estimatedImpact: string;
}

export const useAnalyticsStore = defineStore('analytics', () => {
  const overview = ref<OverviewData | null>(null);
  const modelData = ref<ModelData | null>(null);
  const topUsers = ref<{ userId: string; tokens: number; calls: number; revenue: number }[]>([]);
  const hourly = ref<{ hour: number; calls: number; tokens: number }[]>([]);
  const pricingRecs = ref<{ recommendations: PricingRec[]; summary: any; modelMargins: any[] } | null>(null);
  const loading = ref(false);
  const error = ref('');

  const fetchAll = async () => {
    loading.value = true;
    error.value = '';
    try {
      const [ov, md, tu, hr, pr] = await Promise.all([
        axios.get('/api/analytics/overview'),
        axios.get('/api/analytics/models'),
        axios.get('/api/analytics/users/top'),
        axios.get('/api/analytics/hourly'),
        axios.get('/api/analytics/pricing/recommendations')
      ]);
      overview.value = ov.data;
      modelData.value = md.data;
      topUsers.value = tu.data.topUsers;
      hourly.value = hr.data.hourly;
      pricingRecs.value = pr.data;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  return { overview, modelData, topUsers, hourly, pricingRecs, loading, error, fetchAll };
});
