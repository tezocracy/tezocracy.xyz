import { useEffect, useState } from "react";
import { BallotValue } from "../../../../common/Constants";

function BallotResult({ currentBallot }: { currentBallot: string }) {

    const [ballotClass, setBallotClass] = useState<string>("");

    useEffect(() => {
        (async () => {
            getBallotLabel(currentBallot);
        })();
    }, [currentBallot]);


    const getBallotLabel = async (ballot: string): Promise<void> => {
        switch (ballot.toLowerCase()) {
            case BallotValue.YAY.toLowerCase():
                setBallotClass("has-text-success");
                break;
            case BallotValue.NAY.toLowerCase():
                setBallotClass("has-text-danger");
                break;
            case BallotValue.PASS.toLowerCase():
                setBallotClass("has-text-warning");
                break;
            default:
                setBallotClass("unknown");
        }
    };

    return (

        <div className="ballot-result">
            You voted <span className={ballotClass}>{currentBallot}</span>
        </div>

    )
}

export default BallotResult;