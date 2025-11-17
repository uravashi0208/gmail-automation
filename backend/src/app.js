const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const rulesRoutes = require('./routes/rules');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000","https://gmail-automation-frontend.onrender.com"], credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
