class WorldScene extends Phaser.Scene {

    // Basic map info.
    tileSize = 16;
    tilesWidth = 24;
    tilesHeight = 12;
    mapWidth = this.tileSize * this.tilesWidth;
    mapHeight = this.tileSize * this.tilesHeight;

    // We just leave the inventory and username mentioned.
    inventory;

    // Zone management attributes.
    actualZone = "tutorial";    // The initial zone will be the tutorial.
    newZone = null;

    // Enemy stats attributes.
    // We will have an array to store all of the actually active enemies.
    activeEnemies = [];

    // First, parameters for monsters stats.
    // We will use the limeMonster stats as a base, and use multipliers for other monsters.
    healthTutorial = 20;
    healthLeft = 25;
    healthRight = 30;
    damageTutorial = 3;
    damageLeft = 4;
    damageRight = 5;
    speedTutorial = 40;
    detectionDistance = 90;
    limeAttackDistance = 26;
    bigLimeHPMult = 3;
    bigLimeAPMult = 2;
    bigLimeSpeedMult = 0.8;
    dragonLimeHPMult = 1.5;
    dragonLimeAPMult = 2.5;
    dragonLimeSpeedMult = 1.45;

    // Depths.
    // We will habe smaller enemies on higher depths to show they are lighter.
    // Moreover, fliying enemies will be in higher depth levels.
    limeDepth = 5;
    bigLimeDepth = 2;
    dragonLimeDepth = 6;

    // Variables for npc logic.
    npcInteractionBoxes = [];
    activeNPC;

    // Construct a new scene.
    constructor() {
        super('world'); // Set this scene's id within superclass constructor.
        this.tile_size = 16;
    }

    // Open pause menu function.
    openPauseMenu() {
        this.scene.pause();  // First, pause actual scene.

        this.scene.launch('PauseMenu', {
            width: this.sys.game.config.width,
            height: this.sys.game.config.height,
            worldScene: this
        });
    }

    // Open Game Over Menu Function.
    openGameOverMenu() {
        this.scene.pause();

        this.scene.launch('GameOverMenu', {
            width: this.sys.game.config.width,
            height: this.sys.game.config.height,
            worldScene: this
        });
    }

    // Preload external game assets.
    preload() {
        // First load map related things.
        this.load.path = "docs/media/";                                 // Establish file path.
        this.load.tilemapTiledJSON("worldMap", "map/worldMap.json");    // Load JSON file.
        this.load.image("tileImage", "map/tiles/TileSet.png");          // Load tile images.

        // Load sounds.
        this.load.audio('theme_song', 'audio/music/theme_song.mp3');
        this.load.audio('anvil_sound', 'audio/effects/anvil_sound.mp3');

        // Now player animations.
        this.load.spritesheet('player', 'player/images/playerIdleAnimation.png', { frameWidth: 32, frameHeight: 32 });

        // Load the spirtesheet animations for the player.
        // First, walking animations.
        this.load.spritesheet("playerWalkRight", "player/images/playerWalkAnimation_Right.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("playerWalkLeft", "player/images/playerWalkAnimation_Left.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("playerWalkDown", "player/images/playerWalkAnimation_Down.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("playerWalkUp", "player/images/playerWalkAnimation_Up.png", { frameWidth: 32, frameHeight: 32 });

        // Then, attacking animations.
        this.load.spritesheet("playerAttackRight", "player/images/playerAttackAnimation_Right.png", { frameWidth: 50, frameHeight: 32 });
        this.load.spritesheet("playerAttackLeft", "player/images/playerAttackAnimation_Left.png", { frameWidth: 50, frameHeight: 32 });

        // Interaction exclamation spritesheet (a single image in this case.)
        this.load.spritesheet("interactionExclamationMark", "player/images/interactionExclamationMark.png", { frameWidth: 16, frameHeight: 16 });

        // Now the monster animations.
        // Lime Monster Animations.
        this.load.spritesheet("limeMonster", "enemies/limeMonster/limeMonsterIdleAnimation.png", { frameWidth: 48, frameHeight: 32 });

        // Walking animations.
        this.load.spritesheet("limeMonsterWalkAnimation", "enemies/limeMonster/limeMonsterWalkAnimation.png", { frameWidth: 48, frameHeight: 32 });
        this.load.spritesheet("limeMonsterWalkAnimation_Up", "enemies/limeMonster/limeMonsterWalkAnimation_Up.png", { frameWidth: 48, frameHeight: 32 });

        // Attack Animation.
        this.load.spritesheet("limeMonsterAttackAnimation_Left", "enemies/limeMonster/limeMonsterAttackAnimation_Left.png", { frameWidth: 48, frameHeight: 32 });
        this.load.spritesheet("limeMonsterAttackAnimation_Right", "enemies/limeMonster/limeMonsterAttackAnimation_Right.png", { frameWidth: 48, frameHeight: 32 });

        // Moreover, ncp animations.
        // Sage idle animation.
        this.load.spritesheet("sageIdle", "npcs/sage/sageIdleAnimation.png", { frameWidth: 32, frameHeight: 32 });

        // Blacksmith idle animation.
        this.load.spritesheet("blackSmithIdle", "npcs/blackSmith/blackSmithIdleAnimation.png", { frameWidth: 32, frameHeight: 32 });
    }

    /**
    *  CREATE FUNCTION
    */

    // Create the game data.
    create() {


        this.create_animations();           // We create the animations before anything else.
        this.create_map();                  // Main function that will create the map.

        this.player = new Player(this);     // Create the player.

        this.create_collisions();           // Create collisions.
        this.loadZone();

        this.setup_camera();
        this.create_npcs();

        this.createInitialMenu();
        //this.show_collisions();           // Show Collisions.

        this.createMusic();                 // To create and play in a loop main theme music in the background.
    }

    /**
    * 
    *  CREATE FUNCTION AUXILIARY METHODS
    * 
    */

    // Function to create and display the initial menu.
    createInitialMenu() {

        if (!this.scene.isActive('InitialMenu')) {

            // Launch the InitialMenu scene.
            this.scene.launch('InitialMenu', {
                width: this.sys.game.config.width,
                height: this.sys.game.config.height,
                worldScene: this
            });

            // Pause the WorldScene so the game logic stops while the menu is open.
            this.scene.pause();
        }

        this.input.keyboard.on('keydown-ESC', this.openPauseMenu, this); // Pause menu key listener.
    }

    // Auxiliar function to the the user name.
    async set_username(username) {
        this.username = username;
        this.inventory = await Inventory.create(this, this.username, this.player);
        this.inventory.renderStatBars();
        this.inventory.renderInventory();
    }

    createMusic() {
        this.bgMusic = this.sound.add('theme_song', {
            volume: 0.3,
            loop: true
        });


        this.bgMusic.play();
    }

    // Auxiliary function to create game npcs.
    create_npcs() {
        // This function will consist on a more manual work, since each npc is different and unique.
        // Moreover, npcs will always be loaded in the map even if they are out of the viewsight.
        // This makes the logic way easier and is not a problem since we do not have a big amount of them.

        // Create empty list to add all of the npcs.
        this.npcs = [];

        // Create first NPC, the sage.
        const sageStart = this.map.findObject('npcItems', obj => {
            return obj.name === "sageSpawn";
        });

        this.sageNPC = new Sage(this, sageStart.x, sageStart.y, "sageIdle", "sage_idle_anim", "SAGE_NPC", 1 /* Depth, same as player */);
        this.sageNPC.body.setImmovable(true); // So that we cannot move the sage.
        this.npcs.push(this.sageNPC);

        // Now, the npc interaction box.
        const interactionBoxRadius = 27;
        const sageInteraction = this.map.findObject('npcItems', obj => {
            return obj.name === "sageInteract";
        });

        this.sageInteractionBox = this.physics.add.sprite(
            sageInteraction.x + 10,
            sageInteraction.y + 10,
            null,
        ).setVisible(false)
            .setImmovable(true)
            .setCircle(interactionBoxRadius)
            .setDepth(110);

        // Now, make this overlap with the player.
        this.physics.add.overlap(
            this.sageInteractionBox,
            this.player,
            () => {
                this.player.showInteractionSign();
                this.activeNPC = this.sageNPC;
            },
            null,
            this
        );

        // Second NPC, the blacksmith.
        const blackSmithStart = this.map.findObject('npcItems', obj => {
            return obj.name === "blackSmithSpawn";
        });

        this.blackSmithNPC = new BlackSmith(this, blackSmithStart.x, blackSmithStart.y, "blackSmithIdle", "blackSmith_idle_anim", "BLACKSMITH_NPC", 1 /* Depth, same as player */);
        this.blackSmithNPC.body.setImmovable(true);
        this.npcs.push(this.blackSmithNPC);

        // Now, the npc interaction box.
        const blackSmithInteraction = this.map.findObject('npcItems', obj => {
            return obj.name === "blackSmithInteract";
        });

        this.blackSmithInteractionBox = this.physics.add.sprite(
            blackSmithInteraction.x + 10,
            blackSmithInteraction.y + 10,
            null,
        ).setVisible(false)
            .setImmovable(true)
            .setCircle(interactionBoxRadius)
            .setDepth(110);

        this.physics.add.overlap(
            this.blackSmithInteractionBox,
            this.player,
            () => {
                this.player.showInteractionSign();
                this.activeNPC = this.blackSmithNPC;
            },
            null,
            this
        );

        this.physics.add.collider(this.player, this.npcs);
    }

    create_animations() {

        /**
        * 
        * PLAYER ANIMATIONS
        * 
        */
        // Idle animation.
        this.anims.create({
            key: 'player_idle_anim',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 4 }),
            frameRate: 6,
            repeat: -1
        });

        // Player Animation Stats.
        const playerWalkHorizontalFrameRate = 10;
        const playerWalkVerticalFrameRate = 7;
        const playerAttackFrameRate = 5;
        const playerWalkHorizontalFrames = { start: 0, end: 9 };
        const playerWalkVerticalFrames = { start: 0, end: 3 };
        const playerAttackFrames = { start: 0, end: 2 };

        this.anims.create({
            key: 'player_walkRight_anim',
            frames: this.anims.generateFrameNumbers('playerWalkRight', playerWalkHorizontalFrames),
            frameRate: playerWalkHorizontalFrameRate,
            repeat: -1
        });

        this.anims.create({
            key: 'player_walkLeft_anim',
            frames: this.anims.generateFrameNumbers('playerWalkLeft', playerWalkHorizontalFrames),
            frameRate: playerWalkHorizontalFrameRate,
            repeat: -1
        });

        this.anims.create({
            key: 'player_walkDown_anim',
            frames: this.anims.generateFrameNumbers('playerWalkDown', playerWalkVerticalFrames),
            frameRate: playerWalkVerticalFrameRate,
            repeat: -1
        });

        this.anims.create({
            key: 'player_walkUp_anim',
            frames: this.anims.generateFrameNumbers('playerWalkUp', playerWalkVerticalFrames),
            frameRate: playerWalkVerticalFrameRate,
            repeat: -1
        });

        // Attack Animations.
        this.anims.create({
            key: 'player_attackRight_anim',
            frames: this.anims.generateFrameNumbers('playerAttackRight', playerAttackFrames),
            frameRate: playerAttackFrameRate,
            repeat: 0
        });

        this.anims.create({
            key: 'player_attackLeft_anim',
            frames: this.anims.generateFrameNumbers('playerAttackLeft', playerAttackFrames),
            frameRate: playerAttackFrameRate,
            repeat: 0
        });

        /**
        * 
        * NPC ANIMATIONS
        * 
        */

        /**
        * SAGE
        */

        const sageIdleFrameRate = 3;
        const sageIdleFrames = { start: 0, end: 4 };

        this.anims.create({
            key: 'sage_idle_anim',
            frames: this.anims.generateFrameNumbers('sageIdle', sageIdleFrames),
            frameRate: sageIdleFrameRate,
            repeat: -1
        });

        /**
        * BlackSmith
        */

        const blackSmithIdleFrameRate = 2;
        const blackSmithIdleFrames = { start: 0, end: 4 };

        this.anims.create({
            key: 'blackSmith_idle_anim',
            frames: this.anims.generateFrameNumbers('blackSmithIdle', sageIdleFrames),
            frameRate: sageIdleFrameRate,
            repeat: -1
        });

        /**
        * 
        * MONSTER ANIMATIONS
        * 
        */

        /**
        * LIME MONSTER
        */

        // Stats.
        const limeMonsterIdleFrameRate = 4;
        const limeMonsterIdleFrames = { start: 0, end: 4 };
        const limeMonsterWalkFrameRate = 12;
        const limeMonsterWalkFrames = { start: 0, end: 14 };
        const limeMonsterAttackFrameRate = 12;
        const limeMonsterAttackFrames = { start: 0, end: 13 };

        this.anims.create({
            key: 'limeMonster_idle_anim',
            frames: this.anims.generateFrameNumbers('limeMonster', limeMonsterIdleFrames),
            frameRate: limeMonsterIdleFrameRate,
            repeat: -1
        });

        this.anims.create({
            key: 'limeMonster_walk_anim',
            frames: this.anims.generateFrameNumbers('limeMonsterWalkAnimation', limeMonsterWalkFrames),
            frameRate: limeMonsterWalkFrameRate,
            repeat: -1
        });

        this.anims.create({
            key: 'limeMonster_walkUp_anim',
            frames: this.anims.generateFrameNumbers('limeMonsterWalkAnimation_Up', limeMonsterWalkFrames),
            frameRate: limeMonsterWalkFrameRate,
            repeat: -1
        });

        this.anims.create({
            key: 'limeMonster_attackRight_anim',
            frames: this.anims.generateFrameNumbers('limeMonsterAttackAnimation_Right', limeMonsterAttackFrames),
            frameRate: limeMonsterAttackFrameRate,
            repeat: -1
        });

        this.anims.create({
            key: 'limeMonster_attackLeft_anim',
            frames: this.anims.generateFrameNumbers('limeMonsterAttackAnimation_Left', limeMonsterAttackFrames),
            frameRate: limeMonsterAttackFrameRate,
            repeat: -1
        });

    }

    // Create map.
    create_map() {

        this.map = this.make.tilemap({ key: "worldMap" });  // Map object from tilemap.

        // Add tileset images into map.
        // 1st Arg: Tileset name from Tiled
        // 2nd Arg: Image key from preload
        this.tileImages = this.map.addTilesetImage("tiles", "tileImage");

        // Create Layers.
        this.create_layers(this.tileImages);
    }

    // Auxiliar layer-creating function.
    create_layers(tileImages) {
        this.groundLayer = this.map.createLayer("Ground", tileImages, 0, 0);
        this.treeLayer = this.map.createLayer("Trees", tileImages, 0, 0);

        // Area delimiter layer.
        this.areaDelimiterLayer = this.map.getObjectLayer("areaDelimiters");

        // Make a group of physic objects for the area delimiters.
        this.areaDelimiters = this.physics.add.group({
            immovable: true,
            allowGravity: false,
            visible: false
        });

        // Add all of the area delimiters from the area delimiter as actual phaser sprites.
        this.areaDelimiterLayer.objects.forEach(object => {

            const areaDelimiter = this.physics.add.sprite(
                object.x + object.width / 2,    // Divided by two since tiled starts at corner, 
                object.y + object.height / 2,   // but phaser at the center.
                null // Null key for invisible sprite.
            )
                .setDisplaySize(object.width, object.height)
                .setVisible(false)
                .setImmovable(true);

            // Set the target area.
            areaDelimiter.setData("targetArea", object.properties.find(p => p.name === 'targetArea')?.value);

            // Store the the area delimiter.
            this.areaDelimiters.add(areaDelimiter);
        });
    }

    // Function to remove an actual enemy.
    remove_enemy(enemy) {
        const index = this.activeEnemies.findIndex(e => e === enemy);

        if (index != -1) {
            this.activeEnemies.splice(index, 1);
            enemy.endEnemy();
        }
    }

    // Create enemy functions by zones.
    // Tutorial.
    create_enemies_tutorial() {
        // Get coordinates from phaser.
        let startLimeTut1 = this.map.findObject('limeMonsters', obj => {
            return obj.name === "tut1";
        });

        // We are passing: (scene, x, y, id, depth, health, damage, speed, detDist, attDist)
        let limeTutorial1 = new limeMonster(this, startLimeTut1.x, startLimeTut1.y, "tut1", this.limeDepth, this.healthTutorial, this.damageTutorial, this.speedTutorial, this.detectionDistance, this.limeAttackDistance);

        let startLimeTut2 = this.map.findObject('limeMonsters', obj => {
            return obj.name === "tut2";
        });

        let limeTutorial2 = new limeMonster(this, startLimeTut2.x, startLimeTut2.y, "tut2", this.limeDepth, this.healthTutorial, this.damageTutorial, this.speedTutorial, this.detectionDistance, this.limeAttackDistance);

        // Add the enemies to their zone array (and to the active enemies array).
        this.activeEnemies.push(limeTutorial1, limeTutorial2)

        // Setup collisions
        if (this.activeEnemies.length > 0) {
            this.physics.add.collider(this.player, this.activeEnemies);
            this.physics.add.collider(this.activeEnemies, this.treeLayer);
        }
    }

    create_enemies_left() {
        for (let i = 1; i <= 10; ++i) {
            let limePosition = this.map.findObject("limeMonsters", obj => {
                return obj.name == "left" + i.toString();
            });

            let lime = new limeMonster(this, limePosition.x, limePosition.y,
                "left" + i.toString(), this.limeDepth, this.healthLeft, this.damageLeft, this.speedTutorial,
                this.detectionDistance, this.limeAttackDistance);

            this.activeEnemies.push(lime);
        }

        // Setup collisions
        if (this.activeEnemies.length > 0) {
            this.physics.add.collider(this.player, this.activeEnemies);
            this.physics.add.collider(this.activeEnemies, this.treeLayer);
        }
    }

    create_enemies_right() {
        for (let i = 1; i <= 11; ++i) {
            let limePosition = this.map.findObject("limeMonsters", obj => {
                return obj.name == "right" + i.toString();
            });

            let lime = new limeMonster(this, limePosition.x, limePosition.y,
                "right" + i.toString(), this.limeDepth, this.healthLeft, this.damageLeft, this.speedTutorial,
                this.detectionDistance, this.limeAttackDistance);

            this.activeEnemies.push(lime);
        }

        // Setup collisions
        if (this.activeEnemies.length > 0) {
            this.physics.add.collider(this.player, this.activeEnemies);
            this.physics.add.collider(this.activeEnemies, this.treeLayer);
        }
    }

    // Auxiliar collision detection function.
    create_collisions() {
        // First, we establish the needed collisions.
        //this.treeLayer.setCollision([65, 76]);
        this.treeLayer.setCollisionByExclusion([-1]); // Everything in tree layer has collision.

        // Then, we get them working.
        this.physics.add.collider(this.player, this.treeLayer);

        // Physics, but not physical collision.
        this.physics.add.overlap(this.player, this.areaDelimiters, this.onAreaEntrance, null, this);
    }

    // Listener for area entrance collisions.
    onAreaEntrance(player, areaEntrance) {

        this.newZone = areaEntrance.getData("targetArea");

        if (this.newZone !== this.actualZone) {

            // Unload the current zone's enemies.
            this.unloadZone();

            // Update the actual zone to the new one.
            this.actualZone = this.newZone;
            this.newZone = null;

            // Load the new zone's enemies.
            this.loadZone();
        }
    }

    // Load actual zone enemies.
    loadZone() {

        // Check if the current zone has an enemy array defined AND if it's empty
        if (this.actualZone === "tutorial") {
            this.create_enemies_tutorial();
        } else if (this.actualZone === "left") {
            console.log("Trying to create left enemies...");
            this.create_enemies_left();
        } else if (this.actualZone === "right") {
            console.log("Trying to create right enemies...");
            this.create_enemies_right();
        }

    }

    // Unload actual zone enemies.
    unloadZone() {

        while (this.activeEnemies.length > 0) {
            this.activeEnemies.pop().destroy();
        }
    }

    // Set up the camera to follow the
    setup_camera() {
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
    }

    // Function to see collisions.
    show_collisions() {
        // 1. Create a Graphics object to draw lines and shapes
        const debugGraphics = this.add.graphics().setAlpha(0.75);

        // 2. Tell the Tilemap layer to render its collision boxes to the Graphics object
        this.treeLayer.renderDebug(debugGraphics, {
            // 1st Color: White (for non-colliding tiles)
            tileColor: new Phaser.Display.Color(255, 255, 255, 255),

            // 2nd Color: Red (for the fill of colliding tiles)
            collidingTileColor: new Phaser.Display.Color(255, 0, 0, 255),

            // 3rd Color: Black (for the outline/face of collision boxes)
            faceColor: new Phaser.Display.Color(0, 0, 0, 255)
        });

        // 3. Enable physics debug for the player
        this.physics.world.createDebugGraphic();
    }


    /**
    *  UPDATE FUNCTION
    */

    // Update the game data.
    update() {
        this.player.move();     // Move the player.
        this.updateEnemiesAI();
    }

    // Auxiliar update function.
    updateEnemiesAI() {
        this.activeEnemies.forEach(e => e.updateAI());
    }


    /**
    * GAME STATE SAVING FUNCTIONS.
    */
    saveOnline() {
        if (this.inventory) {
            this.inventory.saveToCloud();
        }
    }

    saveOffline() {
        if (this.inventory) {
            this.inventory.saveToLocalStorage();
        }
    }

    /**
     * GAME OVER - REPAWN & RESTART SECTION
     */
    respawn() {
        let playerRespawn = this.map.findObject('playerItems', obj => {
            const typeProp = obj.properties?.find(p => p.name === 'type');
            return typeProp && typeProp.value === 'startPoint';
        });

        this.player.setPosition(playerRespawn.x, playerRespawn.y);

        this.health = this.max_health;
        this.inventory.updateStat("health", this.player.actualMaxHealth);
    }

    restart() { // Same as respawn but clearing inventory.
        let playerRespawn = this.map.findObject('playerItems', obj => {
            const typeProp = obj.properties?.find(p => p.name === 'type');
            return typeProp && typeProp.value === 'startPoint';
        });

        this.player.setPosition(playerRespawn.x, playerRespawn.y);

        this.health = this.max_health;
        this.inventory.updateStat("health", this.player.actualMaxHealth);
        this.inventory.clear();
    }

}
