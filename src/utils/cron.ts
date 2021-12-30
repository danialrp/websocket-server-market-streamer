const CronJob = require('cron').CronJob;

import * as marketAssets from './market';
import * as serverRefresher from './restart-server';
import * as pairsCleaner from './cleansing-pairs';

// Every 3hrs.
const cleansingPairs = new CronJob('0 0 */3 * * *', async function () {
    await pairsCleaner.deleteLightWeightPairs();
}, null, true, 'UTC');

// Everyday @ 08:00:00am.
const updateAssetMarketJob = new CronJob('0 0 8 * * *', async function () {
    await marketAssets.getAssetMarkets();
}, null, true, 'UTC');

// Every 4hrs.
const restartServer = new CronJob('0 0 */4 * * *', async function () {
    serverRefresher.restartServer();
}, null, true, 'UTC');

export {
    cleansingPairs,
    updateAssetMarketJob,
    restartServer
};