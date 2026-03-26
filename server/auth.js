const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { runQuery, getQuery } = require('./database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'omnigames_super_secret_key_123';
const SALT_ROUNDS = 10;

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user exists
    const existing = await getQuery('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Insert new user
    await runQuery('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);
    
    // Auto-login the user
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ message: 'User created successfully', token, user: { username } });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await getQuery('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(401).json({ error: 'User not found. Please Sign Up first!' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ message: 'Login successful', token, user: { username: user.username } });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getQuery('SELECT username, created_at FROM users WHERE username = ?', [req.user.username]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
