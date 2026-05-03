const { Queue } = require('bullmq');
const connection = require('./connection');

/**
 * BullMQ Queue instance for managing webhook delivery jobs.
 * Configured with exponential backoff and 5 retry attempts.
 */
const webhookQueue = new Queue('webhookQueue', { 
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000 // 5s, 10s, 20s, 40s, 80s
    },
    removeOnComplete: true,
    removeOnFail: false // keep failed jobs in BullMQ to handle 'failed' event and metrics tracking
  }
});

module.exports = webhookQueue;
