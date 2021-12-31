const env = require('dotenv');
env.config();

import * as WebSocket from "ws";
import * as mongoClient from "../utils/mongo";

const uri = '/origin/candlestick@';
let clientUriAppend = '@kline_';
let level = 0;
const consoleConnectionMsg = `Connected To Candlestick Socket.`;

let originClients = {};
let wssServers = {};

function handleServerUpgrade(request: any, socket: any, head: any, currentPathName: any) {
    if (null === request || null === socket || null === head || null === currentPathName) {
        startAllExistingPairs().catch();
        return;
    }

    let pairAndLevel = currentPathName.replace(uri, '');
    const pair = pairAndLevel.split('_')[0];
    level = pairAndLevel.split('_')[1].replace('_', '');

    const existedPair = async function () {
        // @ts-ignore
        const query = {name: pair, level: level};
        const isPairExists = await mongoClient.findInCollection('pairs', query, {});
        if (null === isPairExists) await insertNewPair(pair);
    };

    existedPair().then(() => {
        (async () => {
            await increasePairWeight(pair);
        })();
        const pair_Level = createPairAndLevel(pair, level, '_');
        // @ts-ignore
        wssServers[pair_Level].handleUpgrade(request, socket, head, (ws: WebSocket) => {
            // @ts-ignore
            wssServers[pair_Level].emit('connection', ws, request);
        });
    });
}

const validPair = async function validatePair(currentPathName: any) {
    let pairAndLevel = currentPathName.replace(uri, '');
    const pair = pairAndLevel.split('_')[0];
    return await mongoClient.findInCollection('markets', {name: pair}, {});
}

const validLevel =  (currentPath: any) => {
    let pairAndLevel = currentPath.replace(uri, '');
    const askedLevel = pairAndLevel.split('_')[1].replace('_', '');
    const allowedLevels = [
        '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h',
        '1d', '3d', '1w', '1M'
    ];
    // @ts-ignore
    return allowedLevels.includes(askedLevel);
}

async function insertNewPair(newPair: any) {
    const doc = {name: newPair, weight: 0, level: level};
    await mongoClient.insertToCollection('pairs', doc);
    const pair_level = level !== 0 ? createPairAndLevel(newPair, level, '_') : newPair;
    createClients(newPair);
    createWssServers(pair_level);
    serveStreamSocketServers(pair_level);
}

async function increasePairWeight(pair: any) {
    const query = {name: pair, level: level};
    const doc = {$inc: {weight: 1}};
    await mongoClient.updateInCollection('pairs', query, doc, {});
}

function createPairAndLevel(pair: any, level: any, separator: any) {
    return pair + separator + level;
}

async function startAllExistingPairs() {
    const currentPairs = await mongoClient.findManyInCollection('pairs', {});
    await Promise.all(currentPairs.map(async (currentPair: any) => {
        level = currentPair.level !== 0 ? currentPair.level : '';
        const pair_level = currentPair.level !== 0 ? createPairAndLevel(currentPair.name, level, '_') : currentPair.name;
        createClients(currentPair.name);
        createWssServers(pair_level);
        serveStreamSocketServers(pair_level);
    }));
}

function createClients(pair: any) {
    const market = pair.concat(clientUriAppend);
    const marketAndLevel = level !== 0 ? market + level : market;
    const market_level = createPairAndLevel(pair, level, '_');
    // @ts-ignore
    originClients[market_level] = new WebSocket(process.env.BNC_WS_URL + '/ws/' + marketAndLevel);
}

function createWssServers(pairAndLevel: any) {
    // @ts-ignore
    wssServers[pairAndLevel] = new WebSocket.Server({noServer: true});
}

function serveStreamSocketServers(pairAndLevel: any) {
    // @ts-ignore
    wssServers[pairAndLevel].on('connection', function connection(ws: WebSocket) {
        console.log(consoleConnectionMsg);
        // @ts-ignore
        ws.addEventListener('connection', (() => {
            stream(ws, pairAndLevel);
        })());
    });
}

function stream(ws: WebSocket, pairAndLevel: any) {
    // @ts-ignore
    originClients[pairAndLevel].addEventListener('message', (data) => {
        ws.send(data.data);
    });
}

export {uri, handleServerUpgrade, validPair, validLevel};