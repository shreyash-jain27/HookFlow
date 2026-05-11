const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HookFlow API Documentation',
      version: '1.0.0',
      description: 'The complete API reference for HookFlow Webhook Delivery System',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
      {
        url: 'https://hookflow-2zxk.onrender.com',
        description: 'Production server',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/app.js'], 
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
