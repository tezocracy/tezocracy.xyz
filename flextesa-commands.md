# Flextesa commands for Tezocracy test

Tested with [Flextesa](https://tezos.gitlab.io/flextesa/).
Tezos client commands reminder: [https://chrispinnock.com/tezos/octezclient/](https://chrispinnock.com/tezos/octezclient/)

## Install and run

```shell
docker run --rm --name tezos-sandbox --detach -p 20000:20000 \
       -e block_time=10 \
       -e flextesa_node_cors_origin='*' \
       oxheadalpha/flextesa:latest nairobibox start
```
(Replace `nairobibox` withe the current Flextesa's box)

### Check if running

Check current running version:

```shell
docker exec tezos-sandbox octez-node --version
```

Check available accounts:

```shell
docker exec tezos-sandbox octez-client list known contracts
```

It should list the 3 embedded accounts:

```shell
baker0: tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU
bob: tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6
alice: tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb
```



## Connect local Tezocracy to Flextesa

Set env var to start app:
```shell
REACT_APP_NETWORK=custom
```

## Inject proposal

Inject proposal using `baker0` default Flextesa baker account.

```shell
docker exec tezos-sandbox octez-client submit proposals for baker0 PtTezocracyTestDoNotUpvotexxxxxxxxxxxxxxxxxxxBg1e2s --force
```
Another one, if needed: `PtTezocracyTestDoNotUpvoteyyyyyyyyyyyyyyyyyyy7FsxXb`.

## Use Alice account as baker to vote in web wallet

### Import Alice in your wallet to be able to vote

You can get Alice's private key with the following command:
```shell
docker exec tezos-sandbox nairobibox info
```
(Replace `nairobibox` withe the current Flextesa's box)

And use it to import Alice's account in your favorite wallet.

You can now connect Tezocracy UI with your wallet.

### Register Alice as delegate

`baker0` has injected the proposal, so he can't vote any more. We register `alice` as delegate to vote.
(Don't forget to import alice account in your wallet)

```shell
docker exec tezos-sandbox octez-client register key alice as delegate
```

You can now vote as Alice.


## Test with Ledger

It is not possible to import Ledger account in Flextesa because of Docker limitations regarding USB connection.
We will use a workaround to do that.

1) Install octez-client (https://tezos.gitlab.io/introduction/howtoget.html) on your computer. For ledger operation, you will run it using `--endpoint http://localhost:20000` to be connected to Flextesa network.
2) Run Flextesa as usual with Docker
3) In the octez-client terminal, import your Ledger account with
`octez-client --endpoint http://localhost:20000 list connected ledgers ` then follow instructions at https://tezos.gitlab.io/user/key-management.html
4) In Flextesa terminal, send at least 6000 tez to your Ledger from any other account
5) In octez-client terminal, register your Ledger as delegate 
6) In Flextesa terminal, inject proposal
7) You can now connect on UI with your Ledger and vote.