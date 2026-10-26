require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const API_KEY = process.env.OPENROUTER_API_KEY;

app.post('/classify', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const start = Date.now();

  try {
    const response = await fetch('https://openrouter.ai/api/alpha/decisions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'typesafe/jev-1.14',
        state: `Customer support message: "${message}"`,
        questions: {
          category: {
            type: 'choice',
            instructions: 'Which support team should handle this ticket?',
            criteria: {
              billing: 'Charges, invoices, duplicate payments, subscription issues, pricing questions',
              technical: 'Bugs, errors, app crashes, product not working as expected',
              refund: 'Refund requests, money back, cancellations, dispute charges',
              onboarding: 'New user setup, getting started, account creation, how-to questions',
              general: 'Anything else not covered by other teams'
            }
          },
          is_urgent: {
            type: 'noul',
            instructions: 'Does this message require urgent or immediate attention?'
          },
          sentiment: {
            type: 'choice',
            instructions: 'What is the overall sentiment of this message?',
            criteria: {
              angry: 'Customer is frustrated, upset, or using strong negative language',
              neutral: 'Customer is calm and factual, no strong emotion',
              polite: 'Customer is friendly, understanding, or appreciative'
            }
          }
        }
      })
    });

    const data = await response.json();
    const latency = Date.now() - start;

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    res.json({
      category: data.answers.category,
      is_urgent: data.answers.is_urgent,
      sentiment: data.answers.sentiment,
      model: data.model,
      usage: data.usage,
      latency
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
