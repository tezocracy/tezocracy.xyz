import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";
import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import UpVoteButton from "./UpVoteButton";
import UpVoteResult from "./UpVoteResult";


function UpVote({ Tezos, wallet, userAddress, isDelegate, proposal }: { Tezos: TezosToolkit, wallet: BeaconWallet, userAddress: string, isDelegate: boolean, proposal: string | undefined }) {

    const [hasVoted, setHasVoted] = useState<boolean>(false);

    useEffect(() => {
        (async () => {

        })();
    }, [proposal]);

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
                isDelegate && !proposal &&
                <div>
                    <Alert variant="danger">
                        No proposals submitted for upvote yet.
                    </Alert>
                </div>
            }
            {
                isDelegate && proposal && !hasVoted &&
                <UpVoteButton Tezos={Tezos} wallet={wallet} userAddress={userAddress} proposal={proposal} />
            }
            {
                isDelegate && proposal && hasVoted &&
                <UpVoteResult />
            }

        </>
    )
};

export default UpVote;