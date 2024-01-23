import { TezosToolkit } from '@taquito/taquito';
import { Dispatch, SetStateAction, createContext } from 'react';
import { getDefaultNetwork } from '../Utils';
import { Network } from '@airgap/beacon-sdk';
import { ProposalsResponseItem } from '@taquito/rpc';

type VoteContextType = {
    periodKind: string;
    periodIndex: string;
    remainingBlocks: number;
    proposalsItems: ProposalsResponseItem[];
    proposalsHashs: string[];
    isUpvote: boolean;
    isBallot: boolean;
    isAdoption: boolean;
    noData: boolean;
}

type TezosContextType = {
    Tezos: TezosToolkit;
    setTezos: Dispatch<SetStateAction<TezosToolkit>>;
    voteContext: VoteContextType;
    setVoteContext: Dispatch<SetStateAction<VoteContextType>>;
    network: Network;
    setNetwork:Dispatch<SetStateAction<Network>>;
}

const defaultTezosContext: TezosContextType = {
    Tezos: new TezosToolkit(getDefaultNetwork().rpcUrl),
    setTezos: undefined,
    voteContext: undefined,
    setVoteContext: undefined,
    network: undefined,
    setNetwork: undefined
}

const TezosContext = createContext(defaultTezosContext);

export { TezosContext, VoteContextType };