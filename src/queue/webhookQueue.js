const { Queue } = require('bullmq');
const connection = require('./connection');


const webhookQueue = new Queue('webhookQueue', { 
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000 
    },
    removeOnComplete: true,
    removeOnFail: false 
  }
});

module.exports = webhookQueue;
