import { TezosToolkit } from "@taquito/taquito";
import { useEffect, useState } from "react";
import { ProposalsResponseItem } from '@taquito/rpc';
import React from "react";
import BigNumber from 'bignumber.js';

function ProposalUpvoteStat({ Tezos, proposals }: { Tezos: TezosToolkit, proposals: ProposalsResponseItem[] }) {

    const [votingPower, setVotingPower] = useState<BigNumber>(BigNumber(1));

    useEffect(() => {
        (async () => {

            Tezos.rpc.getVotesListings().then((listing) => {
                const totalVotingPower = listing.reduce((accumulator, item) => (item.voting_power) ? BigNumber.sum(accumulator, item.voting_power) : accumulator, new BigNumber(0));
                setVotingPower(totalVotingPower);
            })

        })();
    }, []);

    return (
        <div>
            <h5>Upvote status</h5>

            <div>
                {proposals.map((item: ProposalsResponseItem, index: number) => (
                    <React.Fragment key={index}>
                        <div className="list-item">
                            <span className="item-name">{item[0]}</span>
                            <span className="item-value">
                                {( item[1].dividedBy(votingPower).multipliedBy(100).toPrecision(3, BigNumber.ROUND_UP)  ).toString()}%
                            </span>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

export default ProposalUpvoteStat;