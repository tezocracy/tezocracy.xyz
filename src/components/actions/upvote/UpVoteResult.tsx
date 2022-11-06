import { useEffect } from "react";

function UpVoteResult({ votedProposals }: { votedProposals: string[] }) {

    return (
        <>
            <hr />
            <div className="ballot-buttons">
                <div className="text-muted ballot-buttons-subtitle">Upvoted proposals</div>
                <div className="ballot-buttons-subtitle">
                    {votedProposals.map((item, i) => <div key={i}>
                        {item}
                    </div>)}
                </div>
            </div>
        </>
    )
};

export default UpVoteResult;