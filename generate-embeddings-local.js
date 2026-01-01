// This would normally use OpenAI API
// For demo, creating mock embeddings based on semantic content

const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

console.log('Generating semantic embeddings for', data.values.length, 'values...');

// Mock embeddings (in production, these would come from OpenAI)
const embeddings = data.values.map(value => {
  // Create a simple semantic vector based on key terms
  const text = `${value.hawaiian} ${value.english} ${value.cultural_context} ${value.practical_application}`.toLowerCase();
  
  const features = [
    text.includes('love') || text.includes('aloha') || text.includes('compassion'),
    text.includes('family') || text.includes('ohana') || text.includes('ancestor'),
    text.includes('land') || text.includes('aina') || text.includes('earth'),
    text.includes('ocean') || text.includes('kai') || text.includes('water'),
    text.includes('balance') || text.includes('harmony') || text.includes('pono'),
    text.includes('responsibility') || text.includes('kuleana'),
    text.includes('care') || text.includes('malama') || text.includes('protect'),
    text.includes('gratitude') || text.includes('mahalo') || text.includes('thanks'),
    text.includes('help') || text.includes('kokua') || text.includes('assist'),
    text.includes('unity') || text.includes('lokahi') || text.includes('together'),
    text.includes('forgive') || text.includes('hooponopono') || text.includes('restore'),
    text.includes('elder') || text.includes('kupuna') || text.includes('ancestor'),
    text.includes('child') || text.includes('keiki'),
    text.includes('parent') || text.includes('makua'),
    text.includes('mountain') || text.includes('mauna'),
    text.includes('dance') || text.includes('hula'),
    text.includes('chant') || text.includes('oli'),
    text.includes('work') || text.includes('hana') || text.includes('craft'),
    text.includes('knowledge') || text.includes('ike') || text.includes('wisdom'),
    text.includes('respect') || text.includes('honor')
  ].map(b => b ? 1 : 0);
  
  // Add some randomness to make vectors more realistic
  return features.map(f => f + (Math.random() * 0.2 - 0.1));
});

const output = {
  model: 'semantic-mock-v1',
  generated_at: new Date().toISOString(),
  embeddings: embeddings
};

fs.writeFileSync('embeddings.json', JSON.stringify(output, null, 2));
console.log('✅ Generated embeddings.json');
