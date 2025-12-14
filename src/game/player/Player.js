class Player extends Phaser.Physics.Arcade.Sprite
{
    // Important variables for data manipulation
    INITIAL_MAX_HEALTH = 25;
    INITIAL_DAMAGE = 8;
    
    actualMaxHealth = this.INITIAL_MAX_HEALTH;
    actualMaxDamage = this.INITIAL_DAMAGE;
    
    // Player stats.
    speed = 80;
    damage = 8;
    health = 25;
    
    // State flag to manage attack animations.
    isAttacking = false;
    
    // Track last direction for idle/attack animation direction
    lastDirection = 'down';
    
    // Offset collisionand size values, used later.
    offsetX = 10;
    offsetY = 13;
    sizeX = 11;
    sizeY = 19;

    // For NPC interaction.
    dialogBox;
    onInteraction = false;

    
    constructor(scene)
    {
        // Call super constructor with the player image stated at preload.
        super(scene, 0, 0, 'player');
        
        // Connect tiled to phaser.
        let startObj = scene.map.findObject('playerItems', obj => {
            const typeProp = obj.properties?.find(p => p.name === 'type');
            return typeProp && typeProp.value === 'startPoint';
        });
        
        // Get the initial player position.
        this.x = startObj.x;
        this.y = startObj.y;
        
        // Set layer depth.
        this.depth = 1;
        
        // Important, add player to the scene.
        scene.add.existing(this);
        
        // Add physics.
        scene.physics.add.existing(this);
        
        // Let's implement custom size physics.
        this.body.setSize(this.sizeX, this.sizeY);
        this.body.setOffset(this.offsetX, this.offsetY);
        
        // Add movement and attacks.
        this.keys = {
            W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            pointer: scene.input.activePointer
        };
        
        // Set up the listeners for when the attack animation finishes
        this.setAttackListeners();
        
        // To make the interaction sign management easier, it will be created here, so that 
        // whenever it is activated, we just have to make it visible.
        this.interactionExclamationMark = this.scene.add.image(this.x, this.y+20, "interactionExclamationMark");
        this.interactionExclamationMark.setOrigin(0, 0);
        this.interactionExclamationMark.setVisible(false);
        this.interactionExclamationMark.setDepth(200);
        
        this.showInteractionSign = this.showInteractionSign.bind(this);
        this.hideInteractionSign = this.hideInteractionSign.bind(this);
        this.checkInteraction = this.checkInteraction.bind(this);
        
        this.inInteractionZone = false;
        this.wasInInteractionZone = false;
    }
    
    // Attack listener to reset flag when attack animation finishes.
    setAttackListeners() {
        
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim, frame) => {
            // Check if the completed animation was an attack animation.
            if (anim.key.startsWith('player_attack')) {
                this.isAttacking = false;
            }
        });
    }
    
    // Function to make the player move.
    move() {
        
        // Stop movement if currently attacking or interacting with an NPC.
        if (this.isAttacking || this.onInteraction) {
            this.body.setVelocity(0);
            return; // Skip movement and input checks below
        }
        
        // Reset player velocity
        this.body.setVelocity(0);
        let animationKey = "";
        
        // Check attack before movement logic.
        if (this.scene.input.activePointer.leftButtonDown()) {
            this.attack();
        } else {
            // Movement logic.
            if (this.keys.W.isDown) { 
                this.body.setVelocityY(-this.speed);
                this.lastDirection = 'up';
                if (this.keys.A.isDown) { 
                    this.body.setVelocityX(-this.speed); 
                    animationKey = "player_walkLeft_anim";
                } else if(this.keys.D.isDown) {
                    this.body.setVelocityX(this.speed);
                    animationKey = "player_walkRight_anim";
                } else
                    animationKey = "player_walkUp_anim";
            } else if(this.keys.S.isDown) {
                this.body.setVelocityY(this.speed);
                this.lastDirection = 'down';
                if (this.keys.A.isDown) { 
                    this.body.setVelocityX(-this.speed); 
                    animationKey = "player_walkLeft_anim";
                } else if(this.keys.D.isDown) {
                    this.body.setVelocityX(this.speed);
                    animationKey = "player_walkRight_anim";
                } else 
                    animationKey = "player_walkDown_anim";
            } else if(this.keys.A.isDown) {
                this.body.setVelocityX(-this.speed);
                this.lastDirection = 'left';
                animationKey = "player_walkLeft_anim";
            } else if(this.keys.D.isDown) {
                this.body.setVelocityX(this.speed);
                this.lastDirection = 'right';
                animationKey = "player_walkRight_anim";
            }
            
            // Normalize the velocity vector, to make speed to every direction the same.
            this.body.velocity.normalize().scale(this.speed);
        }
        
        // Execute animations.
        if (this.isAttacking) {
            // If the attack flag is true, prioritize the attack animation.
            this.playAttackAnimation();
            return; // Exit here to prevent playing walk/idle.
        }
        
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            // Player is moving: play the correct walk animation
            this.anims.play(animationKey, true);
        } else {
            // Player is idle: play the correct idle animation based on last direction
            this.anims.play("player_idle_anim", true); // Assuming single idle animation for now
        }
        
        // Logic for npc interaction.
        if(!this.inInteractionZone && this.wasInInteractionZone) {
            this.hideInteractionSign();
        }
        
        this.wasInInteractionZone = this.inInteractionZone;
        
        this.inInteractionZone = false;
    }
    
    // Function to show the interaction sign over the player's head.
    showInteractionSign() {
        this.inInteractionZone = true;
        this.interactionExclamationMark.setPosition(this.x - 9.5, this.y - 22);
        this.interactionExclamationMark.setVisible(true);
        
        document.addEventListener("keydown", this.checkInteraction);
    }
    
    // Auxiliar function for interaction with npc event listener.
    checkInteraction(event) {
        if (event.code === "Space") {
            if(this.scene.activeNPC instanceof Sage) {
                if(!this.onInteraction) {
                this.anims.play("player_idle_anim", true);
                this.onInteraction = true;
                event.preventDefault(); 
                this.scene.activeNPC.talkTo();
                } else {
                    this.onInteraction = false;
                    event.preventDefault();
                    this.dialogBox = document.getElementById("dialog-box");
                    this.dialogBox.classList.add("hidden");
                }
            } else if(this.scene.activeNPC instanceof BlackSmith) {
                    if(!this.onInteraction) {
                    this.anims.play("player_idle_anim", true);
                    this.onInteraction = true;
                    event.preventDefault(); 
                    this.scene.activeNPC.talkToInit();
                } else {
                    if(this.scene.activeNPC.dialogs.length == 0) {
                        this.onInteraction = false;
                        event.preventDefault();
                        this.dialogBox = document.getElementById("dialog-box");
                        this.dialogBox.classList.add("hidden");
                    } else {
                        this.scene.activeNPC.talkToEnd();
                    }
                }
            }
        }
    }
    
    // Function to hide the interaction sign from over the player's head.
    hideInteractionSign() {
        this.inInteractionZone = false;
        this.interactionExclamationMark.setVisible(false);

        document.removeEventListener("keydown", this.checkInteraction);
    }
    
    // Function that handles the attack logic and starts the attack animation.
    attack(){
        
        /**
        * ANIMATION LOGIC.
        */
        
        // Prevent starting a new attack if one is already playing.
        if (this.isAttacking) return; 
        
        this.isAttacking = true;
        this.body.setVelocity(0); // Stop movement immediately.
        
        // Determine attack animation based on the last direction faced.
        let attackKey;
        if (this.keys.A.isDown || this.lastDirection === "left") {
            attackKey = "player_attackLeft_anim";
        } else {
            // Use 'right' as the default for right, up, and down facing attacks
            attackKey = "player_attackRight_anim";
        }
        
        // Play the determined attack animation
        this.anims.play(attackKey, true);
        
        // We correct the player collision box.
        this.setOffset(this.offsetX + 10, this.offsetY);
        
        const attackWidth = 22;
        const attackHeight = 24;
        let areaX = 0;
        let areaY = 0;
        
        // Area damage varies depending on the direction of the attack.
        if(attackKey === "player_attackRight_anim") {
            areaX = this.x + 5 + this.sizeX;
            areaY = this.y + 5;
        } else {
            areaX = this.x - this.sizeX - 5;
            areaY = this.y + 5;
        }
        
        // Add the hitbox to the actual scene.
        const areaDamage = this.scene.physics.add.sprite(
            areaX,
            areaY,
            null,
        ).setDisplaySize(attackWidth, attackHeight)
        .setVisible(false);
        
        // Now, make this overlap with the enemies.
        this.scene.physics.add.overlap(
            areaDamage, 
            this.scene.activeEnemies, 
            this.dealDamageToEnemy,
            null, 
            this
        );
        
        this.scene.time.delayedCall(
            200,
            () => {
                areaDamage.destroy();
            },
            [],
            this.scene
        );
        
        // Set back the offset.
        this.scene.time.delayedCall(
            570,
            () => {
                this.setOffset(this.offsetX, this.offsetY);
            },
            [],
            this.scene
        );
    }
    
    // Helper function.
    playAttackAnimation() {
        let attackKey;
        if (this.keys.A.isDown || this.lastDirection === 'left') {
            attackKey = "player_attackLeft_anim";
        } else {
            attackKey = "player_attackRight_anim";
        }
        this.anims.play(attackKey, true);
    }
    
    // Function to actually reduce the enemies health.
    dealDamageToEnemy(hitbox, enemy) {
        
        if(!enemy.damageReceivedRecently) {
            
            /* Logic to apply knowback to enemy and player when attack enemy.
            const knockbackForce = 10;
            
            this.scene.tweens.add({
            targets: this,
            
            props: {
            x: -(enemy.x - hitbox.x) * knockbackForce,
            y: -(enemy.y - hitbox.y) * knockbackForce,
            },
            
            duration: 600,
            
            ease: 'Cubic.easeOut' 
            });
            
            this.scene.tweens.add({
            targets: enemy,
            
            props: {
            x: (enemy.x - hitbox.x) * knockbackForce,
            y: (enemy.y - hitbox.y) * knockbackForce,
            },
            
            duration: 600,
            
            ease: 'Cubic.easeOut' 
            });
            
            */
            
            enemy.takeDamage(this.damage);
            
            this.scene.time.delayedCall(
                200, // Duration in milliseconds.
                () => {
                    enemy.damageReceivedRecently = false;
                },
                [],
                this
            );
            
            this.scene.time.delayedCall(
                150, // Duration in milliseconds.
                () => {
                    // Check if the enemy is still alive before trying to stop its movement.
                    if (enemy.health > 0) {
                        enemy.body.setVelocity(0);
                    }
                },
                [],
                this
            );
        }
    }
}