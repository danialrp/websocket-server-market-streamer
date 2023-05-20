const env = require('dotenv');
env.config();

import * as originMiniTicker from "../clients/origin-mini-ticker";
import * as originTicker from "../clients/origin-ticker";
import * as originTradeStream from "../clients/origin-trade-stream";
import * as aggregateTrade from "../clients/origin-aggregate-trade";
import * as individualMiniTicker from "../clients/origin-mini-ticker-individual";
import * as individualTicker from "../clients/origin-ticker-individual";
import * as individualBookTicker from "../clients/origin-book-ticker-individual";
import * as depthStream from "../clients/origin-depth-stream";
import * as depthLevelStream from "../clients/origin-depth-partial-stream";
import * as candlestick from "../clients/origin-candlestick";
import * as assetMarkets from "./market";

function startServices() {
    assetMarkets.getAssetMarkets().then();

    originTradeStream.handleServerUpgrade(null, null, null, null);
    aggregateTrade.handleServerUpgrade(null, null, null, null);
    individualMiniTicker.handleServerUpgrade(null, null, null, null);
    individualTicker.handleServerUpgrade(null, null, null, null);
    individualBookTicker.handleServerUpgrade(null, null, null, null);
    depthStream.handleServerUpgrade(null, null, null, null);
    depthLevelStream.handleServerUpgrade(null, null, null, null);
    candlestick.handleServerUpgrade(null, null, null, null);

    originMiniTicker.wssMiniTickerServer;
    originTicker.wssTickerServer;
}

export {startServices};