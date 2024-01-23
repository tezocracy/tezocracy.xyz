import { DelegateOperation, DelegationWalletOperation, TezosToolkit } from "@taquito/taquito";
import { TezosContext, VoteContextType } from "../../../common/context/TezosContext";
import { useContext, useState } from "react";
import { ConnectionContext } from "../../../common/context/ConnectionContext";

function SetDelegate() {

    const { Tezos }: { Tezos: TezosToolkit, voteContext: VoteContextType } = useContext(TezosContext);
    const { connectionData } = useContext(ConnectionContext);

    const [message, setMessage] = useState<string>(undefined);
    const [errorMessage, setErrorMessage] = useState<string>(undefined);

    const register = async (): Promise<void> => {
        setErrorMessage(undefined);
        setMessage(undefined);

        try {
            if (connectionData.beaconConnection) {
                const result: DelegationWalletOperation = await Tezos.wallet.registerDelegate().send();
                setMessage(`Operation ${result.opHash} sent.`)
            }
            else
                if (connectionData.ledgerConnection) {
                    setMessage("Approve transaction on your Ledger");
                    const result: DelegateOperation = await Tezos.contract.registerDelegate({});
                    setMessage(`Operation ${result.hash} sent.`)
                }
        }
        catch (error: any) {
            console.log(error)
            setMessage(undefined);
            setErrorMessage(error.message);
        }
    }

    return (
        <div>
            <div className="block set-delegate">
                <button className="button is-info" onClick={register}>
                    Become a delegate
                </button>
                <br />
                <small>(You must <a href="https://wiki.tezosagora.org/use/baking/setting-up-a-secure-baker" target="_blank" rel="noreferrer">run a baker)</a></small>
            </div>
            {
                message &&
                <div>
                    <article className="message is-info">
                        <div className="message-body">
                            {message}
                        </div>
                    </article>
                </div>
            }

            {
                errorMessage &&
                <div>
                    <article className="message is-danger">
                        <div className="message-body">
                            {errorMessage}
                        </div>
                    </article>
                </div>
            }
        </div>
    )
}

export default SetDelegate;