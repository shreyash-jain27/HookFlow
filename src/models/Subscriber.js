const mongoose = require('mongoose');

/**
 * @typedef {Object} Subscriber
 * @property {string} url - The callback URL for the webhook
 * @property {string} eventType - The type of event the subscriber is interested in
 */
const subscriberSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  eventType: {
    type: String,
    required: true,
    index: true, // index for fast queries based on event type
    trim: true
  }
}, {
  timestamps: true
});

// A subscriber shouldn't subscribe to the same event type more than once with the same URL
subscriberSchema.index({ url: 1, eventType: 1 }, { unique: true });

module.exports = mongoose.model('Subscriber', subscriberSchema);
