require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const { startScheduler } = require('./services/scheduler');
const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { });
    console.log('Connected to MongoDB');

    // start express app
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    // start scheduler (background)
    startScheduler();

  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
