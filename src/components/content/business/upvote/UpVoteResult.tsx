import { useEffect } from "react";

function UpVoteResult({ votedProposals }: { votedProposals: string[] }) {

    useEffect(() => {
        (async () => {
            
        })();
    }, [votedProposals]);

    return (
        <>
            <hr />
            <div className="ballot-buttons">
                <div className=""><h6 className="is-6">My upvoted proposals</h6></div>
                <div className="block protocol-hash">
                    {votedProposals.map((item, i) => <div key={i}>
                        {item}
                    </div>)}
                </div>
            </div>
        </>
    )
};

export default UpVoteResult;