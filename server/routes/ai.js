import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post('/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages are required and must be an array.' });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert startup mentor named Nexus Advisor. You provide strategic, context-aware advice to tech entrepreneurs on growth, funding, product strategy, and engineering scaling. Keep your tone professional, encouraging, and highly actionable.',
        },
        ...messages,
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      stream: false,
    });

    const aiMessage = chatCompletion.choices[0]?.message?.content;
    res.json({ content: aiMessage });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from AI', 
      message: error.message 
    });
  }
});

export default router;
