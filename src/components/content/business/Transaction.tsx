import { useContext, useState } from "react";
import { UserContext } from "../../../common/context/UserContext";
import { BallotParams, OpKind, PreparedOperation, TezosToolkit } from "@taquito/taquito";
import { TezosContext } from "../../../common/context/TezosContext";
import { OperationResponse, RequestOperationInput, TezosOperationType } from "@airgap/beacon-sdk";
import { ConnectionContext } from "../../../common/context/ConnectionContext";

function Transaction() {

    const { connectionData } = useContext(ConnectionContext);

    const { userData } = useContext(UserContext);
    const { Tezos }: {Tezos: TezosToolkit} = useContext(TezosContext);
    const [message, setMessage] = useState<string>(undefined);
    const [errorMessage, setErrorMessage] = useState<string>(undefined);

    const send = () => {
        setMessage(undefined);
        setErrorMessage(undefined);
        const amount = 1;
        const address = userData.address;

        console.log(`Transfering ${amount} ꜩ to ${address}...`);
        setMessage(`Transfering ${amount} ꜩ to ${address}... Please confirm transaction on your Ledger.`);
        Tezos.wallet
            .transfer({ to: address, amount: amount })
            .send()
            .then((op) => {
                console.log(`Waiting for ${op.opHash} to be confirmed...`);
                setMessage(`Waiting for ${op.opHash} to be confirmed...`);
                return op.confirmation(1).then(() => op.opHash);
            })
            .then((hash) => { console.log(`hash: ${hash}`); setMessage(`Operation injected: https://ghost.tzstats.com/${hash}`) })
            .catch((error) => { setErrorMessage(`${error.message}`); console.log(error) });
    }

    const forgeAndSend = () => {

    }

    const requestAndSend = async () => {
        const input: RequestOperationInput = {
            operationDetails: [{
                kind: TezosOperationType.TRANSACTION,
                destination: userData.address,
                amount: "1000000"
            }]
        }
        const result: OperationResponse = await connectionData.beaconConnection.beaconWallet.client.requestOperation(input);

        setMessage(result.transactionHash);
    }


    const testBallot = async () => {
        
        const branch: string = await Tezos.rpc.getBlockHash();
        
        const op: PreparedOperation = {
            opOb: {
                branch: branch,
                contents: [
                    {
                        kind: OpKind.BALLOT,
                        ballot: 'yay',
                        period: 103,
                        proposal: 'ProxfordSW2S7fvchT1Zgj2avb5UES194neRyYVXoaDGvF9egt8',
                        source: userData.address
                    },
                ],
                protocol: 'test_protocol',
            },
            counter: 0,
        }
        
        // Tezos.setProvider()
        const bP: BallotParams = {
            proposal: "ProxfordSW2S7fvchT1Zgj2avb5UES194neRyYVXoaDGvF9egt8",
            ballot: "yay",
            source: userData.address
        }
        
        const prepared: PreparedOperation = await Tezos.prepare.ballot(bP);
        console.log(prepared);
        
        
        const params = await Tezos.prepare.toPreapply(prepared);
        console.log(params);
        const preapplyOp = await Tezos.rpc.preapplyOperations(params);
        console.log(preapplyOp);
    }

    return (
        <>
            <div className="card">
                <div className="card-content">
                    <p>Transaction:</p>
                    <p><button className="button" onClick={send}>Send 1 tez to me</button></p>
                    <p><button className="button" onClick={forgeAndSend}>Send 1 tez to me (forge)</button></p>
                    <p><button className="button" onClick={requestAndSend}>Send 1 tez to me (request)</button></p>
                    <p><button className="button" onClick={testBallot}>test ballot</button></p>
                </div>
                <div>
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
            </div>
        </>
    )
}

export default Transaction;