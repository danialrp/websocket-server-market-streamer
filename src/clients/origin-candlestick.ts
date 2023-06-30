const env = require('dotenv');
env.config();

import * as WebSocket from "ws";

const uri = '/origin/candlestick@';
let clientUriAppend = '@kline_';
let level = 0;
const openConnectionMsg = `Connected To Candlestick Socket.`;
const closeConnectionMsg = `Disconnected From Candlestick Socket.`;
const errorConnectionMsg = `Candlestick Client Error On Connection To Provider!`;

let originClients = {};
let wssServers = {};

function handleServerUpgrade(request: any, socket: any, head: any, currentPathName: any) {
    if (null === request || null === socket || null === head || null === currentPathName) {
        return;
    }

    let pairAndLevel = currentPathName.replace(uri, '');
    const pair = pairAndLevel.split('_')[0];
    level = pairAndLevel.split('_')[1].replace('_', '');

    createClients(pair);
    createWssServers(pairAndLevel);
    serveStreamSocketServers(pairAndLevel);

    const pair_Level = createPairAndLevel(pair, level, '_');
    // @ts-ignore
    wssServers[pair_Level].handleUpgrade(request, socket, head, (ws: WebSocket) => {
        // @ts-ignore
        wssServers[pair_Level].emit('connection', ws, request);
    });
}

const validPair = async function validatePair(currentPathName: any) {
    let pairAndLevel = currentPathName.replace(uri, '');
    const pair = pairAndLevel.split('_')[0];
    return pair;
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

function createPairAndLevel(pair: any, level: any, separator: any) {
    return pair + separator + level;
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
        // @ts-ignore
        ws.addEventListener('connection', (() => {
            stream(ws, pairAndLevel);
        })());

        // @ts-ignore
        ws.onclose = function () {
            console.log(closeConnectionMsg);
            // @ts-ignore
            ws = null;
        };
    });
}

function stream(ws: WebSocket, pairAndLevel: any) {
    // @ts-ignore
    originClients[pairAndLevel].addEventListener('message', (data) => {
        ws.send(data.data);
    });
}

export {uri, handleServerUpgrade, validPair, validLevel};