import { Network, NetworkType } from '@airgap/beacon-sdk';
import config from '../Config';
import { ConfigNetwork } from '../types';

const getDefaultNetwork = (): ConfigNetwork => {
    if (config.networks.length === 1)
        return config.networks[0];
    else
        return config.networks.find(network => network.default === true);
}

const getConfigNetwork = (networkName: string): ConfigNetwork => {
    if (networkName === undefined)
        return getDefaultNetwork();
    return config.networks.find(network => network.name.toLowerCase() === networkName.toLowerCase());
}

const getAirgapNetwork = (networkType: NetworkType): Network => {
    const network = getConfigNetwork(networkType);
    return {
        type: networkType as NetworkType,
        name: network.name,
        rpcUrl: network.rpcUrl
    } as Network;
}

const getNetworkType = (network: ConfigNetwork): NetworkType => {
    switch (network.name.toString().toLowerCase()) {
        case "mainnet":
            return NetworkType.MAINNET;
        case "ghostnet":
            return NetworkType.GHOSTNET;
        case "custom":
            return NetworkType.CUSTOM;
        case "mumbainet":
            return NetworkType.MUMBAINET;
        case "nairobinet":
            return NetworkType.NAIROBINET;
        default:
            return null;
    }
}

const blockNumberToTime = (blockNumber: number, currentNetwork: Network): any => {
    let network: ConfigNetwork = getConfigNetwork(currentNetwork.name);
    if (network === undefined)
        network = getDefaultNetwork();
    let seconds = blockNumber * network.blockTimeInSeconds;

    var days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    var hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    const result = (minutes > 0) ? `${days} days, ${hours}h ${minutes}m` : `${seconds} seconds`;
    return result;
}

const shortAddress = (address: string, size: number): string => {
    return address.substring(0, size) + "..." + address.substring(address.length - size);
}

const toViewerUrl = (network: Network, operationId: string): string => {
    return (getConfigNetwork(network.name).viewerUrl).replace("{OP_HASH}", operationId);
}

const toOpHTMLLink = (network: Network, operationId: string): string => {
    return `<a href="${toViewerUrl(network, operationId)}" target="_blank">${operationId}</a>`;
}

const round = (input: number, decimals: number = 2): number => {
    return Number.parseFloat(input.toFixed(decimals));
}

const toPercentage = (input: number): string => {
    return (input * 100).toFixed(2);
}

export { getDefaultNetwork, getConfigNetwork, getAirgapNetwork, getNetworkType, blockNumberToTime, shortAddress, toOpHTMLLink, round, toPercentage };