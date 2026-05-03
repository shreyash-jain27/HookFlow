const EventLog = require('../models/EventLog');
const logger = require('../utils/logger');

/**
 * Retrieves delivery logs with support for pagination and filtering.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    // Optional filtering
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.eventId) query.eventId = req.query.eventId;

    const logs = await EventLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await EventLog.countDocuments(query);

    return res.status(200).json({
      total,
      page,
      limit,
      logs
    });
  } catch (error) {
    logger.error('Error retrieving delivery logs', { error: error.message, query: req.query });
    return res.status(500).json({ error: 'Internal server error' });
  }
};
