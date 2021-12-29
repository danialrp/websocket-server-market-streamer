const env = require('dotenv');
env.config();

import { createClient } from 'redis';
const client = createClient({url: process.env.REDIS_CONNECTION_URL, database: 0});

client.connect();

/*const connectToRedis = async function connect() {
    await client.connect();
}*/

async function setKeyValue(key: any, value: any) {
    // await connectToRedis();
    await client.set('wss:' + key, value);
    // await client.quit();
}

async function getValueByKey(key: any) {
    // await connectToRedis();
    const value = await client.get(key);
    // await client.quit();
    return value;
}

export {setKeyValue, getValueByKey};