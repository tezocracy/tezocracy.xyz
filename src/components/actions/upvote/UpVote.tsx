import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";
import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import UpVoteButton from "./UpVoteButton";
import UpVoteResult from "./UpVoteResult";
import { ProposalsResponseItem } from '@taquito/rpc';


function UpVote({ Tezos, wallet, userAddress, isDelegate, proposals }: { Tezos: TezosToolkit, wallet: BeaconWallet, userAddress: string, isDelegate: boolean, proposals: ProposalsResponseItem[] }) {

    const [hasVoted, setHasVoted] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            // TODO what about has voted?
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
                isDelegate && proposals.length == 0 &&
                <div>
                    <Alert variant="danger">
                        No proposals submitted for upvote yet.
                    </Alert>
                </div>
            }
            {
                isDelegate && proposals.length > 0 && !hasVoted &&
                <UpVoteButton Tezos={Tezos} wallet={wallet} userAddress={userAddress} proposals={proposals} />
            }
            {
                isDelegate && proposals.length > 0 && hasVoted &&
                <UpVoteResult />
            }

        </>
    )
};

export default UpVote;