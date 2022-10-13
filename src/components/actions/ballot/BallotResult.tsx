import { useEffect, useState } from "react";
import Constants  from '../../../Constants';

function BallotResult({ currentBallot }: { currentBallot: string }) {

    const [ballotClass, setBallotClass] = useState<string>("");

    useEffect(() => {
        (async () => {
            getBallotLabel(currentBallot);
        })();
    }, []);


    const getBallotLabel = async (ballot: string): Promise<void> => {
        switch (ballot.toLowerCase()) {
            case Constants.BallotValue.YAY.toLowerCase():
                setBallotClass("text-success");
                break;
            case Constants.BallotValue.NAY.toLowerCase():
                setBallotClass("text-danger");
                break;
            case Constants.BallotValue.PASS.toLowerCase():
                setBallotClass("text-warning");
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