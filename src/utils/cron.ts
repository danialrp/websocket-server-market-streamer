const env = require('dotenv');
env.config();

const CronJob = require('cron').CronJob;

import * as marketAssets from './market';
import * as serverRefresher from './restart-server';

// Everyday @ 08:00:00am.
const updateAssetMarketJob = new CronJob('0 0 8 * * *', async function () {
    await marketAssets.getAssetMarkets();
}, null, true, 'UTC');

// Every 3hrs.
const restartServer = new CronJob('0 0 */3 * * *', async function () {
    serverRefresher.restartServer();
}, null, true, 'UTC');

export {
    updateAssetMarketJob,
    restartServer
};