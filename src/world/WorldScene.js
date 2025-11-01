class WorldScene extends Phaser.Scene {
    
    // Basic map info.
    tileSize = 16;
    tilesWidth = 24;
    tilesHeight = 12;
    mapWidth = this.tileSize*this.tilesWidth;
    mapHeight = this.tileSize*this.tilesHeight;
    
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
    damageTutorial = 3;
    speedTutorial = 40;
    detectionDistance = 75;
    limeAttackDistance = 15;
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
    
    // Construct a new scene.
    constructor() {
        super('world'); // Set this scene's id within superclass constructor.
        this.tile_size = 16;
    }
    
    // Open pause menu function.
    openPauseMenu() {
        this.scene.launch('PauseScene', {
            width: this.sys.game.config.width,
            height: this.sys.game.config.height,
            worldScene: this
        });
    }
    
    // Preload external game assets.
    preload()  {
        // First load map related things.
        this.load.path = "docs/media/";                                 // Establish file path.
        this.load.tilemapTiledJSON("worldMap", "map/worldMap.json");    // Load JSON file.
        this.load.image("tileImage", "map/tiles/TileSet.png");          // Load tile images.
        
        // Now player animations.
        this.load.spritesheet('player', 'player/images&Animations/playerIdleAnimation.png', { frameWidth: 32, frameHeight: 32 });
        
        // Load the spirtesheet animations for the player.
        // First, walking animations.
        this.load.spritesheet( "playerWalkRight", "player/images&Animations/playerWalkAnimation_Right.png", {frameWidth: 32, frameHeight: 32} );
        this.load.spritesheet( "playerWalkLeft", "player/images&Animations/playerWalkAnimation_Left.png", {frameWidth: 32, frameHeight: 32} );
        this.load.spritesheet( "playerWalkDown", "player/images&Animations/playerWalkAnimation_Down.png", {frameWidth: 32, frameHeight: 32} );
        this.load.spritesheet( "playerWalkUp", "player/images&Animations/playerWalkAnimation_Up.png", {frameWidth: 32, frameHeight: 32} );
        
        // Then, attacking animations.
        this.load.spritesheet( "playerAttackRight", "player/images&Animations/playerAttackAnimation_Right.png", {frameWidth: 50, frameHeight: 32} );
        this.load.spritesheet( "playerAttackLeft", "player/images&Animations/playerAttackAnimation_Left.png", {frameWidth: 50, frameHeight: 32} );
        
        
        // Now the monster animations.
        // Lime Monster Animations.
        this.load.image("limeMonster", "enemies/limeMonster/limeMonster.png");
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
        
        this.createInitialMenu();
        // this.createInventory();          // Called once the game has already started.
        this.show_collisions();             // Show Collisions.
    }
    
    /**
    * 
    *  CREATE FUNCTION AUXILIARY METHODS
    * 
    */
    
    // Function to create and display the initial menu.
    createInitialMenu() {
        this.initialMenu = new InitialMenu(16*14, 16*10, this);
        
        if (!this.scene.isActive('InitialMenu')) {
            
            // Launch the InitialMenu scene.
            this.scene.launch('InitialMenu', { 
                width: this.sys.game.config.width,
                height: this.sys.game.config.height,
                worldScene: this
            });
            
            // Pause the WorldScene so the game logic stops while the menu is open.
            this.scene.pause();
            this.input.keyboard.on('keydown-ESC', this.openPauseMenu, this); // Pause menu key listener.
        }
    }

    // Function to create and display the inventory and stat bars.
    createInventory() {
        this.inventory = new Inventory(this.username, this.player);
        this.inventory.renderStatBars();
        this.inventory.renderInventory();
    }

    // Auxiliar function to the the user name.
    set_username(username) {
        this.username = username;
        this.inventory.session_name = username;
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
            frameRate: 7,
            repeat: -1
        });
        
        // Walk animations.
        const walkHorizontalFrameRate = 10;
        const walkVerticalFrameRate = 7;
        const attackFrameRate = 5;
        const walkHorizontalFrames = { start: 0, end: 9 };
        const walkVerticalFrames = { start: 0, end: 3 };
        
        this.anims.create({
            key: 'player_walkRight_anim',
            frames: this.anims.generateFrameNumbers('playerWalkRight', walkHorizontalFrames),
            frameRate: walkHorizontalFrameRate,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player_walkLeft_anim',
            frames: this.anims.generateFrameNumbers('playerWalkLeft', walkHorizontalFrames),
            frameRate: walkHorizontalFrameRate,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player_walkDown_anim',
            frames: this.anims.generateFrameNumbers('playerWalkDown', walkVerticalFrames),
            frameRate: walkVerticalFrameRate,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player_walkUp_anim',
            frames: this.anims.generateFrameNumbers('playerWalkUp', walkVerticalFrames),
            frameRate: walkVerticalFrameRate,
            repeat: -1
        });
        
        // Attack Animations.
        this.anims.create({
            key: 'player_attackRight_anim',
            frames: this.anims.generateFrameNumbers('playerAttackRight', { start:0, end:2 }),
            frameRate: attackFrameRate,
            repeat: 0
        });
        
        this.anims.create({
            key: 'player_attackLeft_anim',
            frames: this.anims.generateFrameNumbers('playerAttackLeft', { start:0, end:2 }),
            frameRate: attackFrameRate,
            repeat: 0
        });
        
        
        /**
        * 
        * MONSTER ANIMATIONS
        * 
        */
        
        /**
        * LIME MONSTER
        */
        
        // IMPLEMENT.
        
    }
    
    // Create map.
    create_map() {
        
        this.map = this.make.tilemap({ key: "worldMap" });  // Map object from tilemap.
        
        // Add tileset images into map.
        // 1st Arg: Tileset name from Tiled
        // 2nd Arg: Image key from preload
        this.tileImages = this.map.addTilesetImage( "tiles", "tileImage" );
        
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
    
    // Create enemy functions by zones.
    // Tutorial.
    create_enemies_tutorial() {
        // Get coordinates from phaser.
        let startLimeTut1 = this.map.findObject('limeMonsters', obj => {
            return obj.name === "tut1";
        });
        
        // We are passing: (scene, x, y, id, depth, health, damage, speed, detDist, attDist)
        let limeTutorial1 = new limeMonster(this, startLimeTut1.x, startLimeTut1.y, "tut1", this.limeDepth, 
            this.healthTutorial, this.damageTutorial, this.speedTutorial, this.detectionDistance, this.limeAttackDistance);
            
            let startLimeTut2 = this.map.findObject('limeMonsters', obj => {
                return obj.name === "tut2";
            });
            
            let limeTutorial2 = new limeMonster(this, startLimeTut2.x, startLimeTut2.y,"tut2", this.limeDepth, 
                this.healthTutorial, this.damageTutorial, this.speedTutorial, this.detectionDistance, this.limeAttackDistance);
                
                // Add the enemies to their zone array (and to the active enemies array).
                this.activeEnemies.push(limeTutorial1, limeTutorial2)
                
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
                
                // Physics, but not physical collision (block movement between player and area delimiter object).
                this.physics.add.overlap(this.player, this.areaDelimiters, this.onAreaEntrance, null, this);
            }
            
            // Listener for area entrance collisions.
            onAreaEntrance(player, areaEntrance){
                
                this.newZone = areaEntrance.getData("targetArea");
                
                if(this.newZone !== this.actualZone) {
                    
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
                if(this.actualZone === "tutorial") {
                    this.create_enemies_tutorial();
                }
                // ELSE IF STATEMENT OF ENEMIES OF OTHER ZONES.
                
            }
            
            // Unload actual zone enemies.
            unloadZone() {
                
                while(this.activeEnemies.length > 0) {
                    this.activeEnemies.pop().destroy();
                }
            }
            
            // Set up the camera to follow the
            setup_camera()
            {
                this.cameras.main.startFollow(this.player);
                //this.cameras.main.setBounds(0,0, this.mapWidth, this.mapHeight);
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
                
                this.activeEnemies.forEach(object => object.updateAI());
                
            }
            
        }
        