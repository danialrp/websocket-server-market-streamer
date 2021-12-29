const env = require('dotenv');
env.config();

import * as WebSocket from "ws";

const uri = '/origin/!bookTicker';

const originBookTickerClient = new WebSocket(process.env.BNC_WS_URL + '/ws/!bookTicker');
const wssBookTickerServer = new WebSocket.Server({noServer: true});

function handleServerUpgrade(request: any, socket: any, head: any) {
    wssBookTickerServer.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wssBookTickerServer.emit('connection', ws);
    });
}

/* Mini Ticker Websocket */
wssBookTickerServer.on('connection', function connection(ws: WebSocket) {
    console.log(`Connected To Book Ticker Socket`);

    // @ts-ignore
    ws.addEventListener("connection", (() => {
        stream(ws);
    })());
});

function stream(ws: WebSocket) {
    originBookTickerClient.addEventListener('message', (data) => {
        ws.send(data.data);
    });
}

export {uri, handleServerUpgrade, wssBookTickerServer, originBookTickerClient};