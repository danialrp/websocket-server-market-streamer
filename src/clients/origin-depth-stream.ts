const env = require('dotenv');
env.config();

import * as WebSocket from "ws";

const uri = '/origin/depth@';
const clientUriAppend = '@depth';
const openConnectionMsg = `Connected To Diff Depth Stream Socket.`;
const closeConnectionMsg = `Disconnected From Diff Depth Stream Socket.`;
const errorConnectionMsg = `Diff Depth Stream Client Error On Connection To Provider!`;

let originClients = {};
let wssServers = {};

function handleServerUpgrade(request: any, socket: any, head: any, currentPathName: any) {
    if (null === request || null === socket || null === head || null === currentPathName) {
        return;
    }

    const pair = currentPathName.replace(uri, '');

    createClients(pair);
    createWssServers(pair);
    serveStreamSocketServers(pair);

    // @ts-ignore
    wssServers[pair].handleUpgrade(request, socket, head, (ws: WebSocket) => {
        // @ts-ignore
        wssServers[pair].emit('connection', ws, request);
    });
}

const validPair = async function validatePair(currentPathName: any) {
    const pair = currentPathName.replace(uri, '');
    return pair;
}

function createClients(pair: any) {
    const market = pair.concat(clientUriAppend);
    // @ts-ignore
    originClients[pair] = new WebSocket(process.env.BNC_WS_URL + '/ws/' + market);
}

function createWssServers(pair: any) {
    // @ts-ignore
    wssServers[pair] = new WebSocket.Server({noServer: true});
}

function serveStreamSocketServers(pair: any) {
    // @ts-ignore
    wssServers[pair].on('connection', function connection(ws: WebSocket) {
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
    originClients[pair].addEventListener('message', (data) => {
        ws.send(data.data);
    });
}

export {uri, handleServerUpgrade, validPair};