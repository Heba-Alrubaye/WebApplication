const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

const username = "admin";
const password = "BiINPxSnYq4ygeRf";

const uri = `mongodb+srv://${username}:${password}@cluster0.7fsul.mongodb.net/shop`;

const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect(uri, connectionOptions);

module.exports = {
    User: require('./model/user'),
    Product: require('./model/product'),
    Cart: require('./model/cart')
};

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connect to the MongoDB cluster
        await client.connect();

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);