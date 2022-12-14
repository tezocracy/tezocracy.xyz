import { NetworkType } from "@airgap/beacon-sdk";

let networks = new Map();

networks.set('mainnet', {
    networkType: NetworkType.MAINNET,
    rpcUrl: "https://mainnet.tezos.marigold.dev/",
    viewerUrl: "https://tzkt.io"
});

networks.set('ghostnet', {
    networkType: NetworkType.GHOSTNET,
    rpcUrl: "https://rpc.ghostnet.teztnets.xyz/",
    viewerUrl: "https://ghostnet.tzkt.io"
});

networks.set('k', {
    networkType: NetworkType.KATHMANDUNET,
    rpcUrl: "https://rpc.kathmandunet.teztnets.xyz/",
    viewerUrl: "https://kathmandunet.tzkt.io"
});

let Config = {
    application: {
        name: "Tezocracy.xyz",
        githubRepository: "https://github.com/tezocracy/tezocracy.xyz"
    },
    network: networks.get('mainnet')
}

export default Config;
