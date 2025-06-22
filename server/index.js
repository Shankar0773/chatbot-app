require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = 5000;

// Ensure API key is provided
if (!process.env.OPENROUTER_API_KEY) {
  console.error('Error: OPENROUTER_API_KEY is not set in the environment variables.');
  process.exit(1); // Exit the application
}

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // Add Authorization header
    'HTTP-Referer': 'http://localhost:3000/', // your frontend domain
    'X-Title': 'My Chatbot Project'           // optional
  }
});

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  // Validate incoming request
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid request: "message" is required and must be a string.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'qwen/qwen-2.5-7b-instruct',  // ✅ Use Qwen model here
      messages: [
        { role: 'system', content: 'You are a helpful and responsible medical assistant specialized in skin diseases. Provide clear, concise, and informative answers. Do not diagnose or give treatment. Recommend seeing a doctor for serious concerns.' },
        { role: 'user', content: message }
      ]
    });

    // Validate response structure
    if (
      completion &&
      completion.choices &&
      completion.choices[0] &&
      completion.choices[0].message &&
      completion.choices[0].message.content
    ) {
      res.json({ reply: completion.choices[0].message.content });
    } else {
      console.error('Unexpected API response:', completion);
      res.status(500).json({ error: 'Unexpected API response. Please try again later.' });
    }
  } catch (err) {
    console.error('OpenRouter API Error:', err);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
