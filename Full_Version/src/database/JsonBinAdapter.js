class JsonBinAdapter {

    // Bin id to access the data (everything is supposed to be completely public, 
    // so no access key is needed).
    static BIN_ID = '68ff49a943b1c97be98458eb';
    static API_URL_READ = `https://api.jsonbin.io/v3/b/${JsonBinAdapter.BIN_ID}/latest`;
    static API_URL_WRITE = `https://api.jsonbin.io/v3/b/${JsonBinAdapter.BIN_ID}`;
    static ACCESS_KEY = '$2a$10$WAwHAl7XW53B7krfmiQLrOfqbxpgr3NppMoGLQs3w.g0SBonAzVIq';

    // Function called from the inventory so that the adapter may have quick access 
    // to the actual session.
    communicateSession(mySession) {
        this.mySession = mySession;
    }

    // Loads inventory from the cloud.
    async loadData() {
        try {
            const response = await fetch(JsonBinAdapter.API_URL_READ, {
                method: 'GET',
            });

            if (!response.ok) {
                console.error(`JSONBin GET error: ${response.statusText}`);
                return null;
            }

            const json = await response.json();

            return json.record; // Get just the data, not the metadata.

        } catch (error) {
            console.error("Network error during JSONBin GET:", error);
            return null;
        }
    }

    // Save inventory to the cloud.
    async uploadData(data) {
        const oldStamp = this.mySession.time_stamp; // To recover old time stamp in case of error.
        try {
            this.mySession.time_stamp = Date.now()

            const response = await fetch(JsonBinAdapter.API_URL_WRITE, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JsonBinAdapter.ACCESS_KEY,
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                console.log(`Inventory successfully uploaded to JSONBin. Timestamp: ${this.mySession.time_stamp}.`);
                return true;
            } else {
                this.mySession.time_stamp = oldStamp;
                const errorText = await response.text();
                console.error(`JSONBin PUT failed (${response.status}): ${errorText}`);
                return false;
            }
        } catch (error) {
            this.mySession.time_stamp = oldStamp;
            console.error("Network error during JSONBin PUT:", error);
            return false;
        }
    }
}
