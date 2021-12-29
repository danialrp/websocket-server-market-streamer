const env = require('dotenv');
env.config();

import * as WebSocket from "ws";

const uri = '/origin/!miniTicker';

const originMiniTickerClient = new WebSocket(process.env.BNC_WS_URL + '/ws/!miniTicker@arr');
const wssMiniTickerServer = new WebSocket.Server({noServer: true});

function handleServerUpgrade(request: any, socket: any, head: any) {
    wssMiniTickerServer.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wssMiniTickerServer.emit('connection', ws);
    });
}

/* Mini Ticker Websocket */
wssMiniTickerServer.on('connection', function connection(ws: WebSocket) {
    console.log(`Connected To Mini Ticker Socket`);

    // @ts-ignore
    ws.addEventListener("connection", (() => {
        stream(ws);
    })());
});

function stream(ws: WebSocket) {
    originMiniTickerClient.addEventListener('message', (data) => {
        ws.send(data.data);
    });
}

export {uri, handleServerUpgrade, wssMiniTickerServer, originMiniTickerClient};