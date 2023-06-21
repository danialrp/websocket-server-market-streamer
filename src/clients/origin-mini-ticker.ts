const env = require('dotenv');
env.config();

import * as WebSocket from "ws";

const uri = '/origin/!miniTicker';
const openConnectionMsg = `Connected To Mini Ticker Socket.`;
const closeConnectionMsg = `Disconnected From Mini Ticker Socket.`;
const errorConnectionMsg = `Origin Mini Ticker Client Error On Connection To Provider!`;

const wssMiniTickerServer = new WebSocket.Server({noServer: true});

function handleServerUpgrade(request: any, socket: any, head: any) {
    wssMiniTickerServer.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wssMiniTickerServer.emit('connection', ws);
    });
}

/* Mini Ticker Websocket */
wssMiniTickerServer.on('connection', function connection(ws: WebSocket) {
    // @ts-ignore
    ws.addEventListener("connection", (() => {
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
    const originMiniTickerClient = new WebSocket(process.env.BNC_WS_URL + '/ws/!miniTicker@arr');

    originMiniTickerClient.onopen = function () {
        console.log(openConnectionMsg);
    };

    originMiniTickerClient.onerror = function () {
        console.log(errorConnectionMsg);
        // @ts-ignore
        ws.send(errorConnectionMsg);
        // @ts-ignore
        ws.terminate();
        return;
    };

    originMiniTickerClient.addEventListener('message', (data) => {
        ws.send(data.data);
    });
}

export {uri, handleServerUpgrade, wssMiniTickerServer};