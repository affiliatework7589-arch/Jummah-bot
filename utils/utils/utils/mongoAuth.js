const { MongoClient } = require('mongodb');

async function useMongoAuthState(mongoUri, sessionName) {
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db('baileys_auth');
    const credsCollection = db.collection('creds');

    let creds;
    try {
        creds = await credsCollection.findOne({ _id: sessionName });
        if (!creds) {
            creds = { _id: sessionName };
            await credsCollection.insertOne(creds);
        }
    } catch (err) {
        console.error(`Failed to load creds for ${sessionName}:`, err.message);
        creds = { _id: sessionName };
    }

    const saveCreds = async (update) => {
        try {
            await credsCollection.updateOne(
                { _id: sessionName },
                { $set: update }
            );
        } catch (err) {
            console.error(`Failed to save creds for ${sessionName}:`, err.message);
        }
    };

    return {
        state: { creds },
        saveCreds,
        close: () => client.close()
    };
}

module.exports = { useMongoAuthState };
