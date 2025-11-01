// Used to extract a random joke every 5 minutes, that an NPC in the game will say.
// Uses TTL cache to implement this.
class PublicApiService {
    
    static API_URL = 'https://v2.jokeapi.dev/joke/Pun?type=single'; 
    static CACHE_KEY = 'avengedLegend_game_daily_secret_cache';
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
            const response = await fetch(PublicApiService.API_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const json = await response.json();
            
            // Extract the joke.
            const secretText = json.joke; 
            
            // Store obained data in cache.
            this.setCache(secretText);
            
            return secretText;

        } catch (error) {
            console.error("PublicApiService: Error fetching new secret:", error);
            return "The Sage whispers: The network connection is too unstable to reveal today's secret.";
        }
    }

    // Gets cache data if valid.
    getCache() {
        const cachedData = localStorage.getItem(PublicApiService.CACHE_KEY);
        if (!cachedData) {
            return null;
        }
        
        try {
            const cache = JSON.parse(cachedData);
            const now = Date.now();

            if (now < cache.expiry) {   // Data still valid.
                return cache;
            } else {                    // Data expired.
                localStorage.removeItem(PublicApiService.CACHE_KEY);
                return null;
            }
        } catch (e) {
            localStorage.removeItem(PublicApiService.CACHE_KEY);
            return null;
        }
    }

    // Writes obtained data to the cahce.
    setCache(data) {
        const expiry = Date.now() + PublicApiService.TTL_MS;
        const cache = {
            data: data,
            expiry: expiry,
        };
        localStorage.setItem(PublicApiService.CACHE_KEY, JSON.stringify(cache));
    }
}
