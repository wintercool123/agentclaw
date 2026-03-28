import axios from 'axios';
import { createLogger } from '../utils/logger';

const logger = createLogger('deepseek');

const API_BASE = 'https://api.deepseek.com/v1';
const API_KEY = process.env.DEEPSEEK_API_KEY || '';

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

export const deepseekService = {
  async chatCompletion(params: ChatCompletionParams) {
    try {
      const response = await axios.post(
        `${API_BASE}/chat/completions`,
        {
          model: params.model === 'deepseek-coder' ? 'deepseek-coder' : 'deepseek-chat',
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
      logger.error('DeepSeek API error', { error: error.message });
      throw new Error(`DeepSeek API error: ${error.message}`);
    }
  },

  async chatCompletionStream(params: ChatCompletionParams) {
    try {
      const response = await axios.post(
        `${API_BASE}/chat/completions`,
        {
          model: params.model === 'deepseek-coder' ? 'deepseek-coder' : 'deepseek-chat',
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
      logger.error('DeepSeek stream error', { error: error.message });
      throw new Error(`DeepSeek stream error: ${error.message}`);
    }
  }
};
