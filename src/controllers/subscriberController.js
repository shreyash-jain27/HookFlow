const Subscriber = require('../models/Subscriber');
const logger = require('../utils/logger');

/**
 * HookFlow Subscriber Controller
 */

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

// POST /api/subscribers
exports.subscribe = async (req, res) => {
  try {
    const { url, eventType } = req.body;

    if (!url || !eventType) {
      return res.status(400).json({ error: 'url and eventType are required' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    let subscriber = await Subscriber.findOne({ url, eventType });

    if (subscriber) {
      logger.debug('Subscriber already exists', { url, eventType });
      return res.status(200).json({ 
        message: 'Already subscribed',
        subscriber 
      });
    }

    subscriber = new Subscriber({ url, eventType });
    await subscriber.save();

    logger.info('New subscription created', { url, eventType });

    return res.status(201).json({
      message: 'Successfully subscribed',
      subscriber
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ error: 'Already subscribed' });
    }
    logger.error('Error in subscriber registration', { error: error.message, body: req.body });
    return res.status(500).json({ error: 'Internal server error' });
  }
};
