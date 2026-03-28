export interface AnalyticsEvent {
    eventType: string;
    userId?: string;
    sessionId?: string;
    ip?: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}
export interface UsageRecord {
    userId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    success: boolean;
    timestamp: Date;
}
export declare const analyticsService: {
    track(event: Omit<AnalyticsEvent, "timestamp">): void;
    trackUsage(record: Omit<UsageRecord, "timestamp">): void;
    getTokensByModel(days?: number): Record<string, {
        input: number;
        output: number;
        calls: number;
    }>;
    getActiveUsers(period?: "day" | "week" | "month"): number;
    getTopUsers(limit?: number): {
        tokens: number;
        calls: number;
        revenue: number;
        userId: string;
    }[];
    getErrorRate(): {
        model: string;
        total: number;
        errors: number;
        errorRate: number;
    }[];
    getLatencyStats(): {
        model: string;
        avg: number;
        p50: number;
        p95: number;
        samples: number;
    }[];
    getRevenueMetrics(): {
        thisMonthTokens: number;
        lastMonthTokens: number;
        estimatedRevenue: number;
        momGrowth: number;
    };
    getHourlyUsage(): {
        hour: number;
        calls: number;
        tokens: number;
    }[];
    getFunnelMetrics(): {
        visitors: number;
        signups: number;
        firstCalls: number;
        paidConversions: number;
        visitorToSignup: number;
        signupToActivation: number;
        activationToPaid: number;
    };
    seedDemoData(): void;
};
//# sourceMappingURL=analytics.d.ts.map