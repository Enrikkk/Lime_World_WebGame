// Main Class for enemy logic.

class Enemy extends Phaser.Physics.Arcade.Sprite {

    // Function to control not receive multiple hits from just once.
    damageReceivedRecently = false;
    // To handle only dealing damage once per attack.
    canAttack = true;

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
        this.scene = scene;

        // Initial position parameters to go back to the initial place if 
        // player out of sight.
        this.initialX = positionX;
        this.initialY = positionY;

        // AI Configuration.
        this.state = "IDLE";
        this.detectionDistance = detectionDistance;
        this.attackDistance = attackDistance;

        // Add the monster to the scene and enable physics.
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
    }

    // Function to calculate the distance from the player.
    getDistanceFromPlayer() {
        if (!this.player) return Infinity;
        return Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
    }

    // Stops the enemy's movement.
    stopMovement() {
        if (this.body) {
            this.body.setVelocity(0, 0);
        }
    }

    // Main AI updating function, called every frame.
    updateAI(idleKey, moveRightKey, moveLeftKey, moveUpKey, attackLeftKey, attackRightKey) {
        if (this.health <= 0 || !this.active) {
            this.scene.remove_enemy(this);
            return;
        }

        // So that the enemy may complete the whole attacking animation before being able 
        // to go back to, for example, chasing the user.
        if (!this.canAttack) return;

        this.stopMovement();

        // Used to perform the attack animation
        if (this.body.velocity.x !== 0) {
            this.lastDirection = (this.body.velocity.x > 0) ? "right" : "left";
        } else if (this.player && this.getDistanceFromPlayer() <= this.detectionDistance) {
            this.lastDirection = (this.player.x > this.x) ? "right" : "left";
        }

        const distance = this.getDistanceFromPlayer();
        const distanceToStart = Phaser.Math.Distance.Between(this.x, this.y, this.initialX, this.initialY);
        const stopTolerance = 2;

        if (this.state === "RETURNING") {
            if (distanceToStart <= stopTolerance) {
                this.x = this.initialX;
                this.y = this.initialY;
                this.stopMovement();
                this.state = "IDLE";
                return;
            } else {
                this.returnToStartPoint();
            }
        }

        if (distance > this.detectionDistance) { // Player outside of detection range.
            if (this.state !== "IDLE" && this.state !== "RETURNING") {
                this.state = "RETURNING";
                this.returnToStartPoint();
            } else if (this.state === "IDLE") {
                this.stopMovement();
            }
        } else {
            // Player is inside detection range.

            if (distance <= this.attackDistance) {  // Player in attack range.
                this.stopMovement();
                if (this.canAttack) {
                    if (this.canAttack) {
                        this.state = "ATTACKING";
                        this.attack();
                    }
                }
            } else {
                // Just detection range, chase player.
                this.state = "CHASING";
                this.chasePlayer();
            }
        }

        if (this.state === "IDLE") {
            this.anims.play(idleKey, true);
        } else if (this.state === "CHASING" || this.state === "RETURNING") {
            if (this.body.velocity.y > 0) {
                if (this.body.velocity.x > 0) {
                    this.anims.play(moveRightKey, true);
                } else {
                    this.anims.play(moveLeftKey, true);
                }
            } else {
                this.anims.play(moveUpKey, true);
            }
        } else if (this.state === "ATTACKING") {
            this.playAttackAnimation(attackLeftKey, attackRightKey);
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

    // The attack logic is implemented at each different type of enemy.

    // Function to deal damage to the player.
    dealDamageToPlayer() {
        if (!this.player || !this.body || !this.scene) return;
        this.scene.inventory.updateStat("health", this.damage * (-1));

        // Show player red when damage dealt.
        this.player.setTint(0xff0000);
        if (this.scene) {
            this.scene.time.delayedCall(200, () => {
                if (this.active) {
                    this.player.clearTint();
                }
            });
        }
    }

    // Function to receive damage.
    takeDamage(damage) {
        this.damageReceivedRecently = true;
        this.health -= damage;

        // Show enemy red when damage receiced.
        this.setTint(0xff0000);
        if (this.scene) {
            this.scene.time.delayedCall(200, () => {
                if (this.active) {
                    this.clearTint();
                }
            });
        }
    }

    // Function to end the enemy.
    endEnemy() {
        this.destroy();
    }

}
