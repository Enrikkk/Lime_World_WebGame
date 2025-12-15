// First, we establish the game configurations.
var config =
{
    type: Phaser.CANVAS,    // HTML Rendering API.
    width: 16 * 18,         // 16 pixels/tile and 24 width tiles = 384.
    height: 16 * 10,        // 16 pixels/tile and 12 lenght tiles = 192.
    pixelArt: true,         // This optimizes the game for pixel art.

    parent: "game-container", // To give an id to the container of the game screen.

    scene:      // Game Scenes.
        [
            WorldScene,
            InitialMenu,
            PauseMenu,
            GameOverMenu,
            TutorialMenu
        ],

    // In order to center the map in the browser.
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },


    physics: { default: 'arcade', arcade: { gravity: 0 } } // Physics for collisions only, no gravity.
};

// Finally, we create the game using the previous configurations.
var game = new Phaser.Game(config);