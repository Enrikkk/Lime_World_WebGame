// This is the inventory file.
// Here, we will handle the management of all of the data storage/loading logic.
// As it's name tells, it is in charge of the inventory, but we will also use this 
// to model the user's health bar.
// Basically, the inventory class, despite being called inventory.js, for a simpler 
// data handling process, will be in charge of all the data manipulation.

class Inventory {
    // First, inventory attributes.
    session_name;
    player;
    data;
    mySession;
    
    // To give a size to the stat bars.
    STAT_SCALE_MULTIPLIER = 4;
    
    // Function to create the inventory.
    // We model it based on whether the user initially decides to get it from localStorage 
    // or retrieve a session from JsonBin.
    constructor(scene, session_name, player) {
        
        this.session_name = session_name;
        this.player = player;
        this.scene = scene;
        
        /**
        * When creating the inventory, we will do a last write wins policy.
        * This will be implemented using a timestamp based method.
        * Therefore, when loading a game, the inventory version with the most recent time stamp
        * will be the one used.
        * 
        * This data merging model will be session based; if no data is found for the session_name 
        * introduced, then new data for a session is created.
        * However, sessions won't be private, you can join to whatever session has ever been 
        * created in the game history.
        */
        
        this.localStorageAdapter = new LocalStorageAdapter();
        this.jsonBinAdapter = new JsonBinAdapter();
        
        // First, we check what types of data are present, and act based on that.
        this.localData = this.localStorageAdapter.loadData();
        this.onlineData = this.jsonBinAdapter.loadData();
        if(!this.localData) { // If we don't have local data, we check for online data.
            if(!this.onlineData) { // If we don't also have online data, we establish an empty new game.
                this.data = {
                    "sessions": [
                        {
                            "session_name": this.session_name,
                            "time_stamp": Date.now(),
                            "position": {
                                "x": player.x,
                                "y": player.y
                            },
                            "stats": {
                                "health": player.health,
                                "damage": player.damage,
                                "maxHealth": player.actualMaxHealth
                            },
                            "items": {},
                            "control_items": {
                                "blacksmith_interaction_phase": 0
                            }
                        }
                    ]  
                };
            } else {
                this.data = this.onlineData;
                console.log("Data loaded from cloud - JsonBin.");
            }
        } else {
            this.data = this.localData;
            console.log("Data loaded from local storage.");
        }
        
        // Save a reference to the actual session.
        this.mySession = this.data.sessions.find(session => {
            return session.session_name === this.session_name;
        });
        
        // If we have data, but not an session with our name in it (most likely), 
        // our session will be created and added.
        if(!this.mySession) {
            const newSession = 
            {
                "session_name": this.session_name,
                "time_stamp": Date.now(),
                "position": {
                    "x": player.x,
                    "y": player.y
                },
                "stats": {
                    "health": player.health,
                    "damage": player.damage,
                    "maxHealth": player.actualMaxHealth
                },
                "items": {},
                "control_items": {
                    "blacksmith_interaction_phase": 0
                }
            }
            
            this.data.sessions.push(newSession);
            
            // Get a quick reference to it.
            this.mySession = this.data.sessions.find(session => {
                return session.session_name === this.session_name;
            });
        }
        
        if (!this.mySession.control_items) { // For developing purposes.
            this.mySession.control_items = {
                "blacksmith_interaction_phase": 0
            };
        }
        
        // Create Adapters now so that these can get the mySession variable as a paremeter 
        // to properly access the timestamp value.
        this.localStorageAdapter.communicateSession(this.mySession);
        this.jsonBinAdapter.communicateSession(this.mySession);
        
        this.renderInventory();
        this.saveToLocalStorage();
    }
    
    // Save to localStorage.
    saveToLocalStorage() {
        this.mySession.position.x = this.player.x;
        this.mySession.position.y = this.player.y;
        this.mySession.position.health = this.player.health;
        this.mySession.position.damage = this.player.damage;
        
        this.localStorageAdapter.saveData(this.data);
    }
    
    // Save to cloud.
    saveToCloud() {
        this.mySession.position.x = this.player.x;
        this.mySession.position.y = this.player.y;
        this.mySession.position.health = this.player.health;
        this.mySession.position.damage = this.player.damage;
        
        this.jsonBinAdapter.uploadData(this.data);
    }
    
    // Function to update player stats.
    // To subtract items, we just pass a negative number.
    updateStat(stat, quantity) {
        
        if(stat === "health") {
            this.mySession.stats[stat] += ((this.mySession.stats.health + quantity) > 
            this.player.maxActualhealth) ? (this.player.maxActualhealth - this.mySession.stats.health)
            : quantity;
        } else {
            this.mySession.stats[stat] += quantity;
        }
        
        this.mySession.stats[stat] = Math.max(0, this.mySession.stats[stat]);
        
        this.player.health = this.mySession.stats.health;
        this.player.damage = this.mySession.stats.damage;
        
        this.renderStatBars();
        this.saveToLocalStorage();

        if(stat == "health" && this.mySession.stats[stat] == 0) {
            this.scene.openGameOverMenu();
        }
    }
    
    // Function to update items.
    updateItem(item, quantity) {
        
        // If initially don't have any items of that type, initializa it to 0.
        this.mySession.items[item] = (this.mySession.items[item] ?? 0) + quantity;
        
        // Ensure quantity doesn't go below zero if subtracting.
        if (this.mySession.items[item] < 0) {
            this.mySession.items[item] = 0;
        }
        
        this.renderInventory();
        this.saveToLocalStorage();
    }
    
    // Function to completely clear your inventory.
    clear() {
        this.data = {
            "sessions": [
                {
                    "session_name": this.session_name,
                    "time_stamp": Date.now(),
                    "position": {
                        "x": player.x,
                        "y": player.y
                    },
                    "stats": {
                        "health": player.health,
                        "damage": player.damage,
                        "maxHealth": player.actualMaxHealth
                    },
                    "items": {},
                    "control_items": {
                        "blacksmith_interaction_phase": 0
                    }
                }
            ]  
        };

        this.localStorageAdapter.saveData();
        this.jsonBinAdapter.saveData();
    }
    
    updateControlItem(control_item, number) {
        this.mySession.control_items[control_item] = number;
        this.saveToLocalStorage();
    }
    
    // Get the amount of a stat.
    amountStat(stat) {
        return this.mySession.stats[stat];
    }
    
    // Get amount of an item.
    amountItem(item) {
        return this.mySession.items[item];
    }
    
    amountControlItem(control_item) {
        return this.mySession.control_items[control_item];
    }
    
    // Function to render stats bars.
    renderStatBars() {
        
        const container = document.getElementById("stat-bars");
        
        // First empty the html container (in case there is anything, which is unlikely).
        container.innerHTML = ``;
        const stats = this.mySession.stats;
        
        // Model stats bars.
        const name_header = document.getElementById("username-title");
        name_header.innerHTML = `${this.session_name}`;
        
        // Model Health bar.
        const currentHealth = stats.health;
        const maxHealth = stats.maxHealth;
        const healthContainerWidth = maxHealth * this.STAT_SCALE_MULTIPLIER;
        const healthFillPercentage = (currentHealth / maxHealth) * 100;
        
        container.innerHTML += `
                    <div class="stat-item mb-4">
                        <div class="stat-bar-wrapper" style="width: ${healthContainerWidth}px;">
                            <div class="stat-bar health-bar" style="width: ${healthFillPercentage}%;">
                                <span class="stat-text">${currentHealth} HP</span>
                            </div>
                        </div>
                    </div>
                `;
        
        // Model damage bar.
        const currentDamage = stats.damage;
        const damageContainerWidth = currentDamage * this.STAT_SCALE_MULTIPLIER;
        
        container.innerHTML += `
                    <div class="stat-item mb-4">
        
                        <div class="stat-bar-wrapper" style="width: ${damageContainerWidth}px;">
                            <div class="stat-bar damage-bar-fill" style="width: 100%;">
                                <span class="stat-text">${currentDamage} ATK</span>
                            </div>
                        </div>
                    </div>
                `;
    }
    
    // Function to render inventory in the designed container.
    renderInventory() {
        
        // Icon images.
        const itemIcons = {
            "coin": "docs/media/items/images/coin.png",
            "lime_blob": "docs/media/items/images/lime_blob.png"
        };
        
        // Used to find the "div" in HTML where we want to render out inventory.
        let container = document.getElementById("inventory");
        
        // If a place to render the inventory hasn't been asigned, then we return, not rendering anything,
        if (!container) return;
        
        container.innerHTML = "";
        
        const title = document.createElement("h3");
        title.className = "inventory-title";
        title.textContent = "INVENTORY";
        title.className = "panel-title"
        
        const itemsWrapper = document.createElement("div");
        itemsWrapper.className = "item-slots-wrapper";
        
        container.appendChild(title);
        container.appendChild(itemsWrapper);
        
        // If there is any item, we just render it.
        if (this.mySession.items) {
            for (const item in this.mySession.items) {
                
                // We create the div block that will contain the item slot.
                let slot = document.createElement("div");
                slot.className = "slot";                    // CSS stiling.
                
                let img = document.createElement("img");    // Create the item's "img" block.
                img.src = itemIcons[item];                  // Image source.
                img.alt = item;                             // Image name.
                slot.appendChild(img);                      // Append image in slot.
                
                // Creates a "div" block to show how many units of this item we have.
                let counter = document.createElement("p");
                counter.className = "count";
                counter.textContent = this.mySession.items[item];
                slot.appendChild(counter);                  // Append count into slot.
                
                itemsWrapper.appendChild(slot);                // Append slot in container (inventory bar) .
            }
        }
    }
    
}