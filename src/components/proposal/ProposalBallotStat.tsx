import { TezosToolkit } from "@taquito/taquito";
import { useEffect, useState } from "react";
import { ProgressBar } from "react-bootstrap";

function ProposalBallotStat({ Tezos }: { Tezos: TezosToolkit }) {

    const [yayPct, setYayPct] = useState<number>(0);
    const [nayPct, setNayPct] = useState<number>(0);
    const [passPct, setPassPct] = useState<number>(0);


    useEffect(() => {
        (async () => {

            Tezos.rpc.getBallotList()
                .then((result) => {
                    
                    const yayCount = result.filter(item => item.ballot === "yay").length;
                    const nayCount = result.filter(item => item.ballot === "nay").length;
                    const passCount = result.filter(item => item.ballot === "pass").length;

                    const total = yayCount + nayCount + passCount;

                    setYayPct(yayCount / total);
                    setNayPct(nayCount / total);
                    setPassPct(passCount / total);

                });

        })();
    }, []);

    return (

        <div>
            <h5>Ballot status</h5>

            <div>
                <ProgressBar>
                    <ProgressBar variant="success" now={yayPct * 100} label={"Yay (" + (Math.round(yayPct * 100)) + "%)"} isChild={true} />
                    <ProgressBar variant="danger" now={nayPct * 100} label={"Nay (" + (Math.round(nayPct * 100)) + "%)"} isChild={true} />
                    <ProgressBar variant="warning" now={passPct * 100} label={"Pass (" + (Math.round(passPct * 100)) + "%)"} isChild={true} />
                </ProgressBar>
            </div>
        </div>
    );
}

export default ProposalBallotStat;