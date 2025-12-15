// ABOUTME: Parent Class for All NPCs.

class NPC extends Phaser.Physics.Arcade.Sprite 
{
    constructor(scene, initialPositionX, initialPositionY, idleSpriteSheet, idleAnimKey, id, depth) {
        super(scene, initialPositionX, initialPositionY, idleSpriteSheet);

        this.scene = scene;
        this.x = initialPositionX;
        this.y = initialPositionY;
        this.idleSpriteSheet = idleSpriteSheet;
        this.idleAnimKey = idleAnimKey;
        this.id = id;
        this.depth = depth;

        // Add NPC to the scene.
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        // Keep it idle.
        this.anims.play(idleAnimKey);
    }

}