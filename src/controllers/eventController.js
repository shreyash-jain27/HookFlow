const { v4: uuidv4 } = require('uuid');
const Subscriber = require('../models/Subscriber');
const Event = require('../models/Event');
const EventLog = require('../models/EventLog');
const webhookQueue = require('../queue/webhookQueue');
const logger = require('../utils/logger');
const connection = require('../queue/connection');

/**
 * HookFlow Controller: Handles event ingestion and delivery status.
 */

// POST /api/events
exports.receiveEvent = async (req, res) => {
  try {
    const { eventType, payload } = req.body;
    const idempotencyKey = req.headers['x-idempotency-key'];

    if (!eventType || !payload) {
      return res.status(400).json({ error: 'eventType and payload are required' });
    }

    if (typeof payload !== 'object' || Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'payload must be a non-empty object' });
    }

    if (idempotencyKey) {
      const existingEvent = await Event.findOne({ idempotencyKey });
      if (existingEvent) {
        return res.status(200).json({ 
          message: 'Duplicate event ignored',
          eventId: existingEvent.eventId
        });
      }
    }

    const eventId = uuidv4();
    const newEvent = new Event({
      eventId,
      idempotencyKey,
      eventType,
      payload
    });

    await newEvent.save();

    await webhookQueue.add('process-event', {
      eventId,
      eventType,
      payload
    });

    return res.status(202).json({
      message: 'Event accepted',
      eventId
    });

  } catch (error) {
    logger.error('Error in receiveEvent', { error: error.message, body: req.body });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/events/:eventId
exports.getEventStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const logs = await EventLog.find({ eventId }).sort({ deliveredAt: -1 });
    
    let status = 'pending';
    if (logs.length > 0) {
      const hasSuccess = logs.some(l => l.status === 'success');
      status = hasSuccess ? 'success' : 'failed';
    }

    return res.status(200).json({
      eventId,
      status,
      deliveries: logs.length,
      logs: logs.map(l => ({
        url: l.url,
        status: l.status,
        responseCode: l.responseCode,
        error: l.error,
        deliveredAt: l.deliveredAt
      }))
    });
  } catch (error) {
    logger.error('Error in getEventStatus', { error: error.message, eventId: req.params.eventId });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/dlq
exports.getDeadLetterQueue = async (req, res) => {
  try {
    const failedJobs = await connection.lrange('deadLetterQueue', 0, -1);
    const parsedJobs = failedJobs.map(job => JSON.parse(job));

    return res.status(200).json({
      total: parsedJobs.length,
      jobs: parsedJobs
    });
  } catch (error) {
    logger.error('Error in getDeadLetterQueue', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
};
