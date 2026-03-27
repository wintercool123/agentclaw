"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kimService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('kimi');
const API_BASE = 'https://api.moonshot.cn/v1';
const API_KEY = process.env.KIMI_API_KEY || '';
exports.kimService = {
    async chatCompletion(params) {
        try {
            const response = await axios_1.default.post(`${API_BASE}/chat/completions`, {
                model: 'moonshot-v1-8k',
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
            logger.error('Kimi API error', { error: error.message });
            throw new Error(`Kimi API error: ${error.message}`);
        }
    },
    async chatCompletionStream(params) {
        try {
            const response = await axios_1.default.post(`${API_BASE}/chat/completions`, {
                model: 'moonshot-v1-8k',
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
            logger.error('Kimi stream error', { error: error.message });
            throw new Error(`Kimi stream error: ${error.message}`);
        }
    }
};
//# sourceMappingURL=kimi.js.map