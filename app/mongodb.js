const { MongoClient } = require('mongodb');

const username = "admin";
const password = "BiINPxSnYq4ygeRf";

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = `mongodb+srv://${username}:${password}@cluster0.7fsul.mongodb.net/test`;

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        await listDatabases(client);
        await fetchShop(client);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function fetchShop(client) {
    const shop = await client.db('shop');
    const orders = shop.collection('orders');
    const products = shop.collection('products');
    const sessions = shop.collection('sessions');
    const users = shop.collection('users');
};

main().catch(console.error);