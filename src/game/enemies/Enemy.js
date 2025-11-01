// Main Class for enemy logic.

class Enemy extends Phaser.Physics.Arcade.Sprite {

    // Function to control not receive multiple hits from just once.
    damageReceivedRecently = false;

    // This constructor receives 12 arguments.
    constructor(scene, positionX, positionY, idleSpriteSheet, id, type, depth, health, damage, 
                speed, detectionDistance, attackDistance) {
        super(scene, positionX, positionY, idleSpriteSheet);

        // Save parameters.
        this.id = id;
        this.type = type;
        this.depth = depth;
        this.health = health;
        this.damage = damage;
        this.speed = speed;
        this.player = this.scene.player; 

        // Initial position parameters to go back to the initial place if 
        // player out of sight.
        this.initialX = positionX;
        this.initialY = positionY;

        // AI Configuration.
        this.state = "IDLE";
        this.detectionDistance = detectionDistance;
        this.attackDistance = attackDistance;

        // Add the monster to the scene and enable physics.
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    // Function to calculate the distance from the player.
    getDistanceFromPlayer() {
        if(!this.player) return Infinity;
        // Correct distance syntax: (x1, y1, x2, y2)
        return Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
    }
    
    // Stops the enemy's movement.
    stopMovement() {
        if(this.body) {
            this.body.setVelocity(0, 0);
        }
    }

    // Main AI updating function, called every frame.
    updateAI() {
        const distance = this.getDistanceFromPlayer();
        const distanceToStart = Phaser.Math.Distance.Between(this.x, this.y, this.initialX, this.initialY);
        const stopTolerance = 2; // For returning state.

        if(this.state === "RETURNING") {
            if (distanceToStart <= stopTolerance) {
                // When within tolerance, snap to start, stop movement, and switch to IDLE.
                this.x = this.initialX; 
                this.y = this.initialY; 
                this.stopMovement();
                this.state = "IDLE";
                return;
            } else {
                // Keep moving towards the initial point until stop condition is met.
                this.returnToStartPoint();
            }
        }

        if(distance > this.detectionDistance) {
            // Player is outside detection range.
            if(this.state !== "IDLE" && this.state !== "RETURNING") {
                this.state = "RETURNING";
                this.returnToStartPoint(); 
            } else if (this.state === "IDLE") {
                this.stopMovement(); // Only stop when confirmed IDLE and out of range.
            }
        } else {
            // Player is inside detection range
            if(distance > this.attackDistance && this.state !== "CHASING") { 
                this.state = "CHASING"
                this.chasePlayer();
            } else if(distance <= this.attackDistance && this.state !== "ATTACKING") { 
                this.state = "ATTACKING";
                this.attack();
            } else if (this.state === "CHASING") {
                this.chasePlayer(); // Continue chasing.
            } else if (this.state === "ATTACKING") {
                this.attack(); // Hold position and attack.
            }
        }
    }

    // Function to make the enemy return to the start point (Only applies the movement).
    returnToStartPoint() {
        const target = new Phaser.Math.Vector2(this.initialX, this.initialY);
        this.scene.physics.moveToObject(this, target, this.speed);
    }

    // Function to chase the player.
    chasePlayer() {
        if (!this.player) return;

        this.scene.physics.moveToObject(this, this.player, this.speed);
    }

    // Function to attack the player (Only applies the velocity stop).
    attack() {
        if(!this.player || !this.body) return;

        this.stopMovement();

        // Attack Logic.
        console.log("Enemy ", this.id, " attacks!");

        // Let's create an overlap box that will be usefult to simulate the 
        // area damage inflinged by the user.
        const areaDamage = this.scene.add.sprite(

        )
    }

    // Function to receive damage.
    takeDamage(damage) {
        this.damageReceivedRecently = true;
        this.health -= damage;
        console.log("Enemy ", this.id, " received ", damage, " damage, health is now ", this.health);
        if(this.health <= 0) {
            this.endEnemy();
        }
    }

    endEnemy() {
        this.destroy();
    }
    
}
