import { useContext, useEffect, useState } from "react";
import BallotButtons from "./BallotButtons";
import BallotResult from "./BallotResult";
import { BallotValue } from "../../../../common/Constants";
import TezosService from "../../../../common/service/TezosService";
import { UserData } from "../../../../types";
import { UserContext } from "../../../../common/context/UserContext";

function Ballot() {

    const { userData }: { userData: UserData } = useContext(UserContext);
    const [hasVoted, setHasVoted] = useState<boolean>(false);
    const [currentBallot, setCurrentBallot] = useState<string>();
    const [currentProposal, setCurrentProposal] = useState<string>();

    useEffect(() => {
        (async () => {
            const ballot: BallotValue = await TezosService.getBallot(userData.address);            
            setHasVoted(ballot !== BallotValue.NOT_VOTED);
            setCurrentBallot(ballot);
            setCurrentProposal(await TezosService.getCurrentProposal());
        })();
    }, [userData]);

    return (
        <div className="ballot">
            {
                userData.isDelegate && currentProposal && !hasVoted &&
                <BallotButtons currentProposal={currentProposal}/>
            }
            {
                userData.isDelegate && currentProposal && hasVoted &&
                <BallotResult currentBallot={currentBallot}/>
            }
        </div>
    )
}

export default Ballot;