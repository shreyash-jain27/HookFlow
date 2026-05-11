require('dotenv').config();
const mongoose = require('mongoose');


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hookflow';

async function startWorker() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`[Worker Entry] Connected to MongoDB at ${MONGODB_URI}`);
    
    
    const webhookWorker = require('./workers/webhookWorker');
    console.log('[Worker Entry] Webhook worker started.');
    
  } catch (error) {
    console.error('[Worker Entry] Failed to start worker:', error);
    process.exit(1);
  }
}

startWorker();
