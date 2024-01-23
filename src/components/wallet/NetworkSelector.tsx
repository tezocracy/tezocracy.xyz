import { TezosToolkit } from '@taquito/taquito';
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { TezosContext, VoteContextType } from '../../common/context/TezosContext';
import { UserContext } from '../../common/context/UserContext';
import { getAirgapNetwork, getDefaultNetwork, getNetworkType } from '../../common/Utils';
import { Network } from '@airgap/beacon-sdk';
import config from '../../Config';
import { ConnectionContext } from '../../common/context/ConnectionContext';
import TezosService from '../../common/service/TezosService';
import { RpcClient, RpcClientCache } from '@taquito/rpc';

function NetworkSelector() {

    const { connectionData, setConnectionData } = useContext(ConnectionContext);

    const [selectedNetwork, setSelectedNetwork] = useState<string>(getDefaultNetwork().name);
    const [previousNetwork, setPreviousNetwork] = useState<string>(getDefaultNetwork().name);

    const { userData, setUserData } = useContext(UserContext);
    const { Tezos, setTezos, setNetwork }: { Tezos: TezosToolkit, setTezos: Dispatch<SetStateAction<TezosToolkit>>, setNetwork: Dispatch<SetStateAction<Network>>} = useContext(TezosContext);
    const [displayNetworkChangeModal, setDisplayNetworkChangeModal] = useState<boolean>(false);

    const [voteContext, setVoteContext] = useState<VoteContextType>(undefined);

    const disconnect = async () => {
        if (userData !== undefined) {
            if (connectionData.ledgerConnection?.transport)
            connectionData.ledgerConnection.transport.close();
            setUserData(undefined);
            Tezos.setSignerProvider(undefined);
            setConnectionData(undefined);
            await connectionData?.beaconConnection?.beaconWallet?.clearActiveAccount();
        }
    }

    const networkList = () => {
        return config.networks.map((network) => {
            return <option value={network.name} key={network.name}>{network.name}</option>
        })
    }

    const displayModal = (e) => {
        setDisplayNetworkChangeModal(true);
    }

    const hideModal = () => {
        setDisplayNetworkChangeModal(false);
    }

    const cancel = () => {
        hideModal();
        setSelectedNetwork(previousNetwork);
    }

    const confirm = () => {
        hideModal();
        disconnect();
        update(selectedNetwork);
    }

    const update = async (newValue: string) => {
        const newNetwork = config.networks.find(network => network.name === newValue);
        const rpcClient: RpcClient = new RpcClient(newNetwork.rpcUrl)
        const newTezos: TezosToolkit = new TezosToolkit(new RpcClientCache(rpcClient));
        setTezos(newTezos);
        setNetwork(getAirgapNetwork(getNetworkType(newNetwork)));
        TezosService.setTezos(newTezos);
        setVoteContext(await TezosService.getTezosVoteContext());
    }

    const changeNetwork = (e) => {
        //e.preventDefault();
        setPreviousNetwork(selectedNetwork);
        setSelectedNetwork(e.target.value);
        if (userData === undefined) {
            update(e.target.value);
        }
        else {
            displayModal(e.target.value);
        }
    }

    return (
        <>
            <div className="select network-selector">
                <select value={selectedNetwork} onChange={changeNetwork}>
                    {networkList()}
                </select>
            </div>

            <div className={`modal is-clipped ${displayNetworkChangeModal ? 'is-active' : ''}`}>
                <div className="modal-background"></div>
                <div className="modal-content">

                    <div className="card popup">
                        <header className="card-header">
                            <p className="card-header-title">
                                You will have to reconnect your wallet. Continue?
                            </p>
                        </header>
                        <div className="card-content">
                            <div className="content">
                                <div className="columns">
                                    <div className='column'>
                                        <button className="button is-success" onClick={confirm}>Yes, disconnect</button>
                                    </div>
                                    <div className='column'>
                                        <button className="button is-warning" onClick={cancel}>No, keep me connected</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="modal-close is-large" aria-label="close" onClick={hideModal}></button>
            </div>
        </>
    )
};

export default NetworkSelector;