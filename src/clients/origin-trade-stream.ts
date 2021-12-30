const env = require('dotenv');
env.config();

import * as WebSocket from "ws";
import * as mongoClient from "../utils/mongo";

const uri = '/origin/tradeStream@';

let originTradeStreamClients = {};
let wssTradeStreamServers = {};

function handleServerUpgrade(request: any, socket: any, head: any, currentPathName: any) {
    if (null === request || null === socket || null === head || null === currentPathName) {
        startAllExistingPairs().catch();
        return;
    }

    const pair = currentPathName.replace('/origin/tradeStream@', '');

    const existedPair = async function () {
        // @ts-ignore
        const isPairExists = await mongoClient.findInCollection('pairs', {name: pair}, {});
        if (null === isPairExists) await insertNewPair(pair);
    };

    existedPair().then(() => {
        (async () => {
            await increasePairWeight(pair);
        })();

        // @ts-ignore
        wssTradeStreamServers[pair].handleUpgrade(request, socket, head, (ws: WebSocket) => {
            // @ts-ignore
            wssTradeStreamServers[pair].emit('connection', ws, request);
        });
    });

}

const validPair = async function validatePair(currentPathName: any) {
    const pair = currentPathName.replace('/origin/tradeStream@', '');
    return await mongoClient.findInCollection('markets', {name: pair}, {});
}

async function insertNewPair(newPair: any) {
    await mongoClient.insertToCollection('pairs', {name: newPair, weight: 0});
    createTradeStreamClients(newPair);
    createWssTradeStreamServers(newPair);
    serveStreamSocketServers(newPair);
}

async function increasePairWeight(pair: any) {
    const query = {name: pair};
    const doc = {$inc: {weight: 1}};
    await mongoClient.updateInCollection('pairs', query, doc, {});
}

async function startAllExistingPairs() {
    const currentPairs = await mongoClient.findManyInCollection('pairs', {});
    await Promise.all(currentPairs.map(async (currentPair: any) => {
        createTradeStreamClients(currentPair.name);
        createWssTradeStreamServers(currentPair.name);
        serveStreamSocketServers(currentPair.name);
    }));
}

function createTradeStreamClients(pair: any) {
    const market = pair.concat('@trade');
    // @ts-ignore
    originTradeStreamClients[pair] = new WebSocket(process.env.BNC_WS_URL + '/ws/' + market);
}

function createWssTradeStreamServers(pair: any) {
    // @ts-ignore
    wssTradeStreamServers[pair] = new WebSocket.Server({noServer: true});
}

function serveStreamSocketServers(pair: any) {
    // @ts-ignore
    wssTradeStreamServers[pair].on('connection', function connection(ws: WebSocket) {
        console.log(`Connected To Trade Stream Socket.`);
        // @ts-ignore
        ws.addEventListener('connection', (() => {
            stream(ws, pair);
        })());
    });
}

function stream(ws: WebSocket, pair: any) {
    // @ts-ignore
    originTradeStreamClients[pair].addEventListener('message', (data) => {
        ws.send(data.data);
    });
}

export {uri, handleServerUpgrade, validPair};