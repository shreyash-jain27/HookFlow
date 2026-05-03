const { Worker } = require('bullmq');
const axios = require('axios');
const crypto = require('crypto');
const connection = require('../queue/connection');
const EventLog = require('../models/EventLog');
const Event = require('../models/Event');
const Subscriber = require('../models/Subscriber');
const logger = require('../utils/logger');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'super_secret_key';

const processWebhook = async (job) => {
  const { eventId, eventType, payload } = job.data;
  const attemptCount = job.attemptsMade + 1;
  
  logger.info(`Starting delivery for event ${eventId}`, { attempt: attemptCount, eventType });

  try {
    // 1. Fetch all subscribers for this event type
    const subscribers = await Subscriber.find({ eventType }).lean();
    
    if (!subscribers.length) {
      logger.warn(`No subscribers found for ${eventType}`, { eventId });
      await Event.findOneAndUpdate({ eventId }, { status: 'success' });
      return;
    }

    // Construct final payload
    const finalPayload = {
      eventId,
      eventType,
      payload,
      timestamp: new Date().toISOString()
    };

    // 2. Generate HMAC Signature
    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(finalPayload))
      .digest('hex');

    // 3. Parallel Delivery Execution
    const deliveryPromises = subscribers.map(async (sub) => {
      const subscriberUrl = sub.url;
      const subscriberId = sub._id;
      
      let log = await EventLog.findOne({ eventId, subscriberId });
      
      // Idempotency: Skip if already succeeded
      if (log && log.status === 'success') return true;

      if (!log) {
        log = new EventLog({
          eventId,
          subscriberId,
          url: subscriberUrl,
          status: 'pending',
          attempts: 0
        });
      }

      log.attempts += 1;
      log.status = 'pending';
      await log.save();

      try {
        const response = await axios.post(subscriberUrl, finalPayload, {
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-signature': signature,
            'x-event-id': eventId
          },
          timeout: 5000 // production-level timeout
        });

        log.status = 'success';
        log.responseCode = response.status;
        log.deliveredAt = new Date();
        log.error = null;
        await log.save();

        logger.info(`Delivered ${eventId} to ${subscriberUrl}`, { subId: subscriberId });
        return true;

      } catch (error) {
        const responseCode = error.response ? error.response.status : null;
        const errorMessage = error.message; // Safe error logging

        log.status = 'failed';
        log.responseCode = responseCode;
        log.error = errorMessage;
        await log.save();

        logger.error(`Delivery failed for ${eventId} to ${subscriberUrl}`, { error: errorMessage });
        return false;
      }
    });

    const results = await Promise.allSettled(deliveryPromises);
    const allSuccess = results.every(res => res.status === 'fulfilled' && res.value === true);

    if (allSuccess) {
      await Event.findOneAndUpdate({ eventId }, { status: 'success' });
    } else {
      throw new Error(`One or more deliveries failed for event ${eventId}`);
    }

  } catch (err) {
    logger.error(`Worker error for event ${eventId}: ${err.message}`);
    throw err; // Re-throw for BullMQ retry logic
  }
};

const webhookWorker = new Worker('webhookQueue', processWebhook, { connection });

webhookWorker.on('failed', async (job, err) => {
  const attemptCount = job.attemptsMade;
  const maxAttempts = job.opts.attempts || 5;

  logger.error(`Job failed for event ${job.data.eventId}`, { attempt: attemptCount, error: err.message });

  if (attemptCount >= maxAttempts) {
    logger.crit(`Event ${job.data.eventId} permanently failed. Moving to DLQ.`);
    
    const dlqData = {
      eventId: job.data.eventId,
      eventType: job.data.eventType,
      payload: job.data.payload,
      error: err.message,
      failedAt: new Date()
    };

    await connection.lpush('deadLetterQueue', JSON.stringify(dlqData));
    await Event.findOneAndUpdate({ eventId: job.data.eventId }, { status: 'failed', retries: attemptCount });
  }
});

module.exports = webhookWorker;
