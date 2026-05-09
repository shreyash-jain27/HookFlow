const mongoose = require('mongoose');


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
