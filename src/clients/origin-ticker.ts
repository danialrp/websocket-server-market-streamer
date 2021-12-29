const env = require('dotenv');
env.config();

import * as WebSocket from "ws";

const uri = '/origin/!ticker';

const originTickerClient = new WebSocket(process.env.BNC_WS_URL + '/ws/!ticker@arr');
const wssTickerServer = new WebSocket.Server({noServer: true});

function handleServerUpgrade(request: any, socket: any, head: any) {
    wssTickerServer.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wssTickerServer.emit('connection', ws);
    });
}

wssTickerServer.on('connection', function connection(ws: WebSocket) {
    console.log(`Connected To Ticker Socket`);

    // @ts-ignore
    ws.addEventListener('connection', (() => {
        stream(ws);
    })());
});

function stream(ws: WebSocket) {
    originTickerClient.addEventListener('message',  (data) => {
        ws.send(data.data);
    });
}

export {uri, handleServerUpgrade, wssTickerServer, originTickerClient};