/*
 * ===================================================================
 * AI QUOTE GENERATOR SCRIPT (For Developer Use)
 * ===================================================================
 *
 * PURPOSE:
 * 1. Calls the Google Gemini API X times to generate unique quotes.
 * 2. Saves these quotes to a static JSON file.
 * 3. This avoids placing your secret API key in the client-side code.
 *
 * SETUP:
 * 1. Run `npm install node-fetch@2` in your terminal (uses v2 for CommonJS).
 * 2. Get your API key from Google AI Studio.
 * 3. Paste your key into the `API_KEY` variable below.
 * 4. Run this script from your terminal: `node generate_quotes.js`
 * ===================================================================
 */

// Use CommonJS 'require' syntax instead of 'import'
const fs = require('fs');
const path = require('path');
// Use node-fetch v2 for CommonJS compatibility
const fetch = require('node-fetch');

// --- 1. CONFIGURATION ---

const API_KEY = 'API_HEY_HERE';

// The AI's persona
const SYSTEM_PROMPT = "You are a wise and ancient sage in a fantasy RPG. Your name is 'The Oracle of the Limes'. You only speak in short, enigmatic, or wise phrases. You must never break character. Your responses should be 1-2 sentences long.";

// The question we will ask the AI repeatedly
const USER_PROMPT = "Speak a short piece of wisdom for the hero who has approached you.";

// How many quotes to generate
const NUMBER_OF_QUOTES = 100;

// Where to save the final JSON file (inside your game's source)
const OUTPUT_PATH = 'sageQuotes.json';

// The Gemini API endpoint
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;

// --- 2. HELPER FUNCTIONS ---

/**
 * Calls the Gemini API one time to get a single quote.
 */
async function fetchOneQuote() {
    const payload = {
        contents: [{ parts: [{ text: USER_PROMPT }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`API Error (${response.status}): ${errorData.error.message}`);
            return null;
        }

        const result = await response.json();

        if (result.candidates && result.candidates[0].content.parts[0].text) {
            let text = result.candidates[0].content.parts[0].text;
            // Clean up any markdown or extra spaces
            text = text.replace(/\*/g, '').replace(/\n/g, ' ').trim();
            return text;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Network request failed:", error);
        return null;
    }
}

/**
 * Simple delay function to avoid hitting the API rate limits.
 * @param {number} ms - Milliseconds to wait
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- 3. MAIN EXECUTION ---

async function generate() {
    console.log(`Starting quote generation... (This will take a few minutes)`);
    const allQuotes = [];
    let failedQuotes = 0; // Use 'let' so it can be incremented

    for (let i = 0; i < NUMBER_OF_QUOTES; i++) {
        const quote = await fetchOneQuote();
        
        if (quote) {
            allQuotes.push(quote);
            console.log(`Generated Quote ${i + 1}/${NUMBER_OF_QUOTES}`);
        } else {
            console.warn(`Failed to generate quote ${i + 1}. Retrying...`);
            i--; // Retry this index
            failedQuotes++;
        }
        
        // Wait 1.5 seconds between requests to respect the free-tier rate limit (60 req/min)
        await delay(8000); 
        
        // Failsafe in case API is completely down
        if (failedQuotes > 10) {
            console.error("Too many consecutive failures. Aborting.");
            break;
        }
    }

    if (allQuotes.length > 0) {
        // Ensure the directory exists
        const outputDir = path.dirname(OUTPUT_PATH);
        if (!fs.existsSync(outputDir)){
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write the final JSON file
        // Using { "quotes": [...] } as the structure
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ quotes: allQuotes }, null, 2));
        console.log(`\n✅ Success! Saved ${allQuotes.length} quotes to ${OUTPUT_PATH}`);
    } else {
        console.error("\n❌ Failed. No quotes were generated.");
    }
}

// Start the generator
generate();