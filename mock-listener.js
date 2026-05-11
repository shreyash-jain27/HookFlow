const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  console.log('--- MOCK WEBHOOK RECEIVED ---');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Payload:', JSON.stringify(req.body, null, 2));
  res.status(200).send('OK');
});

app.listen(4000, () => {
  console.log('Mock listener running on port 4000');
});
