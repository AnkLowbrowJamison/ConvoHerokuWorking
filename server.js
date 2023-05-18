import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openaiApiKey = process.env.OPENAI_API_KEY;

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat/:guide', async (req, res) => {
  try {
    const guide = req.params.guide;
    const prompt = req.body.prompt;

    const data = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            `You are the famous philosopher ${guide}. You will answer as if you are my guide. Speak in the voice of ${guide} and only use ideas based on ${guide}. Limit your response to 500 characters, and include a question or statement to further the conversation. Include your ideas on how to solve the problem.`,
        },
        {
          role: 'user',
          content: `You will only speak in the first person. Only use ideas based on ${guide}. ${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
    };

    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const response = await axios.post(apiUrl, data, config);
    const botResponse = response.data.choices[0].message.content;

    res.status(200).send({
      bot: botResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error || 'Something went wrong');
  }
  console.log("Script loaded");
});

// Add this after your API routes
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`AI server started on http://localhost:${port}`));
