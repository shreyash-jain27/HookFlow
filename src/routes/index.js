const express = require('express');
const subscriberController = require('../controllers/subscriberController');
const eventController = require('../controllers/eventController');
const logController = require('../controllers/logController');
const metricsController = require('../controllers/metricsController');

const router = express.Router();


router.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));


router.get('/metrics', metricsController.getMetrics);


router.post('/subscribers', subscriberController.subscribe);


router.post('/events', eventController.receiveEvent);
router.get('/events/:eventId', eventController.getEventStatus);
router.get('/dead', eventController.getDeadLetterQueue);


router.get('/logs', logController.getLogs);

module.exports = router;
