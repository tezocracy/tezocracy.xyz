import configData from './config.json';
import { Config } from './types';

require('dotenv').config();

const config: Config = configData;

// keep only parameter network

switch (process.env.REACT_APP_NETWORK) {
    case undefined:
       // console.log("No network defined, use mainnet.");
        config.networks=Array.of(config.networks.find(network => network.name.toLowerCase() === 'mainnet'));
        break;
    case "all":
        break;
    default:
        config.networks = Array.of(config.networks.find(network => network.name.toLowerCase() === process.env.REACT_APP_NETWORK.toLowerCase()));
}

if (config.networks.length === 0 || config.networks[0] === undefined)
    console.error(`Requested network ${process.env.REACT_APP_NETWORK} is not found in configuration.`);

export default config;