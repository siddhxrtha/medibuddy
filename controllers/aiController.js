const axios = require('axios');

// Local LLM runner using Ollama (phi-3:mini by default).
async function runLocalLLM(prompt) {
  const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
  const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi3:mini';
  console.log(`[AI] Trying local LLM: ${OLLAMA_MODEL} @ ${OLLAMA_URL}`);
  const response = await axios.post(
    OLLAMA_URL,
    {
      model: OLLAMA_MODEL,
      prompt: String(prompt || ''),
      stream: false,
      options: { temperature: 0.3, top_p: 0.8, num_predict: 120 }
    },
    { timeout: 45000, headers: { 'Content-Type': 'application/json' } }
  );
  const text = response?.data?.response?.trim();
  if (!text) throw new Error('Empty local LLM response');
  return text;
}

function toTwoSentences(text) {
  const normalized = String(text || '').trim();
  if (!normalized) return '';
  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, 2).join(' ').trim() || normalized;
}

async function callGroq(prompt) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY || 'REPLACE_WITH_GROQ_API_KEY';
  const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  if (!GROQ_API_KEY || GROQ_API_KEY === 'REPLACE_WITH_GROQ_API_KEY') {
    throw new Error('Groq API key not configured');
  }

  console.log(`[AI] Falling back to Groq: ${GROQ_MODEL}`);
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: 'Respond in 1-2 concise sentences.' },
        { role: 'user', content: String(prompt || '') }
      ],
      temperature: 0.3,
      max_tokens: 120
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      timeout: 15000
    }
  );

  const text = response?.data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty Groq response');
  return text;
}

// Primary exported controller function
async function generateAIResponse(req, res) {
  try {
    const prompt = req.body?.prompt || req.body?.message;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // Step 1: Try local LLM first
    try {
      const local = await runLocalLLM(prompt);
      const concise = toTwoSentences(local);
      if (concise) return res.json({ response: concise });
    } catch (err) {
      // Local failed -> fallback to Groq
    }

    // Step 2: Groq fallback for deployments
    try {
      const groqText = await callGroq(prompt);
      const concise = toTwoSentences(groqText);
      if (concise) return res.json({ response: concise });
    } catch (err) {
      // Groq failed -> safe fallback
    }

    return res.json({ response: 'I am having trouble generating a response right now. Please try again soon.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate response' });
  }
}

module.exports = {
  generateAIResponse,
  // Provide compatible handlers if other routes expect them
  chat: generateAIResponse,
  getHealthTips: generateAIResponse
};
