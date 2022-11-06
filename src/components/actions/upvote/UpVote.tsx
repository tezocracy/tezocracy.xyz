import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";
import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import UpVoteButton from "./UpVoteButton";
import UpVoteResult from "./UpVoteResult";
import { ProposalsResponseItem } from '@taquito/rpc';
import axios from 'axios';
import Config from '../../../Config';

function UpVote({ Tezos, wallet, userAddress, isDelegate, proposals }: { Tezos: TezosToolkit, wallet: BeaconWallet, userAddress: string, isDelegate: boolean, proposals: ProposalsResponseItem[] }) {

    const [votedProposals, setVotedProposals] = useState<Set<string>>(new Set<string>());
    const [notVotedProposals, setNotVotedProposals] = useState<Set<string>>(new Set<string>());

    const filterUpvoted = async (userAddress: string, votes: any[]): Promise<void> => {
        votes.forEach((item => {
            const proposalName = item[0];
            const proposalVotes = item[1];
            if (proposalVotes.includes(userAddress)) {
                votedProposals.add(proposalName);
            }
            else {
                notVotedProposals.add(proposalName);
            }
        }))
    }

    useEffect(() => {
        (async () => {
            axios.get(`${Config.network.rpcUrl}/chains/main/blocks/head/context/raw/json/votes/proposals?depth=1`)
                .then(async (response) => {
                    const votes: any[] = response.data;
                    await filterUpvoted('tz1LVqmufjrmV67vNmZWXRDPMwSCh7mLBnS3', votes);
                })
        })();
    }, [proposals]);

    return (
        <>
            {
                !isDelegate &&
                <div>
                    <Alert variant="danger">
                        You are not a delegate.
                    </Alert>
                </div>
            }
            {
                isDelegate && proposals.length === 0 &&
                <div>
                    <Alert variant="danger">
                        No proposals submitted for upvote yet.
                    </Alert>
                </div>
            }
            {
                isDelegate && notVotedProposals.size > 0 &&
                <UpVoteButton Tezos={Tezos} wallet={wallet} userAddress={userAddress} proposals={Array.from(notVotedProposals)} />
            }
            {
                isDelegate && votedProposals.size > 0 &&
                <UpVoteResult votedProposals={Array.from(votedProposals)} />
            }
        </>
    )
};

export default UpVote;