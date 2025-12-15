// ABOUT ME: Class for the Sage NPC.

class Sage extends NPC 
{

    offsetX = 7;
    offsetY = 10;
    sizeX = 16;
    sizeY = 21;

    constructor(scene, initialPositionX, initialPositionY, idleSpriteSheet, idleAnimKey, id, depth) {
        super(scene, initialPositionX, initialPositionY, idleSpriteSheet, idleAnimKey, id, depth);

        this.body.setSize(this.sizeX, this.sizeY);
        this.body.setOffset(this.offsetX, this.offsetY);

        this.endDialog = this.endDialog.bind(this);

        this.generator = new SagePhraseGenerator();
    }

    // Function to handle the talking when speaking to this npc.
    async talkTo() {
        // First, we get the html elements.
        this.dialogBox = document.getElementById("dialog-box");
        var portraitImg = document.getElementById("talk-portrait"); 
        var name = document.getElementById("dialog-speaker");
        var dialogText = document.getElementById("dialog-text");

        // Now, set the corresponding elements.
        portraitImg.src = "docs/media/npcs/sage/sagePortraitIcon.png";
        name.textContent = "Sage"
        dialogText.textContent = await this.generator.fetchDailySecret();

        // Finally, make the box visible.
        this.dialogBox.classList.remove("hidden");

        this.scene.input.keyboard.on('keydown-SPACE', this.endDialog, this);
    }

    // Function to add the hide box event listener.
    endDialog(event) {
        
        if (event) {
            event.preventDefault();
        }
        console.log("Ending Dialog")
        this.dialogBox = document.getElementById("dialog-box");
        this.dialogBox.classList.add("hidden"); 
        this.scene.input.keyboard.off('keydown-SPACE', this.endDialog, this);
    }
}