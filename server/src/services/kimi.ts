import axios from 'axios';
import { createLogger } from '../utils/logger';

const logger = createLogger('kimi');

const API_BASE = 'https://api.moonshot.cn/v1';
const API_KEY = process.env.KIMI_API_KEY || '';

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

export const kimService = {
  async chatCompletion(params: ChatCompletionParams) {
    try {
      const response = await axios.post(
        `${API_BASE}/chat/completions`,
        {
          model: 'moonshot-v1-8k',
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
      logger.error('Kimi API error', { error: error.message });
      throw new Error(`Kimi API error: ${error.message}`);
    }
  },

  async chatCompletionStream(params: ChatCompletionParams) {
    try {
      const response = await axios.post(
        `${API_BASE}/chat/completions`,
        {
          model: 'moonshot-v1-8k',
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
      logger.error('Kimi stream error', { error: error.message });
      throw new Error(`Kimi stream error: ${error.message}`);
    }
  }
};
