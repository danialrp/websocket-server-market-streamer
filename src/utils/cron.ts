const CronJob = require('cron').CronJob;
import * as marketAssets from './market';
import * as serverRefresher from './refresh-server';

// Everyday @ 08:00:00am.
const updateAssetMarketJob = new CronJob('0 0 8 * * *', async function () {
    await marketAssets.getAssetMarkets();
}, null, true, 'UTC');

// Everyday @ 07:00:00am.
const restartServer = new CronJob('0 0 7 * * *', async function () {
    serverRefresher.restartServer();
}, null, true, 'UTC');

export {updateAssetMarketJob, restartServer};