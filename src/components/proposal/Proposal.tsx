import { TezosToolkit } from "@taquito/taquito";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import ProposalBallotStat from "./ProposalBallotStat";
import Constants from "../../Constants";
import { ProposalsResponseItem } from '@taquito/rpc';
import BigNumber from 'bignumber.js';
import React from "react";
import ProposalUpvoteStat from "./ProposalUpvoteStat";

function Proposal({ Tezos, setPeriod, setProposals }: { Tezos: TezosToolkit, setPeriod: Dispatch<SetStateAction<string>>, setProposals: Dispatch<SetStateAction<ProposalsResponseItem[]>> }) {

    const [proposals, setInternalProposals] = useState<ProposalsResponseItem[]>([]);
    const [remaining, setRemaining] = useState<number | string>(0);
    const [periodKind, setPeriodKind] = useState<string>("");

    useEffect(() => {
        (async () => {

            Tezos.rpc.getCurrentPeriod()
                .then((period) => {
                    console.log(`Current period: ${JSON.stringify(period)}`)
                    let kind = period.voting_period.kind;

                    setRemaining(period.remaining);
                    setPeriodKind(kind);
                    setPeriod(kind);
                    console.log(`period ${kind}`)

                    switch (kind) {
                        case Constants.Period.PROPOSAL:
                            console.log("Proposal period");

                            Tezos.rpc.getProposals()
                                .then((proposals) => {
                                    console.log(proposals);
                                    if (proposals && proposals[0]) {
                                        setProposals(proposals);
                                        setInternalProposals(proposals);
                                    }
                                });

                            break;

                        case Constants.Period.EXPLORATION:
                        case Constants.Period.PROMOTION:

                            console.log("Ballot period");
                            Tezos.rpc.getCurrentProposal()
                                .then((hash) => {
                                    const proposalHash: string = hash?.toString() || "";
                                    const proposalsListOfOne: ProposalsResponseItem[] = [
                                        [proposalHash, BigNumber(0)]
                                    ];
                                    setProposals(proposalsListOfOne);
                                    setInternalProposals(proposalsListOfOne);
                                    console.log(`proposal hash ${proposalHash}`)
                                })
                                .catch((error) => { console.error(error); /*setProposalHash("error")*/ });

                            break;
                        default:
                            console.error(`Unknown period ${kind}`)
                            break;
                    }

                })
                .catch((error) => { console.error(error); setRemaining("error") });

        })();
    }, []);


    return (
        <Card>
            <Card.Body>
                <div>
                    <h4>Proposal</h4>
                    <div className="list-item"><div className="item-name">Period:</div><div className="item-value">{periodKind}</div></div>
                    <div className="list-item"><div className="item-name">Remaining:</div><div className="item-value">{remaining}</div></div>

                    {
                        (periodKind === Constants.Period.EXPLORATION || periodKind === Constants.Period.PROMOTION) &&

                        <div className="list-item">
                            <div className="item-name">Protocol:</div>
                            {proposals.map((item: ProposalsResponseItem, index) => (
                                <React.Fragment key={index}>
                                    <div className="item-value">{item[0]}</div>
                                </React.Fragment>
                            ))}
                        </div>
                    }
                </div>
                <hr />
                <div>
                    {
                        periodKind === Constants.Period.PROPOSAL && 
                        <ProposalUpvoteStat Tezos={Tezos} proposals={proposals} />
                    }
                    {
                        (periodKind === Constants.Period.EXPLORATION || periodKind === Constants.Period.PROMOTION)  &&
                        <ProposalBallotStat Tezos={Tezos} />
                    }
                </div>
            </Card.Body>
        </Card>
    );
}

export default Proposal;