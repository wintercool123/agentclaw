import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('billing');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

// Pricing plans
const PLANS = {
  starter: {
    name: 'Starter',
    price: 900, // $9.00
    tokens: 1000000, // 1M tokens
    priceId: process.env.STRIPE_STARTER_PRICE_ID
  },
  pro: {
    name: 'Pro',
    price: 2900, // $29.00
    tokens: 5000000, // 5M tokens
    priceId: process.env.STRIPE_PRO_PRICE_ID
  },
  team: {
    name: 'Team',
    price: 9900, // $99.00
    tokens: -1, // Unlimited
    priceId: process.env.STRIPE_TEAM_PRICE_ID
  }
};

// Get plans
router.get('/plans', (req: Request, res: Response) => {
  res.json({ plans: PLANS });
});

// Create checkout session
router.post('/checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    const planData = PLANS[plan as keyof typeof PLANS];
    
    if (!planData) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: planData.priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/billing/cancel`,
      metadata: {
        userId: req.user!.id,
        plan
      }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    logger.error('Checkout error', { error: error.message });
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Stripe webhook
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        logger.info('Payment successful', { userId: session.metadata?.userId });
        // TODO: Update user balance in database
        break;
      case 'customer.subscription.deleted':
        logger.info('Subscription cancelled', { subscription: event.data.object });
        break;
    }

    res.json({ received: true });
  } catch (error: any) {
    logger.error('Webhook error', { error: error.message });
    res.status(400).json({ error: error.message });
  }
});

export { router as billingRouter };
