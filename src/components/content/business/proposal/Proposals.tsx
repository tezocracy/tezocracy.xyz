import { TezosToolkit } from "@taquito/taquito";
import { useContext, useEffect, useState } from "react";
import ProposalBallotStat from "./ProposalBallotStat";
import { ProposalsResponseItem } from '@taquito/rpc';
import ProposalUpvoteStat from "./ProposalUpvoteStat";
import { TezosContext, VoteContextType } from "../../../../common/context/TezosContext";
import MyVote from "../MyVote";
import { blockNumberToTime, getAirgapNetwork, getDefaultNetwork, getNetworkType } from "../../../../common/Utils";
import FeedbackMessage from "../../../../common/components/FeedbackMessage";
import { ConnectionContext } from "../../../../common/context/ConnectionContext";


function Proposal() {

    const { voteContext }: { Tezos: TezosToolkit, voteContext: VoteContextType } = useContext(TezosContext);
    const { connectionData } = useContext(ConnectionContext);

    const [proposals, setProposals] = useState<ProposalsResponseItem[]>([]);
    const [remaining, setRemaining] = useState<number>(0);
    const [periodKind, setPeriodKind] = useState<string>(undefined);

    const [isBallot, setIsBallot] = useState<boolean>(false);
    const [isUpvote, setIsUpvote] = useState<boolean>(false);
    const [isAdoption, setIsAdoption] = useState<boolean>(false);

    const [errorMessage, setErrorMessage] = useState<string>(undefined);

    useEffect(() => {
        (async () => {
            setErrorMessage(undefined);
            if (voteContext) {
                if(voteContext.noData === true){
                    setErrorMessage("No governance information found.");
                }
                else {
                    setPeriodKind(voteContext?.periodKind);
                    setRemaining(voteContext?.remainingBlocks);
                    setProposals(voteContext?.proposalsItems);
                    setIsBallot(voteContext?.isBallot);
                    setIsUpvote(voteContext?.isUpvote);
                    setIsAdoption(voteContext?.isAdoption);
                } 
            }
        })();
    }, [voteContext]);


    return (
        <div className="card">
            <div className="card-content">
                <div>
                    <h4 className="title is-4">Governance</h4>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Period</th>
                                <th>Remaining</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="is-capitalized">{periodKind}</td>
                                <td>{remaining} blocks / {blockNumberToTime(remaining, connectionData?.network || getAirgapNetwork(getNetworkType(getDefaultNetwork())))}</td>
                            </tr>
                        </tbody>
                    </table>

                </div>
                <hr />
                <div>
                    {
                        isUpvote &&
                        <ProposalUpvoteStat />
                    }
                    {
                        (isAdoption) &&
                        <div className="ballot-result">
                            <div className="block protocol-hash">
                                {proposals[0][0]}
                            </div>
                        </div>
                    }
                    {
                        (isBallot) &&
                        <ProposalBallotStat />
                    }
                    {
                        (isBallot || isUpvote) &&
                        <MyVote />
                    }
                    {
                        errorMessage &&
                        <FeedbackMessage infoMessage={undefined} errorMessage={errorMessage} successMessage={undefined} loading={false} />
                    }
                </div>
            </div>
        </div>
    );
}

export default Proposal;