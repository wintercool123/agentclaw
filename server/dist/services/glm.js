"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.glmService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('glm');
const API_BASE = 'https://open.bigmodel.cn/api/paas/v4';
const API_KEY = process.env.GLM_API_KEY || '';
exports.glmService = {
    async chatCompletion(params) {
        try {
            const response = await axios_1.default.post(`${API_BASE}/chat/completions`, {
                model: 'glm-4',
                messages: params.messages,
                temperature: params.temperature,
                max_tokens: params.max_tokens
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            });
            return response.data;
        }
        catch (error) {
            logger.error('GLM API error', { error: error.message });
            throw new Error(`GLM API error: ${error.message}`);
        }
    },
    async chatCompletionStream(params) {
        try {
            const response = await axios_1.default.post(`${API_BASE}/chat/completions`, {
                model: 'glm-4',
                messages: params.messages,
                temperature: params.temperature,
                stream: true
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream',
                timeout: 120000
            });
            return response.data;
        }
        catch (error) {
            logger.error('GLM stream error', { error: error.message });
            throw new Error(`GLM stream error: ${error.message}`);
        }
    }
};
//# sourceMappingURL=glm.js.map