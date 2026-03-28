"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = void 0;
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('analytics');
// In-memory store (replace with TimescaleDB / ClickHouse in production)
const events = [];
const usageRecords = [];
exports.analyticsService = {
    // Track a generic event
    track(event) {
        const record = { ...event, timestamp: new Date() };
        events.push(record);
        logger.debug('Event tracked', { eventType: event.eventType, userId: event.userId });
        // Trim to last 10k events to avoid memory leak
        if (events.length > 10000)
            events.splice(0, events.length - 10000);
    },
    // Track API usage (billed events)
    trackUsage(record) {
        const entry = { ...record, timestamp: new Date() };
        usageRecords.push(entry);
        if (usageRecords.length > 50000)
            usageRecords.splice(0, usageRecords.length - 50000);
    },
    // ---------- Aggregate queries ----------
    // Total tokens by model (last N days)
    getTokensByModel(days = 30) {
        const since = new Date(Date.now() - days * 86400000);
        const result = {};
        for (const r of usageRecords) {
            if (r.timestamp < since)
                continue;
            if (!result[r.model])
                result[r.model] = { input: 0, output: 0, calls: 0 };
            result[r.model].input += r.inputTokens;
            result[r.model].output += r.outputTokens;
            result[r.model].calls += 1;
        }
        return result;
    },
    // DAU / WAU / MAU
    getActiveUsers(period = 'day') {
        const ms = period === 'day' ? 86400000 : period === 'week' ? 604800000 : 2592000000;
        const since = new Date(Date.now() - ms);
        const users = new Set(usageRecords.filter(r => r.timestamp >= since && r.userId).map(r => r.userId));
        return users.size;
    },
    // Token usage per user (top N)
    getTopUsers(limit = 20) {
        const map = {};
        for (const r of usageRecords) {
            if (!r.userId)
                continue;
            if (!map[r.userId])
                map[r.userId] = { tokens: 0, calls: 0, revenue: 0 };
            const total = r.inputTokens + r.outputTokens;
            map[r.userId].tokens += total;
            map[r.userId].calls += 1;
            // $0.001 per 1K tokens approximation
            map[r.userId].revenue += (total / 1000) * 0.001;
        }
        return Object.entries(map)
            .map(([userId, stats]) => ({ userId, ...stats }))
            .sort((a, b) => b.tokens - a.tokens)
            .slice(0, limit);
    },
    // Error rate by model
    getErrorRate() {
        const map = {};
        for (const r of usageRecords) {
            if (!map[r.model])
                map[r.model] = { total: 0, errors: 0 };
            map[r.model].total += 1;
            if (!r.success)
                map[r.model].errors += 1;
        }
        return Object.entries(map).map(([model, s]) => ({
            model,
            total: s.total,
            errors: s.errors,
            errorRate: s.total > 0 ? +(s.errors / s.total * 100).toFixed(2) : 0
        }));
    },
    // Average latency by model
    getLatencyStats() {
        const map = {};
        for (const r of usageRecords) {
            if (!map[r.model])
                map[r.model] = [];
            map[r.model].push(r.latencyMs);
        }
        return Object.entries(map).map(([model, lats]) => {
            lats.sort((a, b) => a - b);
            const avg = lats.reduce((s, v) => s + v, 0) / lats.length;
            const p50 = lats[Math.floor(lats.length * 0.5)] || 0;
            const p95 = lats[Math.floor(lats.length * 0.95)] || 0;
            return { model, avg: +avg.toFixed(0), p50, p95, samples: lats.length };
        });
    },
    // Revenue estimation (MRR proxy)
    getRevenueMetrics() {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonthTokens = usageRecords
            .filter(r => r.timestamp >= monthStart)
            .reduce((s, r) => s + r.inputTokens + r.outputTokens, 0);
        const lastMonthTokens = usageRecords
            .filter(r => r.timestamp >= lastMonthStart && r.timestamp < monthStart)
            .reduce((s, r) => s + r.inputTokens + r.outputTokens, 0);
        const tokenRevenue = (thisMonthTokens / 1000000) * 1.0; // $1 per 1M tokens markup
        const momGrowth = lastMonthTokens > 0
            ? +((thisMonthTokens - lastMonthTokens) / lastMonthTokens * 100).toFixed(1)
            : 0;
        return {
            thisMonthTokens,
            lastMonthTokens,
            estimatedRevenue: +tokenRevenue.toFixed(2),
            momGrowth
        };
    },
    // Hourly usage (last 24h) — for heatmap
    getHourlyUsage() {
        const buckets = Array.from({ length: 24 }, (_, i) => ({ hour: i, calls: 0, tokens: 0 }));
        const since = new Date(Date.now() - 86400000);
        for (const r of usageRecords) {
            if (r.timestamp < since)
                continue;
            const h = r.timestamp.getHours();
            buckets[h].calls += 1;
            buckets[h].tokens += r.inputTokens + r.outputTokens;
        }
        return buckets;
    },
    // Conversion funnel
    getFunnelMetrics() {
        const visitors = events.filter(e => e.eventType === 'page_view').length;
        const signups = events.filter(e => e.eventType === 'user_registered').length;
        const firstCalls = events.filter(e => e.eventType === 'first_api_call').length;
        const paidConversions = events.filter(e => e.eventType === 'subscription_created').length;
        return {
            visitors,
            signups,
            firstCalls,
            paidConversions,
            visitorToSignup: visitors > 0 ? +(signups / visitors * 100).toFixed(1) : 0,
            signupToActivation: signups > 0 ? +(firstCalls / signups * 100).toFixed(1) : 0,
            activationToPaid: firstCalls > 0 ? +(paidConversions / firstCalls * 100).toFixed(1) : 0
        };
    },
    // Seed demo data for development
    seedDemoData() {
        const models = ['deepseek-v3', 'deepseek-coder', 'glm-4', 'kimi-k2'];
        const userIds = Array.from({ length: 40 }, (_, i) => `user_demo_${i}`);
        const now = Date.now();
        // Generate 30 days of usage
        for (let i = 0; i < 2000; i++) {
            const daysAgo = Math.random() * 30;
            const ts = new Date(now - daysAgo * 86400000);
            const model = models[Math.floor(Math.random() * models.length)];
            const userId = userIds[Math.floor(Math.random() * userIds.length)];
            usageRecords.push({
                userId,
                model,
                inputTokens: Math.floor(Math.random() * 2000) + 100,
                outputTokens: Math.floor(Math.random() * 1000) + 50,
                latencyMs: Math.floor(Math.random() * 3000) + 300,
                success: Math.random() > 0.03,
                timestamp: ts
            });
        }
        // Funnel events
        const eventTypes = ['page_view', 'page_view', 'page_view', 'user_registered', 'first_api_call', 'subscription_created'];
        for (let i = 0; i < 500; i++) {
            events.push({
                eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
                userId: Math.random() > 0.5 ? userIds[Math.floor(Math.random() * userIds.length)] : undefined,
                timestamp: new Date(now - Math.random() * 30 * 86400000)
            });
        }
        logger.info('Demo analytics data seeded');
    }
};
// Auto-seed in development
if (process.env.NODE_ENV !== 'production') {
    exports.analyticsService.seedDemoData();
}
//# sourceMappingURL=analytics.js.map