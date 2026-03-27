import axios from 'axios';
import { createLogger } from '../utils/logger';

const logger = createLogger('glm');

const API_BASE = 'https://open.bigmodel.cn/api/paas/v4';
const API_KEY = process.env.GLM_API_KEY || '';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionParams {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  model: string;
}

export const glmService = {
  async chatCompletion(params: ChatCompletionParams) {
    try {
      const response = await axios.post(
        `${API_BASE}/chat/completions`,
        {
          model: 'glm-4',
          messages: params.messages,
          temperature: params.temperature,
          max_tokens: params.max_tokens
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('GLM API error', { error: error.message });
      throw new Error(`GLM API error: ${error.message}`);
    }
  },

  async chatCompletionStream(params: ChatCompletionParams) {
    try {
      const response = await axios.post(
        `${API_BASE}/chat/completions`,
        {
          model: 'glm-4',
          messages: params.messages,
          temperature: params.temperature,
          stream: true
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream',
          timeout: 120000
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('GLM stream error', { error: error.message });
      throw new Error(`GLM stream error: ${error.message}`);
    }
  }
};
