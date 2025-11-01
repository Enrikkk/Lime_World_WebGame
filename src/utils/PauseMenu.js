class PauseMenu extends Phaser.Scene {
    
    // Class to model the pause scene.
    constructor() {
        super({ key: 'PauseMenu' });
    }
    
    // Initialization. 
    init(data) {
        this.width = data.width;
        this.height = data.height;
        this.worldScene = data.worldScene; 
        this.menuContainer = document.getElementById("pauseGame-menu");
    }
    
    create() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        this.add.rectangle(centerX, centerY, this.width, this.height, 0x000000, 0.6)
        .setDepth(100)
        .setScrollFactor(0);
        
        this.setPauseMenuHTML();
    }
    
    // Auxiliar create function.
    setPauseMenuHTML() {
        this.menuContainer.innerHTML =
        (
            `
                <div id="initial-menu" class="initial-menu" > 
                    <button id="resume-btn" class="menu-btn" > Resume Game </button>
                    <button id="controls-btn" class="menu-btn" > Controls </button>
                    <button id="saveOffline-btn" class="menu-btn" > Save Offline </button>
                    <button id="saveOnline-btn" class="menu-btn" > Save Online </button>
                </div>
            `
        );
        
        // Re-attach listeners after the HTML is rebuilt
        this.attachButtonListeners();
        this.input.keyboard.on('keydown-ESC', this.goBackToGame, this); // Pause menu key listener.
    }
    
    // Helper function to create the button listeners.
    attachButtonListeners() {
        // Set listeners for the buttons.
        this.resumeBtn = document.getElementById("resume-btn"); 
        this.controlsBtn = document.getElementById("controls-btn");
        this.saveOffline = document.getElementById("saveOffline-btn");
        this.saveOnline = document.getElementById("saveOnline-btn"); 
        
        // Listeners.
        if (this.resumeBtn) this.resumeBtn.addEventListener("click", () => this.goBackToGame()); 
        if (this.controlsBtn) this.controlsBtn.addEventListener("click", () => this.aboutTheGameAndControls());
        if (this.saveOffline) this.saveOffline.addEventListener("click", () => this.saveOffline());
        if (this.saveOnline) this.saveOnline.addEventListener("click", () => this.saveOnline());
    }
    
    // Goes back to the game.
    goBackToGame() {
        this.menuContainer.innerHTML = "";
        this.worldScene.scene.resume(); 
        this.scene.stop(); 
    }
    
    aboutTheGameAndControls() {
        this.menuContainer.innerHTML =
        (
            `
                <div id="controls-menu" class="controls-menu" > 
                    <h1> Lime World </h1>
                    <h2> A game with a lot of limes!<br>And a village to save... </h2>
            
                    <p> In Lime World you will have to explore a lime with different lime monsters, and try not to get eaten by them.
                    <br>Moreover, you have a quest to save the village from this increasing lime problem! </p>
                    <h3> Controls </h3>
                    <div style="font-family: monospace; padding: 10px; background: #eee; border-radius: 4px; line-height: 1.5;">
                        W $\\rightarrow$ Go Up<br>
                        A $\\rightarrow$ Go Left<br>
                        S $\\rightarrow$ Go Down<br>
                        D $\\rightarrow$ Go Right<br>
                        Attack $\\rightarrow$ Left Click
                    </div>
                    <button id="okay-controls-btn" class="menu-btn"> Got it! </button>
                </div>
            `
        );
        
        // Attach listener for new button.
        this.okayControlsBtn = document.getElementById("okay-controls-btn");
        this.okayControlsBtn.addEventListener("click", () => this.setInitialMenuHTML());
    }
    
    // Save game in local storage.
    saveOffline() {
        this.worldScene.saveOffline();
    }
    
    // Save game to jsonBin.
    saveOnline() {
        this.worldScene.saveOnline();
    }
}
