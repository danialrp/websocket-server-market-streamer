const env = require('dotenv');
env.config();

import * as WebSocket from "ws";
import * as mongoClient from "../utils/mongo";

const uri = '/origin/tradeStream@';
const clientUriAppend = '@trade';
const consoleConnectionMsg = `Connected To Trade Stream Socket.`;


let originTradeStreamClients = {};
let wssTradeStreamServers = {};

function handleServerUpgrade(request: any, socket: any, head: any, currentPathName: any) {
    if (null === request || null === socket || null === head || null === currentPathName) {
        startAllExistingPairs().catch();
        return;
    }

    const pair = currentPathName.replace(uri, '');

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
    const pair = currentPathName.replace(uri, '');
    return await mongoClient.findInCollection('markets', {name: pair}, {});
}

async function insertNewPair(newPair: any) {
    await mongoClient.insertToCollection('pairs', {name: newPair, weight: 0});
    createClients(newPair);
    createWssServers(newPair);
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
        createClients(currentPair.name);
        createWssServers(currentPair.name);
        serveStreamSocketServers(currentPair.name);
    }));
}

function createClients(pair: any) {
    const market = pair.concat(clientUriAppend);
    // @ts-ignore
    originTradeStreamClients[pair] = new WebSocket(process.env.BNC_WS_URL + '/ws/' + market);
}

function createWssServers(pair: any) {
    // @ts-ignore
    wssTradeStreamServers[pair] = new WebSocket.Server({noServer: true});
}

function serveStreamSocketServers(pair: any) {
    // @ts-ignore
    wssTradeStreamServers[pair].on('connection', function connection(ws: WebSocket) {
        console.log(consoleConnectionMsg);
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