const env = require('dotenv');
env.config();

import axios from "axios";
import * as redisClient from "./redis";

const url = process.env.ASSET_MARKET_URL;
let assetMarkets: any[] = [];

const response = async function getMarkets() {
    // @ts-ignore
    return await axios.get(url)
        .catch((error) => {
            console.log(`Error on asset market request api.\n` + error);
        });
}

async function getAssetMarkets() {
    const responseData = await response();

    // @ts-ignore
    responseData.data.data.forEach(function each(asset: any) {
        asset.markets.forEach(function each(market: any) {
            assetMarkets.push({name: market.toLowerCase()});
        });
    });

    // await redisClient.setKeyValue('markets', JSON.stringify(assetMarkets));

    assetMarkets = [];
}

export {getAssetMarkets};
