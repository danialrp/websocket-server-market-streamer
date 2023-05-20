## Nodejs Websocket Streamer From Binance Streams

### Install & Setup
- install mongoDB
- install Redis Database
- execute typescript files from /src
- set env variables

### Local Development (Inside Docker Container)
#### Node
- Run `npm run watch` (to compile /src directory)
- For more details check `package.json -> scripts`

#### PM2
- Run `pm2 stop dist/server.js --watch` then `tsc && pm2 start dist/server.js --watch`
- or Run `tsc && pm2 restart dist/server.js --watch`

#### Socket Connections (From Docker Container)
- `ws://0.0.0.0:8080/origin/!ticker`
- `ws://0.0.0.0:8080/origin/!miniTicker`
- `ws://0.0.0.0:8080/origin/tradeStream@btcusdt`
- `ws://0.0.0.0:8080/origin/aggregateTrade@btcusdt`
- `ws://0.0.0.0:8080/origin/ticker@btcusdt`
- `ws://0.0.0.0:8080/origin/bookTicker@btcusdt`
- `ws://0.0.0.0:8080/origin/depth@btcusdt`
- `ws://0.0.0.0:8080/origin/depthLevel@btcusdt_5` // '5', '10', '20'
- `ws://0.0.0.0:8080/origin/candlestick@btcusdt_5m` // '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'

##### Binance Sample Socket
`wss://stream.binance.com:9443/ws/btcusdt@trade`

### Production Deployment and Running
#### Sample Deploy Script <br/>
      `
       pm2 stop /home/forge/ximen.heavygrid.com/dist/server.js
       rm -r /home/forge/ximen.heavygrid.com/dist
       pm2 restart all --update-env
       tsc
       pm2 start /home/forge/ximen.heavygrid.com/dist/server.js
      `