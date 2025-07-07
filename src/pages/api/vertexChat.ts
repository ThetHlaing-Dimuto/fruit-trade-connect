import type { NextApiRequest, NextApiResponse } from 'next';
import { VertexAI } from '@google-cloud/vertexai';
import fetch from 'node-fetch';
import xml2js from 'xml2js';

const vertexAi = new VertexAI({ project: process.env.GOOGLE_CLOUD_PROJECT!, location: 'us-central1' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }
  try {
    const model = vertexAi.preview.languageModels.getGenerativeModel({ model: 'gemini-1.0-pro' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: message }] }],
    });
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, no response.';
    res.status(200).json({ content: text });
  } catch (error) {
    console.error('Vertex AI error:', error);
    // Try to provide a stringified error for easier debugging
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
}
