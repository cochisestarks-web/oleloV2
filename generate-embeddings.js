const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEmbeddings() {
  console.log('Loading Hawaiian values data...');
  const dataPath = path.join(__dirname, '..', 'data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  console.log(`Found ${data.values.length} Hawaiian values`);
  console.log('Generating embeddings...');
  
  const embeddings = [];
  
  for (let i = 0; i < data.values.length; i++) {
    const value = data.values[i];
    
    // Create rich text representation for embedding
    const textForEmbedding = `
      ${value.hawaiian} (${value.english})
      ${value.cultural_context}
      ${value.practical_application}
      ${value.olelo_noeau || ''}
    `.trim();
    
    console.log(`[${i + 1}/${data.values.length}] Embedding: ${value.hawaiian}...`);
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: textForEmbedding,
    });
    
    embeddings.push(response.data[0].embedding);
    
    // Rate limiting - wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('Saving embeddings...');
  const embeddingsData = {
    model: 'text-embedding-3-small',
    generated_at: new Date().toISOString(),
    embeddings: embeddings,
  };
  
  const outputPath = path.join(__dirname, '..', 'embeddings.json');
  fs.writeFileSync(outputPath, JSON.stringify(embeddingsData, null, 2));
  
  console.log(`✅ Successfully generated ${embeddings.length} embeddings`);
  console.log(`📁 Saved to: ${outputPath}`);
}

generateEmbeddings().catch(console.error);
