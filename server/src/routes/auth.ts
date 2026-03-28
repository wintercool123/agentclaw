import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('auth');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory user store (replace with PostgreSQL in production)
const users: Map<string, any> = new Map();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (users.has(email)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}`;
    
    users.set(email, {
      id: userId,
      email,
      password: hashedPassword,
      balance: 100000, // 100k free tokens on signup
      createdAt: new Date()
    });

    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
    
    logger.info('User registered', { email });

    res.json({
      token,
      user: { id: userId, email, balance: 100000 },
      message: 'Welcome! You have 100,000 free tokens'
    });

  } catch (error: any) {
    logger.error('Register error', { error: error.message });
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, email, balance: user.balance }
    });

  } catch (error: any) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const user = [...users.values()].find(u => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ 
    id: user.id, 
    email: user.email, 
    balance: user.balance 
  });
});

export { router as authRouter };
