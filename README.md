# Tezocracy

## Presentation

Online voting interface for Tezos bakers.

### Made with

- Node.js 20
- React
- React-wired-app
- Typescript
- Taquito
- Beacon Wallet
- Bulma

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

See: 
- `config.json`: raw configuration data, set all configured networs
- `Config.tsx`: load network configuration according to env var `REACT_APP_NETWORK`

Set env var `REACT_APP_NETWORK`to define on which network application is build:
- `all`: all networks defined in `config.json`, will display a select box to choose the network to connect to. The application is reloaded when new network is changed.
- `mainnet`, `ghostnet` or any other network name: the given network
- `custom` to connect to local network, for test purpose.

**Application configuration:**

`applicationName`: application name, displayed in header

`githubRepositoryUrl`: URL of Github repository (displayed in header with Github icon).

`defaultLedgerDerivationPath`: to display default Ledger derivation path

`blockTimeInSeconds`: block time in seconds, used to estimate time to end of current period.

`developerMode`: start application in developer mode

**Network configuration:**

Array of items:

```
[
    {
        "name": "Mainnet",
        "rpcUrl": "https://mainnet.api.tez.ie",
        "default": true,
        "viewerUrl": "https://tzkt.io/{OP_HASH}"
    },
    {
        "name": "Ghostnet",
        "rpcUrl": "https://rpc.ghostnet.teztnets.xyz",
        "default": false,
        "viewerUrl": "https://ghostnet.tzkt.io/{OP_HASH}"
    }
]
```

`rpcUrl`: Tezos network RPC endpoint

`viewerUrl`: URL of a viewer that displays operation detail like `http://viewer-url.com/{OP_HASH}` (eg. `https://ghostnet.tzkt.io/{OP_HASH}`, {OP_HASH} will be replaced by operation hash to create link) 

`default`: 
- if `REACT_APP_NETWORK` is set to `all`, a select box will display networks list. Set `true` for the default network and `false` for other networks. (If you set several networks to `true` the first one whill be chosen as default).
- if `REACT_APP_NETWORK` is set to `mainnet`, `ghostnet` or any other network name, just set `true`.

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

## Test with Flextesa

See [Flextesa commands](./flextesa-commands.md)