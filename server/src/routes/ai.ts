import { Router } from 'express';
import { createLogger } from '../utils/logger';
import { deepseekService } from '../services/deepseek';
import { glmService } from '../services/glm';
import { kimService } from '../services/kimi';
import { authMiddleware } from '../middleware/auth';
import { billingMiddleware } from '../middleware/billing';
import { analyticsService } from '../services/analytics';

const router = Router();
const logger = createLogger('ai');

// Available models (kimi-k2 temporarily disabled - insufficient balance)
const MODELS = {
  'deepseek-v3': deepseekService,
  'deepseek-coder': deepseekService,
  'glm-4': glmService
  // 'kimi-k2': kimService  // ⚠️ Recharge Kimi account to re-enable
};

// Chat completion endpoint
router.post('/chat', authMiddleware, billingMiddleware, async (req, res) => {
  try {
    const { messages, model = 'deepseek-v3', temperature = 0.7, max_tokens } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const service = MODELS[model as keyof typeof MODELS];
    if (!service) {
      return res.status(400).json({ error: `Model ${model} not supported` });
    }

    logger.info(`Chat request`, { model, userId: req.user?.id });

    const startTime = Date.now();
    let success = true;

    const response = await service.chatCompletion({
      messages,
      temperature,
      max_tokens,
      model
    });

    const latencyMs = Date.now() - startTime;

    // Record token usage
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const totalTokens = inputTokens + outputTokens;

    // Analytics tracking
    analyticsService.trackUsage({
      userId: req.user?.id || 'anonymous',
      model,
      inputTokens,
      outputTokens,
      latencyMs,
      success
    });

    res.json({
      ...response,
      usage: {
        ...response.usage,
        total_tokens: totalTokens
      }
    });

  } catch (error: any) {
    logger.error('Chat completion error', { error: error.message });
    // Track failed call
    analyticsService.trackUsage({
      userId: req.user?.id || 'anonymous',
      model: req.body?.model || 'unknown',
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: 0,
      success: false
    });
    res.status(500).json({ error: 'Failed to generate completion' });
  }
});

// Stream chat completion
router.post('/chat/stream', authMiddleware, billingMiddleware, async (req, res) => {
  try {
    const { messages, model = 'deepseek-v3', temperature = 0.7 } = req.body;
    
    const service = MODELS[model as keyof typeof MODELS];
    if (!service) {
      return res.status(400).json({ error: `Model ${model} not supported` });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await service.chatCompletionStream({
      messages,
      temperature,
      model
    });

    stream.on('data', (chunk: any) => {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    });

    stream.on('end', () => {
      res.write('data: [DONE]\n\n');
      res.end();
    });

    stream.on('error', (error: any) => {
      logger.error('Stream error', { error: error.message });
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    });

  } catch (error: any) {
    logger.error('Stream chat error', { error: error.message });
    res.status(500).json({ error: 'Failed to start stream' });
  }
});

// Get available models
router.get('/models', (req, res) => {
  res.json({
    models: [
      { id: 'deepseek-v3', name: 'DeepSeek V3', description: 'General purpose — best for chat & reasoning', status: 'active', pricing: { input: 0.001, output: 0.002 } },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Code generation & debugging', status: 'active', pricing: { input: 0.001, output: 0.002 } },
      { id: 'glm-4', name: 'GLM-4', description: 'General purpose — strong Chinese & English', status: 'active', pricing: { input: 0.001, output: 0.002 } },
      { id: 'kimi-k2', name: 'Kimi K2', description: 'Long context (128k) — coming soon', status: 'maintenance', pricing: { input: 0.0015, output: 0.003 } }
    ]
  });
});

export { router as aiRouter };
