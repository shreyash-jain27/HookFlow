require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const logger = require('./utils/logger');

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hookflow';

async function startServer() {
  try {
    
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB', { uri: MONGODB_URI });

    
    app.listen(PORT, () => {
      logger.info(`HookFlow API listening on port ${PORT}`);
      
      // Start the worker in the same process for simplified deployment (e.g., Render Free Tier)
      require('./workers/webhookWorker');
      logger.info('Webhook Worker started within API process');
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();
