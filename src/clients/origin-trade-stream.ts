const env = require('dotenv');
env.config();

import * as WebSocket from "ws";

const uri = '/origin/tradeStream@';
const clientUriAppend = '@trade';
const openConnectionMsg = `Connected To Trade Stream Socket.`;
const closeConnectionMsg = `Disconnected From Trade Stream Socket.`;
const errorConnectionMsg = `Trade Stream Client Error On Connection To Provider!`;


let originTradeStreamClients = {};
let wssTradeStreamServers = {};

function handleServerUpgrade(request: any, socket: any, head: any, currentPathName: any) {
    if (null === request || null === socket || null === head || null === currentPathName) {
        return;
    }

    const pair = currentPathName.replace(uri, '');

    createClients(pair);
    createWssServers(pair);
    serveStreamSocketServers(pair);

    // @ts-ignore
    wssTradeStreamServers[pair].handleUpgrade(request, socket, head, (ws: WebSocket) => {
        // @ts-ignore
        wssTradeStreamServers[pair].emit('connection', ws, request);
    });
}

const validPair = async function validatePair(currentPathName: any) {
    const pair = currentPathName.replace(uri, '');
    return pair;
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
        // @ts-ignore
        ws.addEventListener('connection', (() => {
            stream(ws, pair);
        })());

        // @ts-ignore
        ws.onclose = function () {
            console.log(closeConnectionMsg);
            // @ts-ignore
            ws = null;
        };
    });
}

function stream(ws: WebSocket, pair: any) {
    // @ts-ignore
    originTradeStreamClients[pair].addEventListener('message', (data) => {
        ws.send(data.data);
    });
}

export {uri, handleServerUpgrade, validPair};