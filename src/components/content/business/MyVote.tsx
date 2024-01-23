import { TezosToolkit } from "@taquito/taquito";
import { useContext, useEffect, useState } from "react";
import UpVote from "./upvote/UpVote";
import { TezosContext, VoteContextType } from "../../../common/context/TezosContext";
import { UserContext } from "../../../common/context/UserContext";
import Ballot from "./ballot/Ballot";
import { UserData } from "../../../types";
import SetDelegate from "./SetDelegateButton";
import config from "../../../Config";

function MyVote() {

    const { voteContext }: { Tezos: TezosToolkit, voteContext: VoteContextType } = useContext(TezosContext);
    const { userData }: { userData: UserData } = useContext(UserContext);

    const [isDelegate, setDelegate] = useState<boolean>();
    const [isGracePeriod, setGracePeriod] = useState<boolean>();

    const [isBallot, setIsBallot] = useState<boolean>();
    const [isUpvote, setIsUpvote] = useState<boolean>();

    const [proposals, setProposals] = useState<any>();

    useEffect(() => {
        (async () => {

            if (voteContext) {
                setIsBallot(voteContext.isBallot);
                setIsUpvote(voteContext.isUpvote);
                setProposals(voteContext.proposalsHashs);
            }

            if (userData) {
                setDelegate(userData.isDelegate.isBaker && userData.isDelegate.isActive);
                setGracePeriod(userData.isDelegate.gracePeriod > 0);
            }
        })();
    }, [voteContext, userData, proposals, isDelegate]);

    return (
        <div className="block">
            {
                proposals && proposals.length > 0 &&
                <>
                    <hr />
                    <h5>My vote</h5>
                </>
            }

            {
                !userData && proposals && proposals.length > 0 &&
                <article className="message is-danger">
                    <div className="message-body">
                        Please connect your wallet.
                    </div>
                </article>
            }

            {
                userData && !isDelegate && !isGracePeriod &&
                <article className="message is-danger">
                    <div className="message-body">
                        You are not, or inactive, delegate.

                        {
                            config.developerMode &&
                            <>
                                <br/>
                                <br/>
                                <div>Developer mode</div>
                                <SetDelegate />
                            </>
                        }

                    </div>
                </article>
            }

            {
                userData && !isDelegate && isGracePeriod &&
                <article className="message is-danger">
                    <div className="message-body">
                        Your delegate's activation is in progress.
                    </div>
                </article>
            }

            {
                userData && isDelegate && userData.address && isBallot && proposals && proposals.length > 0 &&
                <Ballot />
            }

            {
                userData && isDelegate && userData.address && isUpvote && proposals && proposals.length > 0 &&
                <UpVote />
            }
        </div>
    )
}

export default MyVote;