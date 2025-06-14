require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = 5000;

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000/', // your frontend domain
    'X-Title': 'My Chatbot Project'           // optional
  }
});

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'qwen/qwen-2.5-7b-instruct',  // ✅ Use Qwen model here
      messages: [{ role: 'user', content: message }]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error('OpenRouter API Error:', err);
    res.status(500).json({ error: 'Error talking to Qwen', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
