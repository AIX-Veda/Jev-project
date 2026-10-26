require('dotenv').config();

const API_KEY = process.env.OPENROUTER_API_KEY;

async function testJev() {
  console.log('Testing Jev 1.14 via OpenRouter...\n');

  const response = await fetch('https://openrouter.ai/api/alpha/decisions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'typesafe/jev-1.14',
      state: "Customer message: 'I was charged twice for my subscription this month, I need a refund.'",
      questions: {
        category: {
          type: 'choice',
          instructions: 'Which support team should handle this ticket?',
          criteria: {
            billing: 'Charges, invoices, duplicate payments, subscription issues',
            technical: 'Bugs, errors, product not working as expected',
            refund: 'Refund requests, money back, cancellations',
            onboarding: 'New user setup, getting started, account creation',
            general: 'Anything else not covered by other teams'
          }
        },
        is_urgent: {
          type: 'noul',
          instructions: 'Does this message require urgent attention or immediate action?'
        }
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('API Error:', JSON.stringify(data, null, 2));
    return;
  }

  console.log('Status:', response.status);
  console.log('Model:', data.model);
  console.log('\n--- Decisions ---');
  const { category, is_urgent } = data.answers;
  console.log(`Category:    ${category.choice} (confidence: ${category.confidence})`);
  console.log(`Urgent:      ${is_urgent.noul > 0.5 ? 'YES' : 'NO'} (probability: ${is_urgent.noul})`);
  console.log('\nFull response:');
  console.log(JSON.stringify(data, null, 2));
}

testJev().catch(console.error);
