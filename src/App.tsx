import React, { useEffect, useState } from 'react';
import Wallet from './components/wallet/Wallet';
import { TezosToolkit } from '@taquito/taquito';
import { UserData } from './types';
import { TezosContext, VoteContextType } from './common/context/TezosContext';
import { UserContext } from './common/context/UserContext';
import { getDefaultNetwork, getNetworkType, getAirgapNetwork } from './common/Utils';
import { ConnectionContext, ConnectionDataType } from './common/context/ConnectionContext';
import Content from './components/content/Content';
import { Network } from '@airgap/beacon-sdk';
import Navbar from './components/layout/Navbar';
import Sponsors from './components/layout/Sponsors';
import TezosService from './common/service/TezosService';
import { RpcClient, RpcClientCache } from '@taquito/rpc';
import Footer from './components/layout/Footer';

function App() {

    const rpcClient: RpcClient = new RpcClient(getDefaultNetwork().rpcUrl)
    const [Tezos, setTezos] = useState<TezosToolkit>(new TezosToolkit(new RpcClientCache(rpcClient)));
    const [network, setNetwork] = useState<Network>(getAirgapNetwork(getNetworkType(getDefaultNetwork())));
    const [userData, setUserData] = useState<UserData | undefined>(undefined);
    const [connectionData, setConnectionData] = useState<ConnectionDataType>(undefined);
    const [voteContext, setVoteContext] = useState<VoteContextType>(undefined);

    useEffect(() => {
        (async () => {
            TezosService.setTezos(Tezos);
            setVoteContext(await TezosService.getTezosVoteContext());
        })();
    }, []);


    return (
        <TezosContext.Provider value={{ Tezos, setTezos, voteContext, setVoteContext, network, setNetwork }}>
            <ConnectionContext.Provider value={{ connectionData, setConnectionData }}>
                <UserContext.Provider value={{ userData, setUserData }}>
                    <Navbar />
                    <h6 className='subtitle is-6'>A tool for Tezos Bakers to vote for Governance Proposals, directly from the Browser!</h6>
                    <div className='columns main-row layout-row'>
                        <div className='column'>
                            <div className='block'>
                                <Wallet />
                            </div>
                            <div className='block'>
                                <Sponsors />
                            </div>
                        </div>
                        <div className="column is-two-thirds">
                            <Content />
                        </div>
                    </div>
                    <Footer />
                </UserContext.Provider>
            </ConnectionContext.Provider>
        </TezosContext.Provider>
    );
}

export default App;