class LocalStorageAdapter {
    // Key to store data in local storage.
    static STORAGE_KEY = 'avengedLegend_game_inventory_save';

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
            localStorage.setItem(LocalStorageAdapter.STORAGE_KEY, JSON.stringify(data));
            console.log(`Local inventory saved. Timestamp: ${data.lastSyncTimestamp}`);
        } catch (e) {
            console.error("Error saving to local storage:", e);
        }
    }
}
