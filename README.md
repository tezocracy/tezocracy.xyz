# Tezocracy

## Presentation

Online voting interface for Tezos bakers.

### Made with

- Node.js 16
- React
- Craco
- Typescript
- Taquito
- Beacon Wallet
- ReactBootstrap

## Install

Git clone, then:

````
npm install
````

````
npm run build
````

```
npm run start
```

## Configuration

See `Config.tsx`

**Application configuration:**

`name`: application name, displayed in header

`githubRepo`: URL of Github repository (displayed in header with Github icon).


**Network configuration:**

`rpcUrl`: Tezos network RPC endpoint

`viewerUrl`: URL of a viewer that displays operation detail like `http://viewer-url.com/{tx_hash}` (eg. https://ghostnet.tzkt.io)

## Deploy

Deploy with Docker using Dockerfile.

Build Docker image:

```
docker build . -t tezocracy
```

Run Docker image:
```
docker run -p 80:80 tezocracy
```