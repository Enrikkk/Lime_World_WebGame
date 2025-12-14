class LocalStorageAdapter {
    // Key to store data in local storage.
    static STORAGE_KEY = 'avengedLegend_game_inventory_save';

    // Function called from the inventory so that the adapter may have quick access 
    // to the actual session.
    communicateSession(mySession) {
        this.mySession = mySession;
    }

    // Gets the latest data from the browser local storage.
    loadData() {
        const data = localStorage.getItem(LocalStorageAdapter.STORAGE_KEY);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                return null;
            }
        }
        return null; // Local storage empty.
    }

    // Saves actual data to local storage.
    saveData(data) {
        try {
            this.mySession.time_stamp = Date.now()
            localStorage.setItem(LocalStorageAdapter.STORAGE_KEY, JSON.stringify(data));
            console.log(`Local inventory saved. Timestamp: ${this.mySession.time_stamp}`);
        } catch (e) {
            console.error("Error saving to local storage:", e);
        }
    }
}
