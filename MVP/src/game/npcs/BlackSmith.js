// ABOUT ME: Class for the Sage NPC.

class BlackSmith extends NPC {

    // Location variables.
    offsetX = 7;
    offsetY = 10;
    sizeX = 16;
    sizeY = 21;

    // To handle the speaking logic.
    dialogs;

    constructor(scene, initialPositionX, initialPositionY, idleSpriteSheet, idleAnimKey, id, depth) {
        super(scene, initialPositionX, initialPositionY, idleSpriteSheet, idleAnimKey, id, depth);

        this.body.setSize(this.sizeX, this.sizeY);
        this.body.setOffset(this.offsetX, this.offsetY);
        this.endDialog = this.endDialog.bind(this);
    }

    // Function to handle the talking when speaking to this npc.
    talkToInit() {
        // First, we get the html elements.
        this.dialogBox = document.getElementById("dialog-box");
        var portraitImg = document.getElementById("talk-portrait");
        var name = document.getElementById("dialog-speaker");
        this.dialogText = document.getElementById("dialog-text");

        // Set speaking logic.
        this.interactionPhase = this.scene.inventory.amountControlItem("blacksmith_interaction_phase");

        // Now, set the corresponding elements.
        portraitImg.src = "docs/media/npcs/blackSmith/blackSmithPortraitIcon.png";
        name.textContent = "Blacksmith"
        this.getDialog();

        // Finally, make the box visible.
        this.dialogBox.classList.remove("hidden");

        var dialogText = document.getElementById("dialog-text");
        var text = this.dialogs.pop();

        if (text == "Well, now you might feel a little more confident") {
            var duration = 1500;

            this.scene.cameras.main.fadeOut(duration, 0, 0, 0);

            this.scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.scene.sound.play('anvil_sound', { volume: 1.0 });
                this.scene.inventory.updateStat("damage", 4);
                this.scene.inventory.updateItem("lime_blob", -30)
                this.scene.cameras.main.fadeIn(duration, 0, 0, 0);
            });
        }

        dialogText.textContent = text;
    }

    talkToEnd() {
        var dialogText = document.getElementById("dialog-text");
        dialogText.textContent = this.dialogs.pop();
    }

    // Main function to model the dialog with the blacksmith.
    getDialog() {
        this.dialogs = [];

        if (this.interactionPhase == 0) {
            this.dialogs.unshift("Hi, nice you see you adventurer!\nWhat is your name?");
            this.dialogs.unshift(". . .");
            this.dialogs.unshift("It looks like you don't speak much...\nI am the blacksmith, by the way");
            this.dialogs.unshift("If you want a mission, talk to me again...");
            this.interactionPhase = 1;
        } else if (this.interactionPhase == 1) {
            this.dialogs.unshift("Hmmmmm... It looks like someone wants a mission!");
            this.dialogs.unshift("Well, I hope you are good dealing with these lime guys, the blue thingies that are all over this kingdom");
            this.dialogs.unshift("My daughter has been sick for the past weeks, and it doesn't look like she is getting any better");
            this.dialogs.unshift("They also say that these limes have curative properties");
            this.dialogs.unshift("If you really want to have a cool mission, bring me 30 \"lime blobs\"");
            this.dialogs.unshift("Yeah, you heard (or read) correctly, lime blobs, these are the blue items that these lime monsters drop when defeated");
            this.dialogs.unshift("I think that with 30 of them I will be able to make a cure for my daughter")
            this.dialogs.unshift("You can kill the ones you found down there many times by just exiting that area and entering back in...\n(I don't know where they come from to be honest)")
            this.dialogs.unshift("If you complete the mission, I may improve your weapon ;-)");
            this.interactionPhase = 2;
        } else if (this.interactionPhase == 2) {

            let numBlobs = this.scene.inventory.amountItem("lime_blob");

            if (numBlobs == 0) {
                this.dialogs.unshift("It looks like you still don't have any lime blobs...");
                this.dialogs.unshift("If you really want to upgrade your weapon, bring me 30 of those");
            } else if (numBlobs > 0 && numBlobs < 30) {
                this.dialogs.unshift("It looks like you got some lime blobs...\nBring me 30 to upgrade your weapon");
            } else if (numBlobs >= 30) {
                this.dialogs.unshift("You brought me 30 lime blobs, these will really help me curing my daughter!");
                this.dialogs.unshift("But a deal is a deal, I will update your weapon first");
                this.dialogs.unshift("Well, now you might feel a little more confident")
                this.dialogs.unshift("Moreover, you may have defeated the... game?")
                this.dialogs.unshift("I don't know why I said that, it just popped into my head, this is not a game, it is the real world, righ?")
                this.dialogs.unshift("Whatever...\nNow, go there and test your new sword with those limes!")

                this.interactionPhase = 3;
            }
        } else if (this.interactionPhase == 3) {
            this.dialogs.unshift("I am working on the cure for my daughter, thank you for those lime blobs!")
        }

        this.scene.inventory.updateControlItem("blacksmith_interaction_phase", this.interactionPhase);
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