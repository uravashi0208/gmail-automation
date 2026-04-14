'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes      = require('./routes/auth');
const rulesRoutes     = require('./routes/rules');
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes        = require('./routes/ai');

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

const app = express();

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',      authRoutes);
app.use('/api/rules',     rulesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai',        aiRoutes);

app.get('/', (_req, res) => res.json({ status: 'ok' }));

module.exports = app;
