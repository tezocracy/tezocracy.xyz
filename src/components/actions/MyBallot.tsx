import { TezosToolkit } from "@taquito/taquito";
import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import Constants from "../../Constants";
import Ballot from "./ballot/Ballot";
import Wallet from "../wallet/Wallet";
import UpVote from "./upvote/UpVote";

function MyBallot({ Tezos, period, proposal }: { Tezos: TezosToolkit, period: string, proposal: string | undefined }) {

    const [userAddress, setUserAddress] = useState<string>("");
    const [wallet, setWallet] = useState<any>();
    const [isDelegate, setDelegate] = useState<boolean>(false);

    const [isBallot, setIsBallot] = useState<boolean>(false);
    const [isUpvote, setIsUpvote] = useState<boolean>(false);

    useEffect(() => {
        (async () => {

            setIsBallot(period === Constants.Period.PROMOTION || period === Constants.Period.EXPLORATION);
            setIsUpvote(period === Constants.Period.PROPOSAL);

            console.log(`proposal ${proposal}`);
            console.log(`isBallot ${isBallot}`);
            console.log(`isUpvote ${isUpvote}`);

        })();
    }, [period, proposal]);

    return (
        <div>
            <Card>
                <Card.Body>
                    <Wallet
                        Tezos={Tezos}
                        wallet={wallet}
                        setWallet={setWallet}
                        userAddress={userAddress}
                        setUserAddress={setUserAddress}
                        setDelegate={setDelegate} />

                    {
                        userAddress && isBallot &&
                        <div>
                            <hr />
                            <Ballot Tezos={Tezos} wallet={wallet} userAddress={userAddress} isDelegate={isDelegate} proposal={proposal} />
                        </div>
                    }

                    {
                        userAddress && isUpvote &&
                        <div>
                            <hr />
                            <UpVote Tezos={Tezos} wallet={wallet} userAddress={userAddress} isDelegate={isDelegate} proposal={proposal} />
                        </div>
                    }

                </Card.Body>
            </Card>
        </div>
    )
}

export default MyBallot;