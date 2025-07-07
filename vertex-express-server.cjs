const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const xml2js = {
  parseStringPromise: (...args) => import('xml2js').then(mod => mod.parseStringPromise(...args))
};

const app = express();
const port = process.env.PORT || 3001;

// Use environment variable for frontend base URL (set FRONTEND_BASE_URL in your .env)
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
app.use(cors({
  origin: FRONTEND_BASE_URL,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// Explicitly handle preflight requests for the endpoint
app.options('/api/vertexChat', cors({
  origin: FRONTEND_BASE_URL,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.use(bodyParser.json());

const vertexAi = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: 'us-central1',
});

app.post('/api/vertexChat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  try {
    const model = vertexAi.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: message }] }],
    });
    console.log('Vertex AI raw response:', JSON.stringify(result, null, 2));
    const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, no response.';
    res.status(200).json({ content: text, raw: result });
  } catch (error) {
    console.error('Vertex AI error:', error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object') {
      try {
        errorMessage = JSON.stringify(error);
      } catch {}
    }
    res.status(500).json({ error: 'Vertex AI error', details: errorMessage });
  }
});

app.post('/api/givvableCerts', async (req, res) => {
  const { name } = req.body;
  const apiKey = '657c14ade3894d9c8da3a5553ee1efce';
  const url = `https://api.givvable.com/v1/companies/search?name=${encodeURIComponent(name)}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      // Givvable API is down or unavailable
      return res.status(200).json({ error: 'GivvableCert API is not available for /api/givvableCerts' });
    }
    const text = await response.text();
    console.log('Givvable raw response:', text);
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(200).json({ error: 'Givvable did not return JSON', raw: text });
    }
    res.json(data);
  } catch (err) {
    console.error('Givvable fetch error:', err);
    res.status(200).json({ error: 'GivvableCert API is not available for /api/givvableCerts' });
  }
});

app.listen(port, () => {
  console.log(`Express Vertex AI server running on http://localhost:${port}`);
});
