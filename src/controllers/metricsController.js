const Event = require('../models/Event');
const EventLog = require('../models/EventLog');
const Subscriber = require('../models/Subscriber');
const webhookQueue = require('../queue/webhookQueue');
const logger = require('../utils/logger');

exports.getMetrics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalSubscribers = await Subscriber.countDocuments();
    
    // Aggregated stats from logs
    const successLogs = await EventLog.countDocuments({ status: 'success' });
    const failedLogs = await EventLog.countDocuments({ status: 'failed' });
    const totalDeliveries = await EventLog.countDocuments();
    
    const totalAttemptsAgg = await EventLog.aggregate([
      { $group: { _id: null, total: { $sum: '$attempts' } } }
    ]);
    const totalAttempts = totalAttemptsAgg.length > 0 ? totalAttemptsAgg[0].total : 0;
    const avgAttempts = totalDeliveries > 0 ? (totalAttempts / totalDeliveries).toFixed(2) : 0;
    
    const successRate = totalDeliveries > 0 ? ((successLogs / totalDeliveries) * 100).toFixed(2) : 0;

    // Queue stats
    const jobCounts = await webhookQueue.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed');

    const mem = process.memoryUsage();
    const formattedMemory = {
      rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`
    };

    return res.status(200).json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      system: {
        uptime: `${Math.floor(process.uptime())} seconds`,
        memoryUsage: formattedMemory
      },
      database: {
        totalEvents,
        totalSubscribers,
        deliveryStats: {
          totalDeliveries,
          success: successLogs,
          failed: failedLogs,
          successRate: `${successRate}%`,
          avgAttemptsPerEvent: avgAttempts
        }
      },
      queue: jobCounts
    });
  } catch (error) {
    logger.error('Error fetching metrics', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
};
