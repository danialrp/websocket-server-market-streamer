const env = require('dotenv');
env.config();

import {Document, MongoClient, WithId} from "mongodb";

const connectionUrl = process.env.MONGODB_CONNECTION_URL;
const dbName = process.env.MONGODB_NAME;
// @ts-ignore
const client = new MongoClient(connectionUrl);

async function findManyInCollection(baseCollection: any, query: any) {
    let resultsArr: WithId<Document>[] = [];
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(baseCollection);
        await collection.find(query, {}).forEach(function (data) {
            resultsArr.push(data);
        });
    } finally {
        // await client.close();
    }
    return resultsArr;
}

async function findInCollection(baseCollection: any, query: any, options: any) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(baseCollection);
        return await collection.findOne(query, options);
    } finally {
        await client.close();
    }
}

async function insertToCollection(baseCollection: any, document: object) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(baseCollection);
        return await collection.insertOne(document);
    } finally {
        await client.close();
    }
}

async function insertManyToCollection(baseCollection: any, documents: any, options: any) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(baseCollection);
        return await collection.insertMany(documents, options);
    } finally {
        await client.close();
    }
}

async function updateInCollection(baseCollection: any, query: any, document: any, options: any) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(baseCollection);
        return await collection.updateOne(query, document, options);
    } finally {
        await client.close();
    }
}

async function updateManyInCollection(baseCollection: any, query: any, document: any, options: any) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(baseCollection);
        await collection.updateMany(query, document);
    } finally {
        await client.close();
    }
}

async function deleteInCollection(baseCollection: any, query: any) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(baseCollection);
        await collection.deleteMany(query);
    } finally {
        await client.close();
    }
}

async function closeConnection() {
    await client.close();
}

export {
    findManyInCollection,
    findInCollection,
    insertToCollection,
    insertManyToCollection,
    updateInCollection,
    updateManyInCollection,
    deleteInCollection,
    closeConnection
}