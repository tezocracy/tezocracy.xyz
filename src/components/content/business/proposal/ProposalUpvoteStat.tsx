import { TezosToolkit } from "@taquito/taquito";
import { useContext, useEffect, useState } from "react";
import { TezosContext, VoteContextType } from "../../../../common/context/TezosContext";
import BigNumber from "bignumber.js";
import { ProposalsResponseItem } from "@taquito/rpc";
import React from "react";

function ProposalUpvoteStat() {

    const { Tezos, voteContext }: { Tezos: TezosToolkit, voteContext: VoteContextType } = useContext(TezosContext);

    const [votingPower, setVotingPower] = useState<BigNumber>(BigNumber(1));

    useEffect(() => {
        (async () => {

            Tezos.rpc.getVotesListings().then((listing) => {
                const totalVotingPower = listing.reduce((accumulator, item) => (item.voting_power) ? BigNumber.sum(accumulator, item.voting_power) : accumulator, new BigNumber(0));
                setVotingPower(totalVotingPower);
            })

        })();
    }, [Tezos.rpc]);

    return (
        <div className="block">
            <h5>Upvote status</h5>

            <div className="block">
                {voteContext?.proposalsItems?.map((item: ProposalsResponseItem, index: number) => (
                    <React.Fragment key={index} >
                        <div className="block">
                            
                            <span className="item-value">{item[0]}</span>
                            <span>&nbsp;</span>
                            <span >
                                ({(item[1].dividedBy(votingPower).multipliedBy(100).toPrecision(3, BigNumber.ROUND_UP)).toString()}%)
                            </span>
                            <span>
                                <progress className="progress is-primary" value={(item[1].dividedBy(votingPower).multipliedBy(100).toPrecision(3, BigNumber.ROUND_UP))} max="100">15%</progress>
                            </span>
                        </div>
                    </React.Fragment>
                ))}

                {
                    (!voteContext?.proposalsItems || voteContext.proposalsItems.length === 0) &&

                    <article className="message is-info">
                        <div className="message-body">
                            No proposals available for upvote.
                        </div>
                    </article>
                }
            </div>
        </div>
    )
}

export default ProposalUpvoteStat;