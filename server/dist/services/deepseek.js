"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepseekService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('deepseek');
const API_BASE = 'https://api.deepseek.com/v1';
const API_KEY = process.env.DEEPSEEK_API_KEY || '';
exports.deepseekService = {
    async chatCompletion(params) {
        try {
            const response = await axios_1.default.post(`${API_BASE}/chat/completions`, {
                model: params.model === 'deepseek-coder' ? 'deepseek-coder' : 'deepseek-chat',
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
            logger.error('DeepSeek API error', { error: error.message });
            throw new Error(`DeepSeek API error: ${error.message}`);
        }
    },
    async chatCompletionStream(params) {
        try {
            const response = await axios_1.default.post(`${API_BASE}/chat/completions`, {
                model: params.model === 'deepseek-coder' ? 'deepseek-coder' : 'deepseek-chat',
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
            logger.error('DeepSeek stream error', { error: error.message });
            throw new Error(`DeepSeek stream error: ${error.message}`);
        }
    }
};
//# sourceMappingURL=deepseek.js.map