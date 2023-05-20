import * as mongoClient from "../utils/mongo";
import * as serverRefresher from './restart-server';

export async function deleteLightWeightPairs() {
    const query = {weight: {$lt: 20}};
    await mongoClient.deleteInCollection('pairs', query).then(() => {
        (async () => {
            const updateQuery = {weight: {$gte: 20}};
            const updateDoc = {$set: {weight: 0}};
            await mongoClient.updateManyInCollection('pairs', updateQuery, updateDoc, {});
        })().then(() => {
            // serverRefresher.restartServer();
        });
    });
}