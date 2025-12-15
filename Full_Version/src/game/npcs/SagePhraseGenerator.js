// ABOUT ME: TTL Cache implementation of a wisdom phrase getter.
// Gets a phrase for the sage character every 5 minutes.
// A new JsonBin bin with the phrases generated was created to do a 
// GET to it, allowing to create a proper TTL Cache mechanism.

// Moreover, all of the phrases are stored in (starting from the root directory)
//      docs/media/npcs/sage/sageQuotes.json

// And the script used to generate them (using Google's Gemini API) in 
//      docs/media/npcs/sage/generate_quotes.js

class SagePhraseGenerator {

    static BIN_ID = '69149e41ae596e708f54cb44'; 
    static API_URL = `https://api.jsonbin.io/v3/b/${SagePhraseGenerator.BIN_ID}/latest`;
    static CACHE_KEY = 'limeWorld_game_sage_phrase_cache';
    static TTL_MS = 60 * 5 * 1000; // 5 minutes in milliseconds.

    // Look for the daily secret.
    async fetchDailySecret() {
        // First, we check if there is cached data.
        const cached = this.getCache();
        if (cached) {
            return cached.data;
        }

        // If there is no cached data, we look for it.
        try {
            const response = await fetch(SagePhraseGenerator.API_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const jsonText = await response.json();
            
            // Extract a phrase randomly.
            const phraseID = Math.floor(Math.random()*100);
            const phrase = jsonText.record.quotes[phraseID];
            
            // Store obained data in cache.
            this.setCache(phrase);
            
            return phrase;

        } catch (error) {
            console.error("SagePhraseGenerator: Error fetching wisdom: ", error);
            return "The Sage whispers: The network connection is too unstable for wisdom to flow properly...";
        }
    }

    // Gets cache data if valid.
    getCache() {
        const cachedData = localStorage.getItem(SagePhraseGenerator.CACHE_KEY);
        if (!cachedData) {
            console.log("There is no phrase cached.");
            return null;
        }
        
        try {
            const cache = JSON.parse(cachedData);
            const now = Date.now();

            if (now < cache.expiry) {   // Data still valid.
                console.log("Phrase cached valid.");
                return cache;
            } else {                    // Data expired.
                localStorage.removeItem(SagePhraseGenerator.CACHE_KEY);
                console.log("Phrase cached expired.");
                return null;
            }
        } catch (e) {
            localStorage.removeItem(SagePhraseGenerator.CACHE_KEY);
            return null;
        }
    }

    // Writes obtained data to the cahce.
    setCache(data) {
        const expiry = Date.now() + SagePhraseGenerator.TTL_MS;
        const cache = {
            data: data,
            expiry: expiry,
        };
        localStorage.setItem(SagePhraseGenerator.CACHE_KEY, JSON.stringify(cache));
    }
}
