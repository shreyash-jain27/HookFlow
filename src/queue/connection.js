const Redis = require('ioredis');
const logger = require('../utils/logger');
require('dotenv').config();

/**
 * Redis Connection Configuration
 * Optimized for BullMQ and compatible with Upstash/Cloud Redis.
 */

const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  maxRetriesPerRequest: null, // Critical for BullMQ
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  }
};

const connection = new Redis(redisOptions);

connection.on('connect', () => {
  logger.info('Redis connection established');
});

connection.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message });
});

connection.on('close', () => {
  logger.warn('Redis connection closed');
});

module.exports = connection;
