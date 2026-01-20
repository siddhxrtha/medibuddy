const axios = require('axios');

// Using Ollama local LLM instead of cloud API
// Make sure Ollama is running: ollama serve
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'llama3.1'; // Better, more capable model
const OLLAMA_TIMEOUT = 120000; // 120 seconds timeout for slower systems

const SYSTEM_PROMPT = `You are MediBuddy AI, an empathetic and knowledgeable health assistant specifically designed for family caregivers managing elderly care.

ABOUT MEDIBUDDY:
- MediBuddy is a caregiver-focused app that helps families monitor medication adherence for elderly loved ones
- The system includes a physical reminder device that buzzes at medication time, with a confirmation button
- Caregivers receive real-time notifications when medications are taken or missed
- Features include: medication scheduling, emergency alerts, AI health support, and a caregiver community
- Our goal is to reduce caregiver stress and ensure elderly medication compliance

YOUR ROLE:
- Provide compassionate, practical advice for caregivers managing elderly care
- Offer nutrition tips for elderly with various health conditions (diabetes, heart health, etc.)
- Give medication management guidance (organizing, reminders, tracking)
- Support caregiver emotional well-being and stress management
- Suggest balanced meal ideas that are easy to prepare and senior-friendly

RESPONSE STYLE:
- Be warm, supportive, and understanding of caregiver challenges
- Keep responses practical and actionable (2-4 sentences for simple questions, longer for complex topics)
- Use bullet points for lists
- Include specific examples when helpful
- Acknowledge the emotional aspects of caregiving

Remember: You're not just providing information - you're supporting caregivers who may be stressed, overwhelmed, or seeking reassurance.`;

const FALLBACK_TIPS = {
  caregiver: `Here are 3 practical health tips for caregivers:\n\n1. **Take Regular Breaks** - Set aside 15-30 minutes daily for yourself to reduce stress and prevent burnout.\n\n2. **Maintain a Sleep Schedule** - Aim for 7-9 hours nightly. Quality sleep improves immunity and resilience.\n\n3. **Practice Stress Management** - Use meditation, deep breathing, or light exercise to manage stress effectively.\n\nRemember: Taking care of yourself allows you to provide better care for your loved one!`,

  medication: `Here are 3 tips for medication adherence:\n\n1. **Use a Pill Organizer** - Organize medications by day and time to prevent missed or double doses.\n\n2. **Set Daily Reminders** - Use phone alarms or apps. Consistency is key.\n\n3. **Involve the Care Recipient** - Let them participate in their medication routine when possible.`,

  wellness: `Here are 3 wellness tips:\n\n1. **Stay Hydrated** - Drink 8-10 glasses daily for better energy and health.\n\n2. **Move Your Body** - Aim for 30 minutes of activity daily. Movement reduces stress.\n\n3. **Eat Nutritious Foods** - Focus on whole foods, fruits, vegetables, and lean proteins.`
};

async function callOllamaAPI(prompt) {
  try {
    console.log('📝 Sending request to Ollama...');
    console.log('Endpoint:', OLLAMA_URL);
    console.log('Model:', OLLAMA_MODEL);
    
    const response = await axios.post(
      OLLAMA_URL,
      {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 500 // Allow longer, more detailed responses
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: OLLAMA_TIMEOUT
      }
    );

    console.log('✅ Ollama response received');
    if (response.data && response.data.response) {
      console.log('Response length:', response.data.response.length);
      return response.data.response.trim();
    }
    
    console.log('❌ No response text in data:', response.data);
    throw new Error('No response from Ollama');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - Ollama is not running!');
      console.log('   Start it with: ollama serve');
      throw new Error('Ollama server not running');
    }
    if (error.code === 'ENOTFOUND') {
      console.log('❌ Cannot find Ollama at localhost:11434');
      console.log('   Make sure Ollama is running: ollama serve');
      throw new Error('Ollama not found');
    }
    if (error.response?.status === 404) {
      console.log('❌ Model not found:', OLLAMA_MODEL);
      console.log('   Run: ollama pull', OLLAMA_MODEL);
      throw new Error(`Model '${OLLAMA_MODEL}' not found. Please run: ollama pull ${OLLAMA_MODEL}`);
    }
    console.log('❌ Ollama Error:', error.message);
    throw error;
  }
}

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Invalid message' });
    }

    const fullPrompt = SYSTEM_PROMPT + '\n\nUser: ' + message.trim();
    
    try {
      const aiResponse = await callOllamaAPI(fullPrompt);
      if (aiResponse && aiResponse.length > 10) {
        return res.json({ response: aiResponse });
      }
    } catch (apiError) {
      console.log('Using fallback tips');
      // Fall through to fallback
    }

    // Fallback with smart keyword detection
    const lowerMessage = message.toLowerCase();
    let fallbackResponse = '';
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('burnout') || lowerMessage.includes('overwhelm') || lowerMessage.includes('tired') || lowerMessage.includes('anxious')) {
      fallbackResponse = FALLBACK_TIPS.caregiver;
    } else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('dose') || lowerMessage.includes('pill') || lowerMessage.includes('drug')) {
      fallbackResponse = FALLBACK_TIPS.medication;
    } else if (lowerMessage.includes('exercise') || lowerMessage.includes('diet') || lowerMessage.includes('health') || lowerMessage.includes('water') || lowerMessage.includes('food') || lowerMessage.includes('sleep')) {
      fallbackResponse = FALLBACK_TIPS.wellness;
    } else if (lowerMessage.includes('ai') || lowerMessage.includes('bot') || lowerMessage.includes('assistant') || lowerMessage.includes('ollama')) {
      fallbackResponse = `I'm MediBuddy, your offline AI Health Assistant powered by Ollama! I'm here to help you with:\n\n• Caregiver wellness and stress management\n• Medication reminders and adherence tips\n• General health and wellness advice\n\nAsk me about stress management, how to organize medications, or ways to stay healthy while caregiving!`;
    } else {
      fallbackResponse = FALLBACK_TIPS.caregiver;
    }
    
    return res.json({ response: fallbackResponse });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process request' });
  }
};

exports.getHealthTips = async (req, res) => {
  try {
    const tipCategory = req.query.category || 'caregiver';
    const tips = FALLBACK_TIPS[tipCategory] || FALLBACK_TIPS.caregiver;
    
    try {
      const freshTips = await callOllamaAPI('Provide 3 health tips for ' + tipCategory);
      return res.json({ tips: freshTips });
    } catch (apiError) {
      return res.json({ tips: tips });
    }
  } catch (error) {
    console.error('Get Tips Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch tips' });
  }
};