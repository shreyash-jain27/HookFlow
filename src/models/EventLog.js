const mongoose = require('mongoose');

/**
 * @typedef {Object} EventLog
 * @property {string} eventId - Unique identifier for the event
 * @property {mongoose.Types.ObjectId} subscriberId - Reference to the subscriber
 * @property {string} [url] - Target URL for the webhook
 * @property {string} status - Delivery status (pending, success, failed)
 * @property {number} attempts - Number of delivery attempts made
 * @property {number} [responseCode] - HTTP status code received from the destination
 * @property {string} [error] - Error message if delivery failed
 * @property {Date} deliveredAt - Timestamp of the last delivery attempt
 */
const eventLogSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    index: true
  },
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscriber',
    required: true,
    index: true
  },
  url: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  responseCode: {
    type: Number
  },
  error: {
    type: String
  },
  deliveredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EventLog', eventLogSchema);
