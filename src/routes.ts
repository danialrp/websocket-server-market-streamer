import * as url from 'url';

import * as originMiniTicker from "./clients/origin-mini-ticker";
import * as originTicker from "./clients/origin-ticker";
import * as originBookTicker from "./clients/origin-book-ticker";
import * as tradeStream from "./clients/origin-trade-stream";
import * as aggregateTrade from "./clients/origin-aggregate-trade";
import * as individualMiniTicker from "./clients/origin-mini-ticker-individual";
import * as individualTicker from "./clients/origin-ticker-individual";
import * as individualBookTicker from "./clients/origin-book-ticker-individual";
import * as depthStream from "./clients/origin-depth-stream";
import * as depthLevelStream from "./clients/origin-depth-diff-stream";
import * as candlestick from "./clients/origin-candlestick";

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
            if (null === validatedPair) {
                socket.destroy();
                console.error('INVALID PAIR');
            } else tradeStream.handleServerUpgrade(request, socket, head, currentPathName);
        })
    } else if (currentPathName.includes(aggregateTrade.uri)) {
        aggregateTrade.validPair(currentPathName).then(validatedPair => {
            if (null === validatedPair) {
                socket.destroy();
                console.error('INVALID PAIR');
            } else aggregateTrade.handleServerUpgrade(request, socket, head, currentPathName);
        })
    } else if (currentPathName.includes(individualMiniTicker.uri)) {
        individualMiniTicker.validPair(currentPathName).then(validatedPair => {
            if (null === validatedPair) {
                socket.destroy();
                console.error('INVALID PAIR');
            } else individualMiniTicker.handleServerUpgrade(request, socket, head, currentPathName);
        })
    } else if (currentPathName.includes(individualTicker.uri)) {
        individualTicker.validPair(currentPathName).then(validatedPair => {
            if (null === validatedPair) {
                socket.destroy();
                console.error('INVALID PAIR');
            } else individualTicker.handleServerUpgrade(request, socket, head, currentPathName);
        })
    } else if (currentPathName.includes(individualBookTicker.uri)) {
        individualBookTicker.validPair(currentPathName).then(validatedPair => {
            if (null === validatedPair) {
                socket.destroy();
                console.error('INVALID PAIR');
            } else individualBookTicker.handleServerUpgrade(request, socket, head, currentPathName);
        })
    } else if (currentPathName.includes(depthStream.uri)) {
        depthStream.validPair(currentPathName).then(validatedPair => {
            if (null === validatedPair) {
                socket.destroy();
                console.error('INVALID PAIR');
            } else depthStream.handleServerUpgrade(request, socket, head, currentPathName);
        })
    } else if (currentPathName.includes(candlestick.uri)) {
        candlestick.validPair(currentPathName).then(validatedPair => {
            if (null === validatedPair) {
                socket.destroy();
                console.error('INVALID PAIR');
            } else candlestick.handleServerUpgrade(request, socket, head, currentPathName);
        })
    }  else if (currentPathName.includes(depthLevelStream.uri)) {
        depthLevelStream.validPair(currentPathName).then(validatedPair => {
            if (null === validatedPair) {
                socket.destroy();
                console.error('INVALID PAIR');
            } else depthLevelStream.handleServerUpgrade(request, socket, head, currentPathName);
        })
    } else {
        socket.destroy();
        console.error('INVALID PATH');
    }
}

export {handler}