"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./utils/logger");
const ai_1 = require("./routes/ai");
const auth_1 = require("./routes/auth");
const billing_1 = require("./routes/billing");
const analytics_1 = require("./routes/analytics");
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const logger = (0, logger_1.createLogger)('server');
const PORT = process.env.PORT || 3001;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/ai', ai_1.aiRouter);
app.use('/api/auth', auth_1.authRouter);
app.use('/api/billing', billing_1.billingRouter);
app.use('/api/analytics', analytics_1.analyticsRouter);
// Error handling
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map