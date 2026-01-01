// ʻŌlelo Hawaiʻi V2.0 - RAG-Enhanced Search
// Client-side semantic search with embeddings

class RAGSearch {
    constructor() {
        this.values = [];
        this.embeddings = [];
        this.init();
    }

    async init() {
        await this.loadData();
    }

    async loadData() {
        try {
            // Load values and embeddings
            const [valuesResponse, embeddingsResponse] = await Promise.all([
                fetch('data.json'),
                fetch('embeddings.json')
            ]);

            const valuesData = await valuesResponse.json();
            const embeddingsData = await embeddingsResponse.json();

            this.values = valuesData.values;
            this.embeddings = embeddingsData.embeddings;

            console.log(`Loaded ${this.values.length} values with embeddings`);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Generate simple embedding for query (client-side)
    generateQueryEmbedding(query) {
        const text = query.toLowerCase();
        
        const features = [
            text.includes('love') || text.includes('aloha') || text.includes('compassion') || text.includes('care about'),
            text.includes('family') || text.includes('ohana') || text.includes('relative') || text.includes('ancestor'),
            text.includes('land') || text.includes('aina') || text.includes('earth') || text.includes('environment'),
            text.includes('ocean') || text.includes('kai') || text.includes('sea') || text.includes('water'),
            text.includes('balance') || text.includes('harmony') || text.includes('pono') || text.includes('right'),
            text.includes('responsibility') || text.includes('kuleana') || text.includes('duty') || text.includes('obligation'),
            text.includes('care') || text.includes('malama') || text.includes('protect') || text.includes('preserve'),
            text.includes('gratitude') || text.includes('mahalo') || text.includes('thanks') || text.includes('appreciate'),
            text.includes('help') || text.includes('kokua') || text.includes('assist') || text.includes('support'),
            text.includes('unity') || text.includes('lokahi') || text.includes('together') || text.includes('community'),
            text.includes('forgive') || text.includes('hooponopono') || text.includes('restore') || text.includes('conflict'),
            text.includes('elder') || text.includes('kupuna') || text.includes('grandparent') || text.includes('wisdom'),
            text.includes('child') || text.includes('keiki') || text.includes('kid') || text.includes('young'),
            text.includes('parent') || text.includes('makua') || text.includes('mother') || text.includes('father'),
            text.includes('mountain') || text.includes('mauna') || text.includes('high place'),
            text.includes('dance') || text.includes('hula') || text.includes('movement'),
            text.includes('chant') || text.includes('oli') || text.includes('song') || text.includes('prayer'),
            text.includes('work') || text.includes('hana') || text.includes('craft') || text.includes('skill') || text.includes('job'),
            text.includes('knowledge') || text.includes('ike') || text.includes('wisdom') || text.includes('learn'),
            text.includes('respect') || text.includes('honor') || text.includes('reverence')
        ].map(b => b ? 1 : 0);

        return features;
    }

    // Calculate cosine similarity between two vectors
    cosineSimilarity(vecA, vecB) {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }

    // Search for relevant values
    search(query, topK = 3) {
        const queryEmbedding = this.generateQueryEmbedding(query);

        const results = this.values.map((value, idx) => ({
            value,
            similarity: this.cosineSimilarity(queryEmbedding, this.embeddings[idx])
        }));

        return results
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
    }

    // Generate contextual answer based on retrieved values
    generateAnswer(query, relevantValues) {
        // For V2.0, we'll use Claude API for generation
        // For now, creating a structured response from retrieved values
        
        const mainValue = relevantValues[0];
        const supportingValues = relevantValues.slice(1);

        let answer = `Based on Hawaiian values, here's guidance for "${query}":\n\n`;
        
        answer += `**${mainValue.value.hawaiian}** (${mainValue.value.english}) is most relevant here.\n\n`;
        answer += `${mainValue.value.practical_application}\n\n`;

        if (supportingValues.length > 0) {
            answer += `This connects to other values:\n`;
            supportingValues.forEach(({ value }) => {
                answer += `• **${value.hawaiian}**: ${value.english}\n`;
            });
        }

        if (mainValue.value.olelo_noeau) {
            answer += `\n*${mainValue.value.olelo_noeau}*`;
        }

        return answer;
    }
}

// Export for use in app
window.RAGSearch = RAGSearch;
