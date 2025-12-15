class GameOverMenu extends Phaser.Scene {

    constructor() {
        super({ key: 'GameOverMenu' });
    }

    // Initialization. Receives data passed from scene.launch()
    init(data) {
        // Grab the data (dimensions and WorldScene reference) and save them to 'this'
        this.width = data.width;
        this.height = data.height;
        this.worldScene = data.worldScene;

        // Get the container element for the HTML menu (corrected ID)
        this.menuContainer = document.getElementById("gameOverMenu-menu");
        this.menuContainer.style.display = 'block';

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

        this.setGameOverMenu();
    }

    // Helper to attach listeners (must be called whenever HTML is re-rendered)
    attachButtonListeners() {
        this.respawnBtn = document.getElementById("respawn-btn");
        this.restartBtn = document.getElementById("restart-btn");

        if (this.respawnBtn) this.respawnBtn.addEventListener("click", () => this.askConfirmationRespawn());
        if (this.restartBtn) this.restartBtn.addEventListener("click", () => this.askConfirmationRestart());
    }

    // Auxiliar create function.
    setGameOverMenu() {
        // Use innerHTML on the container
        this.menuContainer.innerHTML =
            (
                // Outer wrapper uses Absolute Positioning and Flexbox for full-screen centering
                ` <!-- Outer Container -->
                <div id="initial-menu" class="initial-menu" >
                    <!-- Inner container for the buttons with styling -->
                    <div id="initial-menu-button-container"
                         class="initial-menu-button-container" >
                        <h1 id="main-title" > YOU DIED... </h1>
                        <h3> What would you like to do? </h3>
                        <button id="respawn-btn" class="menu-btn" > Respawn </button>
                        <button id="restart-btn" class="menu-btn" > Restart Game </button>
                    </div>
                </div>
            `
            );
        this.attachButtonListeners();
    }

    askConfirmationRespawn() {
        this.menuContainer.innerHTML =
            (
                ` <!-- Outer Container -->
                <div id="initial-menu" class="initial-menu" >
                    <div id="initial-menu-button-container"
                         class="initial-menu-button-container" >
                        <p> You can respawn with 1 lime coin.\nIf you do not have any, you will have to restart the game progress.\nDo you want to respawn? </p>
                        <p id="no-coins-respawn-alert" style="color: red; margin-bottom: 10px; display: none;"> 
                            You don't have any lime coins left! You will have to restart the game to keep playing... 
                        </p>
                        <button id="confirm-btn" class="menu-btn" > Yes </button>
                        <button id="cancel-btn" class="menu-btn" > No </button>
                    </div>
                </div>
            `
            );

        this.confirmBtn = document.getElementById("confirm-btn");
        this.cancelBtn = document.getElementById("cancel-btn");

        if (this.confirmBtn) this.confirmBtn.addEventListener("click", () => this.respawn());
        if (this.cancelBtn) this.cancelBtn.addEventListener("click", () => this.setGameOverMenu());
    }

    askConfirmationRestart() {
        this.menuContainer.innerHTML =
            (
                ` <!-- Outer Container -->
                <div id="initial-menu" class="initial-menu" >
                    <div id="initial-menu-button-container"
                         class="initial-menu-button-container" >
                        <p> Are you sure you want to restart your game?\nThis will completely reset all the progress you made </p>
                        <button id="confirm-btn" class="menu-btn" > Yes </button>
                        <button id="cancel-btn" class="menu-btn" > No </button>
                    </div>
                </div>
            `
            );

        this.confirmBtn = document.getElementById("confirm-btn");
        this.cancelBtn = document.getElementById("cancel-btn");

        if (this.confirmBtn) this.confirmBtn.addEventListener("click", () => this.restart());
        if (this.cancelBtn) this.cancelBtn.addEventListener("click", () => this.setGameOverMenu());
    }

    // Respawn in the tutorial zone.
    respawn() {
        if (this.worldScene.inventory.amountItem("coin") < 1) {
            console.log("No coins left!");
            const alertElement = document.getElementById("no-coins-respawn-alert");
            alertElement.style.display = 'block';
        } else {// Clear the menu HTML
            this.menuContainer.innerHTML = "";

            // Use the saved worldScene reference to resume it
            if (this.worldScene) {
                this.worldScene.inventory.updateItem("coin", -1);
                this.worldScene.scene.resume();
                this.worldScene.respawn();
            }

            this.scene.stop(); // Stop this scene.
        }
    }

    // Restarts the whole game from zero.
    async restart() {
        // Clear the menu HTML
        this.menuContainer.innerHTML = "";

        // Use the saved worldScene reference to resume it
        if (this.worldScene) {
            this.worldScene.scene.resume();
            this.worldScene.restart();
        }

        this.scene.stop(); // Stop this scene.
    }

}
