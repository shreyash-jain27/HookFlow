const mongoose = require('mongoose');


const subscriberSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  eventType: {
    type: String,
    required: true,
    index: true, 
    trim: true
  }
}, {
  timestamps: true
});


subscriberSchema.index({ url: 1, eventType: 1 }, { unique: true });

module.exports = mongoose.model('Subscriber', subscriberSchema);
