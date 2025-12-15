class InitialMenu extends Phaser.Scene {

    constructor() {
        super({ key: 'InitialMenu' });
    }

    // Initialization. Receives data passed from scene.launch()
    init(data) {
        // Grab the data (dimensions and WorldScene reference) and save them to 'this'
        this.width = data.width;
        this.height = data.height;
        this.worldScene = data.worldScene;

        // Get the container element for the HTML menu (corrected ID)
        this.menuContainer = document.getElementById("pauseGame-menu");

        // Calculate center coordinates as instance properties
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    // Phase 2: Creation. Called automatically by Phaser after init()
    create() {
        // Insert a black rectangle that is semi opaque to simulate the game stop mode.
        // Now uses instance properties (this.centerX, this.centerY)
        this.add.rectangle(this.centerX, this.centerY, this.width, this.height, 0x000000, 0.6)
            .setDepth(100)
            .setScrollFactor(0);

        this.setInitialMenuHTML();

        // Attach listeners immediately after setting HTML
        this.attachButtonListeners();
    }

    // Helper to attach listeners (must be called whenever HTML is re-rendered)
    attachButtonListeners() {
        // Set listeners for the buttons.
        this.playBtn = document.getElementById("play-btn");
        this.seeCodeBtn = document.getElementById("seeCode-btn");
        this.controlsBtn = document.getElementById("controls-btn");

        if (this.playBtn) this.playBtn.addEventListener("click", () => this.askSessionNameAndStart());
        if (this.seeCodeBtn) this.seeCodeBtn.addEventListener("click", () => this.seeCode());
        if (this.controlsBtn) this.controlsBtn.addEventListener("click", () => this.aboutTheGameAndControls());
    }

    // Auxiliar create function.
    setInitialMenuHTML() {
        // Use innerHTML on the container
        this.menuContainer.innerHTML =
            (
                // Outer wrapper uses Absolute Positioning and Flexbox for full-screen centering
                ` <!-- Outer Container -->
                <div id="initial-menu" class="initial-menu" >
                    <!-- Inner container for the buttons with styling -->
                    <div id="initial-menu-button-container"
                         class="initial-menu-button-container" >
                        <h1 id="main-title" >LIME WORLD</h1>
                        <button id="play-btn" class="menu-btn" > Play Game </button>
                        <button id="seeCode-btn" class="menu-btn" > See Code </button>
                        <button id="controls-btn" class="menu-btn" > Controls </button>
                    </div>
                </div>
            `
            );
        // Re-attach listeners after rebuilding the HTML
        this.attachButtonListeners();
    }

    // Auxiliar create function.
    // It simulates the procedure to start the game.
    askSessionNameAndStart() {
        const self = this;

        self.menuContainer.innerHTML =
            (
                `
            <div id="session-name-prompt" class="session-name-prompt">
                <h4 style="color: white;">What is the name of your character?</h4>
        
                <input id="name-input" placeholder="Enter name here..." style="padding: 8px; margin-bottom: 10px; border-radius: 4px; border: 1px solid #ccc;">
                
                <p id="username-wrong-alert" style="color: red; margin-bottom: 10px; display: none;"> 
                    User name must have at least one character that isn't a white space 
                </p>
            
                <div>
                    <button id="cancel-btn" class="menu-btn" >Cancel</button>
                    <button id="submit-btn" class="menu-btn" ">Submit</button>
                </div>
            </div>
            `
            );

        // Get references to new DOM elements
        const nameInput = document.getElementById("name-input");
        const cancelButton = document.getElementById("cancel-btn");
        const submitButton = document.getElementById("submit-btn");
        const alertElement = document.getElementById("username-wrong-alert");

        // To allow using keys that are being listened by phaser for the game logic.
        nameInput.addEventListener('keydown', (event) => {
            event.stopPropagation();
        });

        // Attach event listeners correctly (passing function references)
        if (submitButton) {
            submitButton.addEventListener('click', async () => {

                const rawInput = nameInput.value;
                const newName = rawInput.trim();

                if (newName.length == 0) {
                    alertElement.style.display = "block";
                } else {
                    // Start the game, passing the user name
                    await self.worldScene.set_username(newName);
                    self.showTutorial();
                }
            });
        }

        cancelButton.addEventListener("click", () => self.setInitialMenuHTML());
    }

    showTutorial() {
        this.menuContainer.innerHTML =
            (
                // Outer wrapper uses Absolute Positioning and Flexbox for full-screen centering
                ` <!-- Outer Container -->
                <div id="tutorial-menu" class="tutorial-menu" >
                    <!-- Inner container for the buttons with styling -->
                    <div id="initial-menu-button-container"
                         class="initial-menu-button-container" >
                        <h1 id="main-title" style="margin-top: -0.5rem" >TUTORIAL</h1>
                        <p style="text-align: center; margin-top: -1rem;" > This is the game tutorial, where you may find the most relevant things about Lime World! </p>
                        <p style="text-align: center; margin-top: -1rem;" > The main creatures are limes, the blue droplet-like things that you may first find after this tutorial </p>
                        <p style="text-align: center; margin-top: -1rem;" > They will attack you, so be prepared to defend youself! </p>
                        <p style="text-align: center; margin-top: -1rem;" > If you kill the (movement and attack constrols pressing the key "Escape" once you end the tutorial), they will drop items </p>
                        <p style="text-align: center; margin-top: -1rem;" > You will be able to obtain lime blobs (which you will need further in your adventure) and lime coins (you will need one of these to respawn if you die) </p>
                        <p style="text-align: center; margin-top: -1rem;" > If you die and do not have any lime coins, you will have to restart your game progress, so always have some of these! </p>
                        <button id="play-btn" class="menu-btn" > Understood! </button>
                    </div>
                </div>
            `
            );

        this.playBtn = document.getElementById("play-btn");
        if (this.playBtn) this.playBtn.addEventListener("click", () => this.startGame());
    }

    // Goes to the game.
    startGame() {

        this.menuContainer.innerHTML = "";

        const ui_container = document.getElementById("ui-container");
        ui_container.style.opacity = "1";

        if (this.worldScene) {
            this.worldScene.scene.resume();
        }

        this.scene.stop();
    }

    // Goes to the github repo of the game.
    seeCode() {
        window.location.href = "https://github.com/Enrikkk/Lime_World_WebGame.git";
    }

    aboutTheGameAndControls() {
        this.menuContainer.innerHTML =
            (
                `
            <div id="controls-menu" class="controls-menu" > 
                <div id="controls-menu-container"
                     class="controls-menu-container" >
                        
                    <h1 style="color: white;
                               text-align: center;"> Lime World </h1>
                    <h2 style="color: #ccc; font-size: 1.2em; text-align: center;"> A game with a lot of limes!</h2>
                    <p style="color: white; margin-top: 15px; text-align: center;"> In Lime World you will have to explore a world populated by lime monsters, and use their curative properties. <p>
                    <h2 style="color: #4ade80; margin-top: 0.1rem; margin-bottom: -0.2rem; text-align: center; "> Controls </h2>
                    <p style="color: white; text-align: center;"> Press the Escape/Esc key to open the Resume Menu </p>
                    <div style="font-family: monospace; padding: 10px; background: #2d3748; border-radius: 4px; line-height: 1.5; color: #fff;">
                        W &rarr; Go Up<br>
                        A &rarr; Go Left<br>
                        S &rarr; Go Down<br>
                        D &rarr; Go Right<br>
                        Attack &rarr; Left Click
                    </div>
                    <button id="okay-controls-btn" class="menu-btn" style="margin-top: 1.5rem;
                                                                           background-color: #4ade80;"> Got it! </button>
                </div>
            </div>
            `
            );

        // Attach listener for new button.
        this.okayControlsBtn = document.getElementById("okay-controls-btn");
        this.okayControlsBtn.addEventListener("click", () => this.setInitialMenuHTML());
    }
}
