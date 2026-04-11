'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const { startScheduler } = require('./services/scheduler');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

    startScheduler();
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
