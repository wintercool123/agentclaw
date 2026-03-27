import { Router, Request, Response } from 'express';
import { analyticsService } from '../services/analytics';
import { requireAuth } from '../middleware/auth';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('analytics-route');

// All analytics endpoints require auth (admin in production)
// For MVP we just require login

router.get('/overview', requireAuth, (_req: Request, res: Response) => {
  try {
    const revenue = analyticsService.getRevenueMetrics();
    const funnel = analyticsService.getFunnelMetrics();
    const dau = analyticsService.getActiveUsers('day');
    const wau = analyticsService.getActiveUsers('week');
    const mau = analyticsService.getActiveUsers('month');

    res.json({ revenue, funnel, activeUsers: { dau, wau, mau } });
  } catch (e: any) {
    logger.error('overview error', { error: e.message });
    res.status(500).json({ error: e.message });
  }
});

router.get('/models', requireAuth, (_req: Request, res: Response) => {
  try {
    const byModel = analyticsService.getTokensByModel(30);
    const errorRates = analyticsService.getErrorRate();
    const latency = analyticsService.getLatencyStats();
    res.json({ byModel, errorRates, latency });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/users/top', requireAuth, (_req: Request, res: Response) => {
  try {
    const topUsers = analyticsService.getTopUsers(20);
    res.json({ topUsers });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/hourly', requireAuth, (_req: Request, res: Response) => {
  try {
    const hourly = analyticsService.getHourlyUsage();
    res.json({ hourly });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Pricing recommendations based on usage data
router.get('/pricing/recommendations', requireAuth, (_req: Request, res: Response) => {
  try {
    const byModel = analyticsService.getTokensByModel(30);
    const revenue = analyticsService.getRevenueMetrics();
    const topUsers = analyticsService.getTopUsers(100);

    // Identify power users (potential upgrade targets)
    const powerUserThreshold = 500_000; // >500K tokens/month
    const powerUsers = topUsers.filter(u => u.tokens > powerUserThreshold);
    const heavyUsersOnFree = powerUsers.length; // proxy for "should upgrade"

    // Calculate average revenue per user
    const arpu = topUsers.length > 0
      ? +(topUsers.reduce((s, u) => s + u.revenue, 0) / topUsers.length).toFixed(4)
      : 0;

    // Model cost breakdown
    const modelCosts: Record<string, number> = {
      'deepseek-v3': 0.28 / 1_000_000,
      'deepseek-coder': 0.14 / 1_000_000,
      'glm-4': 0.36 / 1_000_000,
      'kimi-k2': 0.60 / 1_000_000
    };

    const modelMargins = Object.entries(byModel).map(([model, stats]) => {
      const totalTokens = stats.input + stats.output;
      const cost = totalTokens * (modelCosts[model] || 0.001);
      const revenue = (totalTokens / 1000) * 0.001;
      const margin = revenue > 0 ? +((revenue - cost) / revenue * 100).toFixed(1) : 0;
      return { model, totalTokens, estimatedCost: +cost.toFixed(4), estimatedRevenue: +revenue.toFixed(4), marginPercent: margin };
    });

    // Pricing recommendations
    const recommendations = [];

    if (heavyUsersOnFree > 5) {
      recommendations.push({
        type: 'upsell',
        priority: 'high',
        title: 'Target heavy free users for Starter upgrade',
        detail: `${heavyUsersOnFree} users are consuming >500K tokens — send them a targeted email with a 20% first-month discount.`,
        estimatedImpact: `+$${(heavyUsersOnFree * 9 * 0.4).toFixed(0)}/month`
      });
    }

    if (revenue.momGrowth < 10) {
      recommendations.push({
        type: 'pricing',
        priority: 'medium',
        title: 'Consider a "Top-up credits" option',
        detail: 'Monthly growth is slow. Add a one-time $5/$20/$50 credit top-up option to reduce friction for users who don\'t want subscriptions.',
        estimatedImpact: '+15% conversion'
      });
    }

    const deepseekShare = (byModel['deepseek-v3']?.calls || 0) + (byModel['deepseek-coder']?.calls || 0);
    const totalCalls = Object.values(byModel).reduce((s, v) => s + v.calls, 0);
    if (totalCalls > 0 && deepseekShare / totalCalls > 0.7) {
      recommendations.push({
        type: 'product',
        priority: 'medium',
        title: 'DeepSeek is dominant — market it harder',
        detail: `${Math.round(deepseekShare / totalCalls * 100)}% of calls use DeepSeek. Lead with "DeepSeek V3 API" in your PH post and SEO content.`,
        estimatedImpact: '+organic traffic'
      });
    }

    recommendations.push({
      type: 'retention',
      priority: 'low',
      title: 'Add email drip for inactive users (7+ days)',
      detail: 'Send a "Here\'s what you\'ve been missing" email with sample prompts and their cost savings.',
      estimatedImpact: '+10% reactivation'
    });

    res.json({
      summary: {
        arpu,
        powerUsers: heavyUsersOnFree,
        momGrowth: revenue.momGrowth,
        estimatedMonthlyRevenue: revenue.estimatedRevenue
      },
      modelMargins,
      recommendations
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export { router as analyticsRouter };
