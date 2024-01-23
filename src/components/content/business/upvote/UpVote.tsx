import { useContext, useEffect, useState } from "react";
import UpVoteButton from "./UpVoteButton";
import TezosService from "../../../../common/service/TezosService";
import { UserData } from "../../../../types";
import { UserContext } from "../../../../common/context/UserContext";


function UpVote() {

    const { userData }: { userData: UserData } = useContext(UserContext);
    const [votedProposals, setVotedProposals] = useState<string[]>([]);
    const [notVotedProposals, setNotVotedProposals] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            const upvotes: (any)[][] = await TezosService.getUpvotedProposals();

            const voted: string[] = upvotes.filter(item => item[1].includes(userData.address)).map(item => item[0]);
            const notVoted: string[] = upvotes.filter(item => !item[1].includes(userData.address)).map(item => item[0]);

            setVotedProposals(voted);
            setNotVotedProposals(notVoted);
        })();
    }, [userData]);

    return (
        <>
            <UpVoteButton notVotedProposals={notVotedProposals} votedProposals={votedProposals} setNotVotedProposals={setNotVotedProposals} setVotedProposals={setVotedProposals} />
        </>
    )
};

export default UpVote;