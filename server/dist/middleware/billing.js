"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingMiddleware = void 0;
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('billing');
// Simple in-memory quota tracking (replace with Redis/DB in production)
const anonymousQuota = new Map();
const ANONYMOUS_LIMIT = 50000; // 50k tokens per IP per day
const billingMiddleware = async (req, res, next) => {
    try {
        const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
        if (!req.user) {
            // Anonymous user - check quota
            const used = anonymousQuota.get(clientIp) || 0;
            if (used >= ANONYMOUS_LIMIT) {
                return res.status(429).json({
                    error: 'Anonymous quota exceeded',
                    message: 'Please sign up for more tokens'
                });
            }
            // Attach quota tracker to request
            req.trackUsage = (tokens) => {
                anonymousQuota.set(clientIp, used + tokens);
            };
        }
        else {
            // Authenticated user - check balance from database
            // TODO: Implement database check
            req.trackUsage = () => { };
        }
        next();
    }
    catch (error) {
        logger.error('Billing middleware error', { error: error.message });
        next();
    }
};
exports.billingMiddleware = billingMiddleware;
//# sourceMappingURL=billing.js.map