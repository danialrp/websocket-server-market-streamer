# Nodejs Websocket Streamer From Binance Streams

## Local Development (Inside Docker Container)
#### Docker
- Build docker image and run it `docker-compose up --build` 

#### Node
- Run `npm run watch` (compile /src directory and start dist/server.js)
- For more details check `package.json -> scripts`

#### PM2 (Alternative for Node)
- Run `pm2 stop dist/server.js --watch` then `tsc && pm2 start dist/server.js --watch`
- or Run `tsc && pm2 restart dist/server.js --watch`
- see live shell logs `pm2 logs`

## Production Deployment and Running
- ssh to server
- navigate to project directory
- create .env file `cp .env-example .env` and set variables
- install npm dependencies `suod npm i`
- install type script `sudo npm i -g typescript@4.5.4`
- install pm2 `sudo npm i -g pm2@5.1.2`
- execute `npm run build` or `tsc`

#### Install Redis (v4.0.1)
- navigate to outside of project directory
- download redis `wget -c http://download.redis.io/releases/redis-4.0.1.tar.gz`
- extract archive `tar -xvf redis-4.0.1.tar.gz`
- Build from Source
  - `cd redis-4.0.1`
  - `make`
  - `sudo make install`
  - `cd utils/`
  - `./install_server.sh`
- answer all questions with default answers
- then run redis server `sudo service redis_6379 start`
- make it always running by linux `sudo systemctl enable redis_6379`
- check redis status `sudo systemctl status redis_6379`
- delete archive file `rm -r redis-4.0.1.tar.gz`
- delete source dir `rm -r redis-4.0.1/` -> answer "yes"

#### Install MongoDB (v4.2.5)
- get official package `wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -`
- add MongoDb repo `echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list`
- update apt `sudo apt update`
- install MongoDb `sudo apt-get install mongodb-org -y`
- then run MongoDb `sudo systemctl start mongod.service`
- make it always running by linux `sudo systemctl enable mongod.service`
- check MongoDb status `sudo systemctl status mongod`

#### Sample Deploy Script <br/>
      ```sh
       cd /home/forge/stream.irbtc.net
       git pull origin $FORGE_SITE_BRANCH

       ( flock -w 10 9 || exit 1
           echo 'Restarting FPM...'; sudo -S service $FORGE_PHP_FPM reload ) 9>/tmp/fpmlock

       # npm run build ///UNCOMMENT FOR FIRT DEPLOY ONLY
       pm2 stop /home/forge/stream.irbtc.net/dist/server.js
       rm -r /home/forge/stream.irbtc.net/dist
       pm2 restart all --update-env
       npm run build
       pm2 restart /home/forge/stream.irbtc.net/dist/server.js
      ```
#### Sample Nginx.conf Configuration <br/>
      ```sh
    server {
         listen 443 ssl http2;
         listen [::]:443 ssl http2;
         server_name stream.irbtc.net;
         server_tokens off;
         root /home/forge/stream.irbtc.net/;
     
         # FORGE SSL (DO NOT REMOVE!)
         ssl_certificate /etc/nginx/ssl/stream.irbtc.net/1787864/server.crt;
         ssl_certificate_key /etc/nginx/ssl/stream.irbtc.net/1787864/server.key;
     
         ssl_protocols TLSv1.2 TLSv1.3;
         ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
         ssl_prefer_server_ciphers off;
         ssl_dhparam /etc/nginx/dhparams.pem;
     
         add_header X-Frame-Options "SAMEORIGIN";
         add_header X-XSS-Protection "1; mode=block";
         add_header X-Content-Type-Options "nosniff";
     
         charset utf-8;
     
         access_log off;
         error_log  /var/log/nginx/stream.irbtc.net-error.log error;
     
         location / {
             proxy_pass http://localhost:8080;
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection "upgrade";
             proxy_read_timeout 86400;
     
         }
     
         location ~ /\.(?!well-known).* {
             deny all;
         }
    }
      ```
 :::***RESTART SERVER***:::

-------------------------------------------
#### Sample Local Socket (Docker Container)
- `ws://0.0.0.0:8080/origin/!ticker`
- `ws://0.0.0.0:8080/origin/!miniTicker`
- `ws://0.0.0.0:8080/origin/tradeStream@btcusdt`
- `ws://0.0.0.0:8080/origin/aggregateTrade@btcusdt`
- `ws://0.0.0.0:8080/origin/ticker@btcusdt`
- `ws://0.0.0.0:8080/origin/bookTicker@btcusdt`
- `ws://0.0.0.0:8080/origin/depth@btcusdt`
- `ws://0.0.0.0:8080/origin/depthLevel@btcusdt_5` // '5', '10', '20'
- `ws://0.0.0.0:8080/origin/candlestick@btcusdt_5m` // '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'

#### Sample Production Socket
-`wss://stream.irbtc.net:443/origin/!ticker`
-`wss://stream.irbtc.net:443/origin/!miniTicker`
-`wss://stream.irbtc.net:443/origin/tradeStream@btcusdt`
-`wss://stream.irbtc.net:443/origin/aggregateTrade@btcusdt`
-`wss://stream.irbtc.net:443/origin/ticker@btcusdt`
-`wss://stream.irbtc.net:443/origin/bookTicker@btcusdt`
-`wss://stream.irbtc.net:443/origin/depth@btcusdt`
-`wss://stream.irbtc.net:443/origin/depthLevel@btcusdt_5` // '5', '10', '20'
-`wss://stream.irbtc.net:443/origin/candlestick@btcusdt_5m` // '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'

##### Sample Binance Socket
-`wss://stream.binance.com:9443/ws/btcusdt@trade`

