import { TezosToolkit } from "@taquito/taquito";
import { BallotValue, Period } from "../Constants";
import BigNumber from "bignumber.js";
import { BallotListResponse, BallotListResponseItem, BallotsResponse, OperationObject, PreapplyResponse, ProposalsResponseItem, VotesListingsResponse, VotingPeriodBlockResult } from "@taquito/rpc";
import { VoteContextType } from "../context/TezosContext";
import { localForger } from "@taquito/local-forging";
import { RequestSignPayloadInput, SigningType } from "@airgap/beacon-sdk";
import bs58check from "bs58check";
import { BallotStats, IsBakerResponse } from "../../types";
import { round } from "../Utils";

export default abstract class TezosService {
    public static Tezos: TezosToolkit;

    /**
     * Set the Tezos context of this service
     * @param Tezos the Taquito TezosToolkit's object that will be used for all connections to Tezos using this service
     */
    public static setTezos(Tezos: TezosToolkit) {
        this.Tezos = Tezos;
    }

    /**
     * Check if a Tezos address is a delegate/baker address
     * @param userAddress the address to check
     * @returns true if the address is delegate according to the Tezos connection context, false otherwise
     */
    public static async isBaker(userAddress: string): Promise<IsBakerResponse> {
        if (!this.Tezos) throw new Error("No Tezos context found");
        try {
            const delegate = await this.Tezos.rpc.getDelegates(userAddress);
            return {
                isBaker: true,
                isActive: !delegate?.deactivated,
                gracePeriod: 0 //delegate?.grace_period
            };
        }
        catch (error) {
            return {
                isBaker: false,
                isActive: false,
                gracePeriod: undefined
            };
        }
    }

    /**
     * 
     * @returns Get the currently voted proposal hash
     */
    public static async getCurrentProposal(): Promise<string> {
        try {
            return (await this.Tezos.rpc.getCurrentProposal())?.toString();
        }
        catch (error) {
            throw new Error();
        }
    }

    public static async getUpvotedProposals(): Promise<(string | string[])[][]> {

        const voted = await fetch(`${this.Tezos.rpc.getRpcUrl()}/chains/main/blocks/head/context/raw/json/votes/proposals?depth=1`);
        const result: (string | string[])[][] = await voted.json();
        return result;
    }

    /**
     * Get the vote casted by a delegate for the current period
     * @param userAddress the delegate's address to get the vote
     * @returns 'yay', 'nay' or 'pass' if voted. 'notvoted' if not.
     */
    public static async getBallot(userAddress: string): Promise<BallotValue> {

        try {
            const ballots: BallotListResponse = await this.Tezos.rpc.getBallotList();
            const current: BallotListResponseItem = ballots.find(delegate => delegate.pkh === userAddress);
            if (current)
                return current.ballot as BallotValue;
            else
                return BallotValue.NOT_VOTED;
        }
        catch (error) {
            console.error(JSON.stringify(error));
        }
    }

    /**
     * Get Tezos vote context: period kind, proposals...
     * @returns the VoteContextType object that represents the current Tezos context voting status.
     */
    public static async getTezosVoteContext(): Promise<VoteContextType> {
        if (!this.Tezos) throw new Error("No Tezos context found");

        let periodKind: string;
        let proposalItems: ProposalsResponseItem[];

        try {
            // Get voting period
            const votingPeriodResult: VotingPeriodBlockResult = await this.Tezos.rpc.getCurrentPeriod();
            periodKind = votingPeriodResult.voting_period.kind;

            // Get proposal list or current proposal according to period kind
            switch (periodKind) {
                case Period.PROPOSAL:
                    const proposals = await this.Tezos.rpc.getProposals();
                    proposalItems = proposals;
                    break;
                case Period.EXPLORATION:
                case Period.COOLDOWN:
                case Period.PROMOTION:
                case Period.ADOPTION:
                    const currentProposalHash: string = await this.getCurrentProposal();
                    proposalItems = [
                        [currentProposalHash, BigNumber(0)]
                    ];
                    break;
                default:
                    console.error(`Unknown period ${periodKind}`)
                    break;
            }

            let voteContext: VoteContextType = {
                periodKind: periodKind,
                periodIndex: votingPeriodResult.voting_period.index.toString(),
                remainingBlocks: votingPeriodResult.remaining,
                proposalsItems: proposalItems,
                proposalsHashs: proposalItems.map(item => item[0]),
                isUpvote: periodKind === Period.PROPOSAL,
                isBallot: periodKind === Period.PROMOTION || periodKind === Period.EXPLORATION,
                isAdoption: periodKind === Period.ADOPTION || periodKind === Period.COOLDOWN,
                noData: false
            };
            return voteContext;
        }
        catch (error) {
            console.error(error);
            const voteContext: VoteContextType = {
                periodKind: undefined,
                periodIndex: undefined,
                remainingBlocks: undefined,
                proposalsItems: undefined,
                proposalsHashs: undefined,
                isUpvote: undefined,
                isBallot: undefined,
                isAdoption: undefined,
                noData: true
            };
            return voteContext;
        }
    }

    /**
     * Forge a transaction from an operation object, sign it using current signer, then preapply and sent it.
     * @param operation the operation object, as of Taquito framework
     * @param senderAddress the address that will send the transaction
     * @returns 
     */
    public static async forgeAndSend(operation: any, senderAddress: string): Promise<string> {
        //  try {

        console.log("2. forge operation");
        console.log(this.Tezos.signer);

        //const params = await this.Tezos.prepare.toPreapply(operation);
        //console.log(params);


        //const forgedBytes: string = await Tezos.rpc.forgeOperations(operation);
        const forgedBytes = await localForger.forge(operation);

        console.log(forgedBytes);

        console.log("3. sign transaction");
        const payload: RequestSignPayloadInput = {
            signingType: SigningType.OPERATION,
            payload: '03' + forgedBytes,
            sourceAddress: senderAddress,
        };

        // TODO manage ledger too
        //const signedPayload = await connectionContext.beaconConnection.beaconWallet.client.requestSignPayload(payload);
        const signedPayload = await this.Tezos.signer.sign(payload.toString());
        const signature: string = signedPayload.sig;
        console.log(signature);

        // 4. decode signature and slice prefix
        console.log("4. decode signature");
        let sbytesBuffer: Buffer = Buffer.from(bs58check.decode(signature));
        let sbytes: string;
        if (signature.startsWith('edsig') || signature.startsWith('spsig1')) {
            sbytes = sbytesBuffer.slice(5).toString('hex');
        } else if (signature.startsWith('p2sig')) {
            sbytes = sbytesBuffer.slice(4).toString('hex');
        } else {
            sbytes = sbytesBuffer.slice(3).toString('hex');
        }

        // 5. preapply operation
        console.log("5. preapply");
        const protocol: string = await (await this.Tezos.rpc.getProtocols()).protocol;
        const preapplyParams: OperationObject = { ...operation, protocol, signature: signature };
        const preapplyResponse: PreapplyResponse[] = await this.Tezos.rpc.preapplyOperations([preapplyParams]);
        console.log(preapplyResponse[0]);
        console.log("Preapply ok");

        // 6. inject operation
        console.log("5. inject");
        const opHash = await this.Tezos.rpc.injectOperation(`${forgedBytes}${sbytes}`);
        console.log(opHash);

        return opHash;
        /* }
         catch (error: any) {
             console.error("ERROR " + error);
             throw error;
         }*/
    }

    public static async getBallotStats(): Promise<BallotStats> {

        // Extract addresses according to their vote
        const ballotList = await this.Tezos.rpc.getBallotList();
        const yayAddresses: string[] = ballotList.filter(item => item.ballot === "yay").map(item => item.pkh);
        const nayAddresses: string[] = ballotList.filter(item => item.ballot === "nay").map(item => item.pkh);
        const passAddresses: string[] = ballotList.filter(item => item.ballot === "pass").map(item => item.pkh);
        const votedAddresses = yayAddresses.concat(nayAddresses, passAddresses);

        // Extract voting powers by vote
        const votesListing: VotesListingsResponse = await this.Tezos.rpc.getVotesListings();
        const totalVotingPower: BigNumber = votesListing.reduce((acc, element) => acc.plus(element.voting_power), new BigNumber(0));
        const yayVotingPower: BigNumber = yayAddresses.map(item => this.getVotingPower(votesListing, item)).reduce((acc, item) => acc.plus(item), new BigNumber(0));
        const nayVotingPower: BigNumber = nayAddresses.map(item => this.getVotingPower(votesListing, item)).reduce((acc, item) => acc.plus(item), new BigNumber(0));
        const passVotingPower: BigNumber = passAddresses.map(item => this.getVotingPower(votesListing, item)).reduce((acc, item) => acc.plus(item), new BigNumber(0));

        const superMajority: number = Math.trunc((yayVotingPower.toNumber() / (yayVotingPower.toNumber() + nayVotingPower.toNumber())) * 10000) / 100 | 0;

        const yayPercentage: number = round(yayVotingPower.toNumber() / totalVotingPower.toNumber(), 6);
        const nayPercentage: number = round(nayVotingPower.toNumber() / totalVotingPower.toNumber(), 6);
        const passPercentage: number = round(passVotingPower.toNumber() / totalVotingPower.toNumber(), 6);
        const notVotedPercentage: number = 1 - yayPercentage - nayPercentage - passPercentage;

        const notVotedVotingPower = votesListing
            .filter(item => !votedAddresses.includes(item.pkh)) // filter addresses that didn't vote yet
            .map(item => this.getVotingPower(votesListing, item.pkh)) // find voting power for each of them
            .reduce((acc, item) => acc.plus(item), new BigNumber(0)); // and sum them

        const quorum = await this.Tezos.rpc.getCurrentQuorum() / 100;

        const ballots: BallotsResponse = await this.Tezos.rpc.getBallots();
        const castYay: number = ballots.yay.toNumber();
        const castNay: number = ballots.nay.toNumber();
        const castPass: number = ballots.pass.toNumber();
        let castedVotes: number = (castPass + castYay + castNay) / totalVotingPower.toNumber();
        castedVotes = round(castedVotes * 100);

        return {
            yayVotingPower,
            nayVotingPower,
            passVotingPower,
            yayPercentage, 
            nayPercentage,
            passPercentage,
            notVotedPercentage,
            notVotedVotingPower,
            totalVotingPower,
            quorum,
            superMajority,
            castedVotes

        } as BallotStats;
    }

    private static getVotingPower(votesListing: VotesListingsResponse, address: string): any {
        return votesListing.filter(item => item.pkh === address).map(item => item.voting_power);
    }
};