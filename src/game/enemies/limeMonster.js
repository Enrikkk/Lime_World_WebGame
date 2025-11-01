class limeMonster extends Enemy {
    constructor(scene, positionX, positionY, id, depth, health, damage, 
                speed, detectionDistance, attackDistance) {
        
        // The parent Enemy class expects 12 arguments:
        // (scene, x, y, idleSpriteSheet, id, type, depth, health, damage, speed, detDist, attDist)
        
        // We inject the missing idleSpriteSheet ("limeMonster") and type ("lime") strings 
        // to match the expected signature of the Enemy class.
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


        this.body.setSize(16, 15);
        this.body.setOffset(15, 7);
    }


    // Override Attack function to make custom attacks.
    attack() {
        // Call parent function to get basic checking logic.
        super.attack();

        this.scene.physics.add.sprite();
    }

    // Function to end the enemy and give items to the player.
    endEnemy() {
        this.scene.inventory.updateItem("lime-blob", Math.floor(Math.random() * 3));
        super.endEnemy();
    }
}