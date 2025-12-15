class limeMonster extends Enemy {
    constructor(scene, positionX, positionY, id, depth, health, damage, speed, detectionDistance, attackDistance) {

        super(
            scene,
            positionX,
            positionY,
            "limeMonster",
            id,
            "lime",
            depth,
            health,
            damage,
            speed,
            detectionDistance,
            attackDistance
        );

        this.attackCooldownDuration = 400;
        this.body.setSize(16, 15);
        this.body.setOffset(15, 7);
    }

    // UpdateAI function.
    updateAI() {
        super.updateAI("limeMonster_idle_anim", "limeMonster_walk_anim", "limeMonster_walk_anim", "limeMonster_walkUp_anim", "limeMonster_attackLeft_anim", "limeMonster_attackRight_anim");
    }

    // Override Attack function to make custom attacks.
    attack() {
        if (!this.player || !this.body || !this.scene || !this.canAttack) return;

        this.stopMovement();
        this.canAttack = false;
        this.body.setImmovable(true);

        // Attack Box Variables.
        const attackWidth = 16;
        const attackHeight = 15;
        let areaX = 0;
        let areaY = 0;

        // Area damage varies depending on the direction of the attack.
        if (this.lastDirection == "right") {
            areaX = this.x + 15;
            areaY = this.y;
        } else {
            areaX = this.x - 15;
            areaY = this.y;
        }

        this.scene.time.delayedCall(
            600,
            () => {
                if (!this.player || !this.body || !this.scene) return;
                // Create attack hitbox.
                const areaDamage = this.scene.physics.add.sprite(
                    areaX,
                    areaY,
                    null,
                ).setDisplaySize(attackWidth, attackHeight)
                    .setVisible(false)
                    .setImmovable(true);

                // Now, make this overlap with the enemies.
                this.scene.physics.add.overlap(
                    areaDamage,
                    this.scene.player,
                    (hitbox, player) => {   // The hitbox effect may be disabled once it hits the player one time.

                        if (hitbox.active) {
                            this.dealDamageToPlayer();
                            hitbox.destroy()
                        }

                    },
                    null,
                    this
                );

                // Destroy the area after some time.
                this.scene.time.delayedCall(
                    600,
                    () => {
                        if (!this.player || !this.body || !this.scene) return;

                        if (areaDamage.active) {
                            areaDamage.destroy();
                        }
                        this.canAttack = true;
                    },
                    [],
                    this.scene
                );
            },
            [],
            this.scene
        );



    }

    // Function to handle the attack animations.
    playAttackAnimation(attackLeftKey, attackRightKey) {
        if (this.lastDirection == "right") {
            this.anims.play(attackRightKey, true);
        } else {
            this.anims.play(attackLeftKey, true);
        }
    }

    // Function to end the enemy and give items to the player.
    endEnemy() {
        this.scene.inventory.updateItem("lime_blob", 1 + Math.floor(Math.random() * 2));
        this.scene.inventory.updateItem("coin", Math.floor(Math.random() * 2));
        super.endEnemy();
    }
}