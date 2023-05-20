const env = require('dotenv');
env.config();

import axios from "axios";
import * as redisClient from "./redis";
import * as mongoClient from "../utils/mongo";

const url = process.env.ASSET_MARKET_URL;
let assetMarkets: any[] = [];

const response = async function getMarkets() {
    // @ts-ignore
    return await axios.get(url);
}

async function getAssetMarkets() {
    const responseData = await response();
    responseData.data.data.forEach(function each(asset: any) {
        asset.markets.forEach(function each(market: any) {
            assetMarkets.push({name : market.toLowerCase()});
        });
    });
    // await redisClient.setKeyValue('markets', JSON.stringify(assetMarkets));
    await mongoClient.deleteInCollection('markets', {});
    await mongoClient.insertManyToCollection('markets', assetMarkets, {},);

    assetMarkets = [];
}

export {getAssetMarkets};
