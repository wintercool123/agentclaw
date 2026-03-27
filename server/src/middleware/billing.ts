import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';

const logger = createLogger('billing');

// Simple in-memory quota tracking (replace with Redis/DB in production)
const anonymousQuota: Map<string, number> = new Map();
const ANONYMOUS_LIMIT = 50000; // 50k tokens per IP per day

export const billingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
      (req as any).trackUsage = (tokens: number) => {
        anonymousQuota.set(clientIp, used + tokens);
      };
    } else {
      // Authenticated user - check balance from database
      // TODO: Implement database check
      (req as any).trackUsage = () => {};
    }

    next();
  } catch (error: any) {
    logger.error('Billing middleware error', { error: error.message });
    next();
  }
};
