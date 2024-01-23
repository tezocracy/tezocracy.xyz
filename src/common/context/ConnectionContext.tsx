import { Network } from '@airgap/beacon-sdk';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { Dispatch, SetStateAction, createContext } from 'react';


type ConnectionDataType = {
    beaconConnection: {
        beaconWallet: BeaconWallet;
    },
    ledgerConnection: {
        transport: any;
    }
    network: Network;
}

const defaultConnectionData: ConnectionDataType = {
    beaconConnection: undefined,
    ledgerConnection: undefined,
    network: undefined
}

type ConnectionContextType = {
    connectionData: ConnectionDataType;
    setConnectionData: Dispatch<SetStateAction<ConnectionDataType>>
}

const defaultConnectionContext: ConnectionContextType = {
    connectionData: defaultConnectionData,
    setConnectionData: undefined
}

const ConnectionContext = createContext(defaultConnectionContext);

export { ConnectionContext, ConnectionContextType, ConnectionDataType };