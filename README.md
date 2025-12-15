# 🍋 Welcome to Lime World

**Explore. Battle. Cure.**

Welcome to **Lime World**, a 2D web-based RPG where the world has been overrun by... limes. But these aren't just any citrus fruits; they are sentient, bouncing monsters inspired by the classic Slimes of *Dragon Quest*. Your mission involves exploring this tangy terrain, battling the lime menace, and harnessing their unique properties to save the world.

---

## 🛠️ How to Run the Game

Because this game uses external assets (images, JSON maps) and local storage features, modern browsers will block the game from running if you simply double-click the `index.html` file (due to CORS security policies).

**You must run the game using a local web server.** We recommend using `http-server`.

### 1. Prerequisite
Ensure you have **Node.js** installed on your computer.

### 2. Install the Server
Open your terminal (Command Prompt or Terminal) and run the following command to install the simple http-server globally:
```bash
npm install --global http-server
````

### 3\. Launch the Game

1.  Navigate into the folder of the version you want to play (e.g., `cd MVP` or `cd FullVersion`).
2.  Start the server by typing:
    ```bash
    http-server
    ```
3.  The terminal will show you a list of available addresses. Look for the one that says `http://127.0.0.1:8080` (or a different port number if 8080 is busy).
4.  Open your web browser and enter that address:
    `http://127.0.0.1:8080` (replace `8080` with your specific port number).

-----

## 🎮 The Game Lore & Enemies

In Lime World, you will encounter the **Lime Monsters**. While they look squishy and cute, they are aggressive and territorial.

  * **The Drop:** When defeated, these monsters drop **Lime-Blobs**.
  * **The Cure:** These blobs aren't just trophies; they possess miraculous curative properties. Collecting them is essential to completing the game's ultimate objective.

### 💀 The Stakes: Lime Coins & Permadeath

Survival is key. The world is unforgiving, and death comes at a cost.

  * **Respawn Mechanism:** To come back to life, you must pay the ferryman (or just the game logic) **1 Lime Coin**.
  * **The Threat:** If you fall in battle and have **0 Lime Coins** in your inventory, your run is over. You will lose your progress and must restart the game from the beginning. *Hoard your coins wisely\!*

-----

## 💾 Save System & Sessions

Lime World uses a unique, username-based session system.

  * **Public Sessions:** All game sessions are public. Access your save simply by entering your **Username**.
  * **Hybrid Saving:**
      * **Local Storage:** The game automatically saves your progress to your browser's Local Storage as you play.
      * **Cloud Save (JsonBin):** You can manually upload your progress to the cloud. Press **ESC** to open the Pause Menu and select the save option to push your data to JsonBin.

-----

## 🧙‍♂️ The Sage & Gemini AI

One of the most advanced features of Lime World is the **Sage NPC**.

  * **AI-Powered Wisdom:** The Sage's dialogue isn't hardcoded by hand. We utilized **Google's Gemini API** to generate 100 unique phrases of wisdom.
  * **Technical Implementation:** These phrases were generated and stored in a **JsonBin** database.
  * **TTL Cache Simulation:** To simulate a Time-To-Live (TTL) caching mechanism, the game fetches a new phrase for the Sage only every **X minutes**, ensuring that his wisdom changes dynamically over time but remains consistent during short interactions.

-----

## 📂 Project Structure

This repository is divided into two distinct versions of the game:

1.  **MVP (Minimum Viable Product):** The core foundation. Contains the tutorial and the initial NPC zone.
2.  **Full Version:** The complete experience. Includes everything in the MVP plus two dangerous new enemy areas for extended gameplay.

-----

*Created by Enrique Hernández*
