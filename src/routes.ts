import * as url from 'url';

import * as originMiniTicker from "./clients/origin-mini-ticker";
import * as originTicker from "./clients/origin-ticker";
import * as originBookTicker from "./clients/origin-book-ticker";
import * as tradeStream from "./clients/origin-trade-stream";

let currentPathName: string;

function handler(request: any, socket: any, head: any) {
    // @ts-ignore
    currentPathName = url.parse(request.url).pathname;

    if (currentPathName === originMiniTicker.uri) {
        originMiniTicker.handleServerUpgrade(request, socket, head);
    } else if (currentPathName === originTicker.uri) {
        originTicker.handleServerUpgrade(request, socket, head);
    } else if (currentPathName === originBookTicker.uri) {
        originBookTicker.handleServerUpgrade(request, socket, head);
    } else if (currentPathName.includes(tradeStream.uri)) {
        tradeStream.validPair(currentPathName).then(validatedPair => {
            if (null === validatedPair) socket.destroy();
            else tradeStream.handleServerUpgrade(request, socket, head, currentPathName);
        })
    } else {
        socket.destroy();
        console.log('invalid patheeee');
    }
}

export {handler}