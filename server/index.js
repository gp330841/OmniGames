const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');
const port = process.env.PORT || 3001;

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Platform API is up and running!' });
});

// Use our dedicated auth routes underneath /api/auth
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`[+] Server running horizontally on http://localhost:${port}`);
});
