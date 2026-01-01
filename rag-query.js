const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cosine similarity function for vector comparison
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Main handler
exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { query, values, embeddings } = JSON.parse(event.body);

    if (!query || !values || !embeddings) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: query, values, embeddings' }),
      };
    }

    // Step 1: Get embedding for user query
    console.log('Generating query embedding...');
    const queryEmbedding = await generateEmbedding(query);

    // Step 2: Find most similar values using vector search
    console.log('Searching for relevant values...');
    const relevantValues = findRelevantValues(queryEmbedding, values, embeddings, 3);

    // Step 3: Generate response using RAG
    console.log('Generating response...');
    const response = await generateRAGResponse(query, relevantValues);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        answer: response,
        sources: relevantValues.map(v => ({
          hawaiian: v.value.hawaiian,
          english: v.value.english,
          similarity: v.similarity.toFixed(3),
        })),
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Generate embedding using OpenAI embeddings API
async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  
  return response.data[0].embedding;
}

// Find most relevant values using cosine similarity
function findRelevantValues(queryEmbedding, values, embeddings, topK = 3) {
  const similarities = values.map((value, idx) => ({
    value,
    similarity: cosineSimilarity(queryEmbedding, embeddings[idx]),
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

// Generate RAG response using Claude
async function generateRAGResponse(query, relevantValues) {
  const context = relevantValues
    .map(({ value }) => `
**${value.hawaiian}** (${value.english})
${value.cultural_context}
${value.practical_application}
    `)
    .join('\n\n');

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `You are a helpful assistant teaching Hawaiian cultural values. Based on the following Hawaiian values and their meanings, answer the user's question.

Hawaiian Values Context:
${context}

User Question: ${query}

Provide a helpful answer that:
1. Directly addresses the question
2. References the relevant Hawaiian values by name
3. Explains how these values apply to their situation
4. Keeps the tone warm and educational

Answer:`
    }]
  });

  return message.content[0].text;
}
