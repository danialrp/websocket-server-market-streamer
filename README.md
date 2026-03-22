# WebSocket Server Market Streamer

> A real-time cryptocurrency market data middleware server — bridges Binance WebSocket streams to downstream exchange clients with Redis caching, fiat rate enrichment, and cron-based synchronisation.

![TypeScript](https://img.shields.io/badge/TypeScript-4.5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![PM2](https://img.shields.io/badge/PM2-Process%20Manager-2B037A?style=flat-square)
![License](https://img.shields.io/badge/License-ISC-lightgrey?style=flat-square)

---

## Overview

This service acts as a **WebSocket relay layer** between upstream cryptocurrency data providers (Binance) and downstream consumers such as exchange platforms or trading UIs.

Instead of each client maintaining its own connection to Binance, this server:

1. Subscribes to Binance WebSocket streams once
2. Enriches market data with live fiat conversion rates
3. Caches the aggregated state in Redis
4. Re-broadcasts normalised data to all connected downstream clients via a managed WebSocket server

Built to serve as the real-time data backbone of a cryptocurrency exchange platform — handling market tickers, order book snapshots, and fiat-converted price feeds.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Upstream Layer                        │
│                                                              │
│   Binance WSS Streams  ──────────────────────────────────┐  │
│   (BNC_WS_URL)                                           │  │
│                           Fiat Rate API ─────────────┐   │  │
│                           (FIAT_URL)                 │   │  │
│                           Asset Market API ──────┐   │   │  │
│                           (ASSET_MARKET_URL)     │   │   │  │
└──────────────────────────────────────────────────│───│───│──┘
                                                   │   │   │
┌──────────────────────────────────────────────────▼───▼───▼──┐
│                     wss-rate Server (This)                   │
│                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│   │ Binance WS   │    │  Cron Jobs   │    │  Fiat Rate   │  │
│   │ Client       │    │  (Periodic   │    │  Fetcher     │  │
│   │              │    │   Sync)      │    │  (Axios)     │  │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│          │                  │                    │           │
│          └──────────────────▼────────────────────┘          │
│                             │                               │
│                      ┌──────▼──────┐                        │
│                      │    Redis    │                        │
│                      │   Cache     │                        │
│                      └──────┬──────┘                        │
│                             │                               │
│                      ┌──────▼──────┐                        │
│                      │  WS Server  │                        │
│                      │  (ws + expr)│                        │
│                      └──────┬──────┘                        │
└─────────────────────────────│────────────────────────────────┘
                              │
              ┌───────────────▼────────────────┐
              │       Downstream Clients        │
              │  (Exchange UI / Trading Apps)   │
              └─────────────────────────────────┘
```

---

## Features

- **Live Binance Stream Relay** — Subscribes to Binance WebSocket market data and relays normalised events to connected clients
- **Fiat Rate Enrichment** — Periodically fetches fiat conversion rates and incorporates them into outgoing market data
- **Redis Caching** — Persists latest market state for fast client catch-up on connection and reduced upstream pressure
- **Cron-Based Synchronisation** — Scheduled jobs keep rates and asset metadata fresh without manual intervention
- **WebSocket Server** — Lightweight `ws`-powered server broadcasting to all connected downstream consumers
- **Express HTTP Layer** — Provides health check or REST companion endpoints alongside the WebSocket server
- **PM2 Process Management** — Runs with pm2 for zero-downtime restarts and watch mode in development
- **Docker Compose Stack** — Full containerised setup including Redis, with isolated bridge networking
- **TypeScript Throughout** — Fully typed codebase with strict compilation targeting production `dist/`

---

## Tech Stack

| Layer              | Technology                  |
|--------------------|-----------------------------|
| Runtime            | Node.js 18+                 |
| Language           | TypeScript 4.5              |
| WebSocket Client   | `ws` v8                     |
| WebSocket Server   | `ws` v8                     |
| HTTP Framework     | Express v4                  |
| Cache / State      | Redis v7 (`redis` v4)       |
| HTTP Client        | Axios v0.24                 |
| Scheduler          | `cron` v1.8                 |
| Process Manager    | PM2 v5                      |
| Containerisation   | Docker + Docker Compose v3  |
| Environment Config | dotenv v10                  |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- A Binance WebSocket stream URL

### 1. Clone the repository

```bash
git clone https://github.com/danialrp/websocket-server-market-streamer.git
cd websocket-server-market-streamer
```

### 2. Configure environment

```bash
cp .env-example .env
```

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=8080
BNC_WS_URL=wss://stream.binance.com:9443/ws/<stream>
REDIS_CONNECTION_URL=redis://redis:6379
ASSET_MARKET_URL=https://your-asset-api/endpoint
FIAT_URL=https://your-fiat-rate-api/endpoint
```

### 3. Run with Docker Compose

```bash
docker compose up --build
```

This starts both the Node.js server and a Redis instance on a shared bridge network.

### 4. Run locally (without Docker)

```bash
npm install
npm run build   # Compiles TypeScript to dist/
npm start       # Compiles + starts via PM2
```

For development with auto-restart on file changes:

```bash
npm run watch
```

---

## Available Scripts

| Command         | Description                                             |
|-----------------|---------------------------------------------------------|
| `npm run build` | Compiles TypeScript source to `dist/`                   |
| `npm start`     | Compiles and starts the server via PM2                  |
| `npm run watch` | Compiles and restarts on file changes (dev mode)        |
| `npm run dev`   | Same as `watch` — alias for development workflow        |

---

## Environment Variables

| Variable              | Required | Description                                          |
|-----------------------|----------|------------------------------------------------------|
| `NODE_ENV`            | Yes      | `development` or `production`                        |
| `PORT`                | Yes      | Port the WebSocket/HTTP server listens on            |
| `BNC_WS_URL`          | Yes      | Binance WebSocket stream URL                         |
| `REDIS_CONNECTION_URL`| Yes      | Redis connection URL (e.g. `redis://localhost:6379`) |
| `ASSET_MARKET_URL`    | Yes      | External API endpoint for asset market data          |
| `FIAT_URL`            | Yes      | External API endpoint for fiat exchange rates        |

---

## Project Structure

```
websocket-server-market-streamer/
├── src/                    # TypeScript source files
├── dist/                   # Compiled JS output (generated)
├── .env-example            # Environment variable template
├── Dockerfile              # Node.js container definition
├── docker-compose.yml      # Full stack (app + Redis)
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript compiler config
```

---

## Background

This project was built as part of the real-time data infrastructure for **IRBTC**, a production cryptocurrency exchange platform targeting Cryptocurrency markets. The middleware pattern decouples the exchange backend from direct upstream provider dependencies — a single stable connection to Binance feeds all internal consumers via Redis-backed WebSocket distribution.

---

## Author

**Danial Panah** — Senior Backend Engineer  
[danialrp.com](https://danialrp.com) · [linkedin.com/in/danialrp](https://linkedin.com/in/danialrp) · [github.com/danialrp](https://github.com/danialrp)
