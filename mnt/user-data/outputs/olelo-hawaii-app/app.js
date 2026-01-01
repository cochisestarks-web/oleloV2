// ʻŌlelo Hawaiʻi Daily Practice - Main Application Logic
// Ma ka hana ka ʻike - In doing, one learns

class OleloHawaiiApp {
    constructor() {
        this.values = [];
        this.currentValue = null;
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.displayDailyValue();
        this.updateStats();
    }

    // Load Hawaiian values data
    async loadData() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            this.values = data.values;
            console.log(`Loaded ${this.values.length} Hawaiian values`);
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError();
        }
    }

    // Setup event listeners
    setupEventListeners() {
        const refreshBtn = document.getElementById('refresh-btn');
        refreshBtn.addEventListener('click', () => this.getNewValue());
    }

    // Display the value of the day
    displayDailyValue() {
        // Check if we already showed a value today
        const lastShown = localStorage.getItem('lastValueDate');
        const today = new Date().toDateString();

        if (lastShown === today) {
            // Load saved value from today
            const savedValue = JSON.parse(localStorage.getItem('todayValue'));
            if (savedValue) {
                this.currentValue = savedValue;
                this.renderValue();
                return;
            }
        }

        // Get a new random value for today
        this.getNewValue();
    }

    // Get a new random value
    getNewValue() {
        if (this.values.length === 0) return;

        // Get random value
        const randomIndex = Math.floor(Math.random() * this.values.length);
        this.currentValue = this.values[randomIndex];

        // Save to localStorage
        const today = new Date().toDateString();
        localStorage.setItem('lastValueDate', today);
        localStorage.setItem('todayValue', JSON.stringify(this.currentValue));

        // Track this value as learned
        this.trackValueLearned(this.currentValue.hawaiian);

        // Increment days practiced
        this.incrementDaysPracticed(today);

        // Render the value
        this.renderValue();
        this.updateStats();
    }

    // Render the current value to the DOM
    renderValue() {
        if (!this.currentValue) return;

        // Hide loading, show content
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('value-content').classList.remove('hidden');

        // Populate content
        document.getElementById('hawaiian-word').textContent = this.currentValue.hawaiian;
        document.getElementById('pronunciation').textContent = this.currentValue.pronunciation;
        document.getElementById('english-translation').textContent = this.currentValue.english;
        document.getElementById('cultural-context').textContent = this.currentValue.cultural_context;
        document.getElementById('practical-application').textContent = this.currentValue.practical_application;

        // Hawaiian proverb (if exists)
        if (this.currentValue.olelo_noeau) {
            document.getElementById('olelo-noeau').textContent = this.currentValue.olelo_noeau;
            document.getElementById('proverb-section').classList.remove('hidden');
        } else {
            document.getElementById('proverb-section').classList.add('hidden');
        }

        // Related concepts as badges
        const relatedContainer = document.getElementById('related-concepts');
        relatedContainer.innerHTML = '';
        
        if (this.currentValue.related_concepts && this.currentValue.related_concepts.length > 0) {
            this.currentValue.related_concepts.forEach(concept => {
                const badge = document.createElement('span');
                badge.className = 'bg-seafoam-teal text-white px-3 py-1 rounded-full text-sm font-medium capitalize';
                badge.textContent = concept;
                relatedContainer.appendChild(badge);
            });
        }

        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Track which values have been learned
    trackValueLearned(valueName) {
        let learnedValues = JSON.parse(localStorage.getItem('learnedValues') || '[]');
        
        if (!learnedValues.includes(valueName)) {
            learnedValues.push(valueName);
            localStorage.setItem('learnedValues', JSON.stringify(learnedValues));
        }
    }

    // Track unique days practiced
    incrementDaysPracticed(today) {
        let practiceDays = JSON.parse(localStorage.getItem('practiceDays') || '[]');
        
        if (!practiceDays.includes(today)) {
            practiceDays.push(today);
            localStorage.setItem('practiceDays', JSON.stringify(practiceDays));
        }
    }

    // Update stats display
    updateStats() {
        // Days practiced
        const practiceDays = JSON.parse(localStorage.getItem('practiceDays') || '[]');
        document.getElementById('days-practiced').textContent = practiceDays.length;

        // Values learned
        const learnedValues = JSON.parse(localStorage.getItem('learnedValues') || '[]');
        document.getElementById('values-learned').textContent = learnedValues.length;
    }

    // Show error message
    showError() {
        const loading = document.getElementById('loading');
        loading.innerHTML = `
            <p class="text-red-600 font-semibold">Unable to load Hawaiian values data.</p>
            <p class="text-gray-600 mt-2">Please refresh the page to try again.</p>
        `;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new OleloHawaiiApp();
});
