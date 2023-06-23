import * as pm2 from 'pm2';

export function restartServer() {
    pm2.connect((connectionError => {
        if (connectionError) return console.log(connectionError);
        // @ts-ignore
        pm2.restart('server', (err) => {
            if (err) return console.log('Failed to restart', err);
        })
    }));
}