import { TezosToolkit } from "@taquito/taquito";
import { useContext, useEffect, useState } from "react";
import { TezosContext, VoteContextType } from "../../../../common/context/TezosContext";
import ChartJS, { ArcElement, PieController } from 'chart.js/auto';
import { Pie } from "react-chartjs-2";
import TezosService from "../../../../common/service/TezosService";
import { BallotStats } from "../../../../types";

function ProposalBallotStat() {

    const SUPERMAJORITY_TARGET: number = 80;

    const { voteContext }: { Tezos: TezosToolkit, voteContext: VoteContextType } = useContext(TezosContext);

    const [yayPct, setYayPct] = useState<number>(0);
    const [nayPct, setNayPct] = useState<number>(0);
    const [passPct, setPassPct] = useState<number>(0);
    const [notVotedPct, setNotVotedPct] = useState<number>(0);

    const [superMajority, setSupermajority] = useState<number>();
    const [quorum, setQuorum] = useState<number>();
    const [votesCast, setVotesCast] = useState<number>();

    const [superMajorityClass, setSupermajorityClass] = useState<string>(undefined);
    const [quorumClass, setQuorumClass] = useState<string>(undefined);

    ChartJS.register(ArcElement, PieController);

    const toPercentage = (input: number): string => {
        return (input * 100).toFixed(2);
    }
 
    const data = {
        labels: [
            `Yay (${toPercentage(yayPct)} %)`,
            `Nay (${toPercentage(nayPct)} %)`,
            `Pass (${toPercentage(passPct)} %)`,
            `No vote (${toPercentage(notVotedPct)} %)`
        ],
        datasets: [{
            label: "",
            data: [yayPct, nayPct, passPct, notVotedPct],
            backgroundColor: [
                'rgb(72, 199, 142)',
                'rgb(241, 70, 104)',
                'rgb(255, 224, 138)',
                'rgb(211, 211, 211)'
            ],
            hoverOffset: 4
        }]
    }

    const options = {
        maintainAspectRatio: false,
        layout: {
            padding: 20
        },
        plugins: {
            title: {
                display: true,
                text: 'Ballot status by voting power'
            }
        }
    }

    useEffect(() => {
        (async () => {
            const ballotStats: BallotStats = await TezosService.getBallotStats();
            setSupermajority(ballotStats.superMajority);
            setVotesCast(ballotStats.castedVotes);
            setQuorum(ballotStats.quorum);
            setSupermajorityClass((ballotStats.superMajority > SUPERMAJORITY_TARGET) ? "is-success" : "is-warning");
            setQuorumClass((ballotStats.castedVotes > ballotStats.quorum) ? "is-success" : "is-warning");
            setYayPct(ballotStats.yayPercentage);
            setNayPct(ballotStats.nayPercentage);
            setPassPct(ballotStats.passPercentage);
            setNotVotedPct(ballotStats.notVotedPercentage);
        })();
    }, []);

    return (
        <div className="block">
            <h5>Ballot status</h5>
            <div className="ballot-result">
                <div className="block protocol-hash">
                    {voteContext.proposalsHashs[0]}
                </div>
                <div className="columns is-vcentered">
                    <div className="column">
                        <div className="block pie-chart">
                            <Pie datasetIdKey='id' data={data} options={options} />
                        </div>
                    </div>
                    <div className="column">
                        <div className="block">
                            <div>Supermajority: <b>{superMajority}%</b> / target = 80%</div>
                            <progress className={`progress ${superMajorityClass}`} value={superMajority} max="100">{superMajority}%</progress>
                        </div>
                        <div className="block">
                            <div>Quorum: <b>{votesCast}%</b> / target = {quorum}%</div>
                            <progress className={`progress ${quorumClass}`} value={votesCast} max="100"></progress>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProposalBallotStat;