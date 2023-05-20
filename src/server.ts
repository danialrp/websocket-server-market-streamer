const env = require('dotenv');
env.config();

import * as express from 'express';
import * as http from 'http';

import * as routes from './routes';
import * as cronJob from './utils/cron';
import * as launcher from './utils/launcher';

const app = express();
const server = http.createServer(app);

/* Websocket Server */
server.on('upgrade', (request, socket, head) => {
    routes.handler(request, socket, head);
});

server.listen(process.env.PORT, () => {
    console.log(`Node Server Started`);
    cronJob.cleansingPairs.start();
    cronJob.updateAssetMarketJob.start();
    cronJob.restartServer.start();
    launcher.startServices();
    console.log(`Application Services Lunched`);
});
