"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
exports.authRouter = router;
const logger = (0, logger_1.createLogger)('auth');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// In-memory user store (replace with PostgreSQL in production)
const users = new Map();
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        if (users.has(email)) {
            return res.status(409).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const userId = `user_${Date.now()}`;
        users.set(email, {
            id: userId,
            email,
            password: hashedPassword,
            balance: 100000, // 100k free tokens on signup
            createdAt: new Date()
        });
        const token = jsonwebtoken_1.default.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
        logger.info('User registered', { email });
        res.json({
            token,
            user: { id: userId, email, balance: 100000 },
            message: 'Welcome! You have 100,000 free tokens'
        });
    }
    catch (error) {
        logger.error('Register error', { error: error.message });
        res.status(500).json({ error: 'Registration failed' });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        const user = users.get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: { id: user.id, email, balance: user.balance }
        });
    }
    catch (error) {
        logger.error('Login error', { error: error.message });
        res.status(500).json({ error: 'Login failed' });
    }
});
// Get current user
router.get('/me', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = [...users.values()].find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({
        id: user.id,
        email: user.email,
        balance: user.balance
    });
});
//# sourceMappingURL=auth.js.map