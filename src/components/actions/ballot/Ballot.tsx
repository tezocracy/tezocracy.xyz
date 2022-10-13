import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";
import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import BallotButtons from "./BallotButtons";
import BallotResult from "./BallotResult";

function Ballot({ Tezos, wallet, userAddress, isDelegate, proposal }: { Tezos: TezosToolkit, wallet: BeaconWallet, userAddress: string, isDelegate: boolean, proposal: string | undefined }) {

    const [hasVoted, setHasVoted] = useState<boolean>(false);
    const [currentBallot, setCurrentBallot] = useState<string>("");

    useEffect(() => {
        (async () => {

            Tezos.rpc.getBallotList()
                .then((result) => {
                    const current = result.find(delegate => delegate.pkh === userAddress);
                    if (current) {
                        setHasVoted(true);
                        setCurrentBallot(current.ballot);
                    }
                    else {
                        setHasVoted(false);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });


            const proposal: string | undefined = (await Tezos.rpc.getCurrentProposal())?.toString();

        })();
    }, []);

    return (
        <div>
            <h4>My ballot</h4>
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
                        No proposals submitted for ballot yet.
                    </Alert>
                </div>
            }
            {
                isDelegate && proposal && !hasVoted &&
                <BallotButtons Tezos={Tezos} wallet={wallet} userAddress={userAddress} />
            }
            {
                isDelegate && proposal && hasVoted &&
                <BallotResult currentBallot={currentBallot} />
            }
        </div>
    )
}

export default Ballot;