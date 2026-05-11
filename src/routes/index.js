const express = require('express');
const subscriberController = require('../controllers/subscriberController');
const eventController = require('../controllers/eventController');
const logController = require('../controllers/logController');
const metricsController = require('../controllers/metricsController');

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Returns the status of the API
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: System metrics
 *     description: Get real-time delivery statistics and system health
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/metrics', metricsController.getMetrics);

/**
 * @swagger
 * /api/subscribers:
 *   post:
 *     summary: Register a subscriber
 *     description: Register a new webhook listener URL for a specific event type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - eventType
 *             properties:
 *               url:
 *                 type: string
 *               eventType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully subscribed
 */
router.post('/subscribers', subscriberController.subscribe);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Trigger an event
 *     description: Receive an event and queue it for delivery to subscribers
 *     parameters:
 *       - in: header
 *         name: x-idempotency-key
 *         schema:
 *           type: string
 *         description: Unique key to prevent duplicate processing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *               - payload
 *             properties:
 *               eventType:
 *                 type: string
 *               payload:
 *                 type: object
 *     responses:
 *       202:
 *         description: Event accepted
 */
router.post('/events', eventController.receiveEvent);

/**
 * @swagger
 * /api/events/{eventId}:
 *   get:
 *     summary: Get event status
 *     description: Track the delivery status of a specific event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/events/:eventId', eventController.getEventStatus);

/**
 * @swagger
 * /api/dead:
 *   get:
 *     summary: View DLQ
 *     description: View jobs in the Dead Letter Queue
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/dead', eventController.getDeadLetterQueue);

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Get delivery logs
 *     description: Retrieve logs of all webhook deliveries
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/logs', logController.getLogs);

module.exports = router;
