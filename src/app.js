const express = require('express');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

const app = express();


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many requests, please try again later.' }
});


app.use(limiter);


app.use(express.json());


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.use('/api', routes);


app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});


app.use((err, req, res, next) => {
  console.error('[App] Global Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
