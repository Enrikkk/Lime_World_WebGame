class JsonBinAdapter {
    
    // Bin id to access the data (everything is supposed to be completely public, 
    // so no access key is needed).
    static BIN_ID = '68ff49a943b1c97be98458eb'; 
    static API_URL = `https://api.jsonbin.io/v3/b/${JsonBinAdapter.BIN_ID}`;

    // Loads inventory from the cloud.
    async loadData() {
        try {
            const response = await fetch(JsonBinAdapter.API_URL, {
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
        try {
            const response = await fetch(JsonBinAdapter.API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                console.log("Inventory successfully uploaded to JSONBin (Cloud Write).");
                return true;
            } else {
                const errorText = await response.text();
                console.error(`JSONBin PUT failed (${response.status}): ${errorText}`);
                return false;
            }
        } catch (error) {
            console.error("Network error during JSONBin PUT:", error);
            return false;
        }
    }
}
