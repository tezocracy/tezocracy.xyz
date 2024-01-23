import BigNumber from "bignumber.js";

type Config = {
    applicationName: string;
    githubRepositoryUrl: string | undefined;
    networks: ConfigNetwork[];
    defaultLedgerDerivationPath: string;
    developerMode: boolean;
}

type ConfigNetwork = {
    name: string;
    rpcUrl: string;
    default: boolean;
    viewerUrl: string;
    blockTimeInSeconds: number;
}

type UserData = {
    address: string;
    balance: number;
    isDelegate: IsBakerResponse;
}

type IsBakerResponse = {
    isBaker: boolean;
    isActive: boolean;
    gracePeriod: number;
}

type BallotStats = {
    yayVotingPower: BigNumber;
    nayVotingPower: BigNumber;
    passVotingPower: BigNumber;
    notVotedVotingPower: BigNumber;
    yayPercentage: number;
    nayPercentage: number;
    passPercentage: number;
    notVotedPercentage: number;
    totalVotingPower: BigNumber;
    quorum: number;
    superMajority: number;
    castedVotes: number;
}

export { Config, UserData, ConfigNetwork, IsBakerResponse, BallotStats };