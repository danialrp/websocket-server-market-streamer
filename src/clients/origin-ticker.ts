const env = require('dotenv');
env.config();

import * as WebSocket from "ws";

const uri = '/origin/!ticker';
const openConnectionMsg = `Connected To Ticker Socket.`;
const closeConnectionMsg = `Disconnected From Ticker Socket.`;
const errorConnectionMsg = `Origin Ticker Client Error On Connection To Provider!`;

const wssTickerServer = new WebSocket.Server({noServer: true});

function handleServerUpgrade(request: any, socket: any, head: any) {
    wssTickerServer.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wssTickerServer.emit('connection', ws);
    });
}

wssTickerServer.on('connection', function connection(ws: WebSocket) {
    // @ts-ignore
    ws.addEventListener('connection', (() => {
        stream(ws);
    })());

    // @ts-ignore
    ws.onclose = function () {
        console.log(closeConnectionMsg);
        // @ts-ignore
        ws = null;
    };
});

function stream(ws: WebSocket) {
    const originTickerClient = new WebSocket(process.env.BNC_WS_URL + '/ws/!ticker@arr');

    originTickerClient.onopen = function () {
        console.log(openConnectionMsg);
    };

    originTickerClient.onerror = function () {
        console.log(errorConnectionMsg);
        // @ts-ignore
        ws.send(errorConnectionMsg);
        // @ts-ignore
        ws.terminate();
        return;
    };

    originTickerClient.addEventListener('message', (data) => {
        ws.send(data.data);
    });
}

export {uri, handleServerUpgrade, wssTickerServer};