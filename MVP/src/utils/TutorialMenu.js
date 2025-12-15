class TutorialMenu extends Phaser.Scene {

    constructor() {
        super({ key: 'TutorialMenu' });
    }

    // Initialization. Receives data passed from scene.launch()
    init(data) {
        // Grab the data (dimensions and WorldScene reference) and save them to 'this'
        this.width = data.width;
        this.height = data.height;
        this.worldScene = data.worldScene;

        // Get the container element for the HTML menu (corrected ID)
        this.menuContainer = document.getElementById("tutorial-menu");

        // Calculate center coordinates as instance properties
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    // Phase 2: Creation. Called automatically by Phaser after init()
    create() {
        this.setTutorialMenuHTML();
        this.attachButtonListeners();
        this.add.rectangle(this.centerX, this.centerY, this.width, this.height, 0x000000, 0.6)
            .setDepth(100)
            .setScrollFactor(0);
    }

    // Helper to attach listeners (must be called whenever HTML is re-rendered)
    attachButtonListeners() {
        // Set listeners for the buttons.
        this.playBtn = document.getElementById("play-btn");

        if (this.playBtn) this.playBtn.addEventListener("click", () => this.startGame());
    }

    // Auxiliar create function.
    setTutorialMenuHTML() {
        // Use innerHTML on the container
        this.menuContainer.innerHTML =
            (
                // Outer wrapper uses Absolute Positioning and Flexbox for full-screen centering
                ` <!-- Outer Container -->
                <div id="tutorial-menu" class="initial-menu" >
                    <!-- Inner container for the buttons with styling -->
                    <div id="initial-menu-button-container"
                         class="initial-menu-button-container" >
                        <h1 id="main-title" >TUTORIAL</h1>
                        <p style="text-align: center;" > This is the game tutorial, where you may find the most relevant things about Lime World! </p>
                        <p style="text-align: center;" > The main creatures are limes, the blue droplet-like things that you may first find after this tutorial </p>
                        <p style="text-align: center;" > They will attack you, so be prepared to defend youself! </p>
                        <p style="text-align: center;" > If you kill the (movement and attack constrols pressing the key "Escape" once you end the tutorial), they will drop items </p>
                        <p style="text-align: center;" > You will be able to obtain lime blobs (which you will need further in your adventure) and lime coins (you will need one of these to respawn if you die) </p>
                        <p style="text-align: center;" > If you die and do not have any lime coins, you will have to restart your game progress, so always have some of these! </p>
                        <button id="play-btn" class="menu-btn" > Understood! </button>
                    </div>
                </div>
            `
            );
        // Re-attach listeners after rebuilding the HTML
        this.attachButtonListeners();
    }

    startGame() {
        this.menuContainer.innerHTML = "";

        const ui_container = document.getElementById("ui-container");
        ui_container.style.opacity = "1";

        if (this.worldScene) {
            this.worldScene.scene.resume();
        }

        this.scene.stop();
    }
}
