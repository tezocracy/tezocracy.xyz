import { RequestSignPayloadInput, SigningType } from "@airgap/beacon-sdk";
import { BallotOperation, TezosToolkit } from "@taquito/taquito";
import { UserContext } from "../../../../common/context/UserContext";
import { TezosContext, VoteContextType } from "../../../../common/context/TezosContext";
import FeedbackMessage from "../../../../common/components/FeedbackMessage";
import { ConnectionContext } from "../../../../common/context/ConnectionContext";
import { useContext, useState } from "react";
import { BallotValue } from "../../../../common/Constants";
import { toOpHTMLLink } from "../../../../common/Utils";
import { localForger } from "@taquito/local-forging";
import bs58check from "bs58check";
import { OpKind, OperationObject } from "@taquito/rpc";
import ErrorService from "../../../../common/service/ErrorService";

function BallotButtons({currentProposal}: {currentProposal: string}) {

    const { Tezos }: { Tezos: TezosToolkit, voteContext: VoteContextType } = useContext(TezosContext);
    const { connectionData } = useContext(ConnectionContext);
    const { userData } = useContext(UserContext);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [infoMessage, setInfoMessage] = useState<string>(undefined);
    const [successMessage, setSuccessMessage] = useState<string>(undefined);
    const [errorMessage, setErrorMessage] = useState<string>(undefined);

    const subscribe = async (opHash: string): Promise<void> => {

        // Subscribe to event stream to follow operation status
        const ballotFilter = {
            and: [{ source: userData.address, kind: OpKind.BALLOT.toString(), opHash: opHash }]
        }

        const sub = Tezos.stream.subscribeOperation({
            or: [ballotFilter]
        })

        // When operation is confirmed
        sub.on('data', (data) => {
            setInfoMessage(undefined);
            setSuccessMessage(`Operation ${toOpHTMLLink(connectionData.network, data.hash)} confirmed.`);
            setIsLoading(false);
        });

        sub.on('error', (error) => {
            setInfoMessage(undefined);
            setSuccessMessage(undefined);
            setErrorMessage(`Operation failed: ${error}`);
            setIsLoading(false);
        })
    }

    const createBallotOperation = async (ballotValue: 'yay' | 'nay' | 'pass'): Promise<any> => {
        const currentProposal: string | undefined = (await Tezos.rpc.getCurrentProposal())?.toString();

        if(currentProposal === undefined) {
            throw new Error("No proposals submitted yet");
        }

        const branch: string = await Tezos.rpc.getBlockHash();
        const period: number = (await Tezos.rpc.getCurrentPeriod()).voting_period.index;

        const operation = {
            "branch": branch,
            "contents": [
                {
                    "kind": OpKind.BALLOT,
                    "source": userData.address,
                    "period": period,
                    "proposal": currentProposal,
                    "ballot": ballotValue
                }
            ]
        };

        return operation;
    }

    const forgeAndSend = async (ballotValue: 'yay' | 'nay' | 'pass'): Promise<string> => {

        try {
            //console.log("1. create operation object");
            const operation = await createBallotOperation(ballotValue);

            //console.log("2. forge operation");
            //const forgedBytes: string = await Tezos.rpc.forgeOperations(operation);
            const forgedBytes = await localForger.forge(operation);

            //console.log(forgedBytes);

            //console.log("3. sign transaction");
            const payload: RequestSignPayloadInput = {
                signingType: SigningType.OPERATION,
                payload: '03' + forgedBytes,
                sourceAddress: userData.address,
            };

            const signedPayload = await connectionData.beaconConnection.beaconWallet.client.requestSignPayload(payload);
            //console.log(signedPayload.signature);

            // 4. decode signature and slice prefix
            //console.log("4. decode signature");
            let sbytesBuffer: Buffer = bs58check.decode(signedPayload.signature);
            let sbytes: string;
            if (signedPayload.signature.startsWith('edsig') || signedPayload.signature.startsWith('spsig1')) {
                sbytes = sbytesBuffer.slice(5).toString('hex');
            } else if (signedPayload.signature.startsWith('p2sig')) {
                sbytes = sbytesBuffer.slice(4).toString('hex');
            } else {
                sbytes = sbytesBuffer.slice(3).toString('hex');
            }

            // 5. preapply operation
            //console.log("5. preapply");
            const protocol: string = await (await Tezos.rpc.getProtocols()).protocol;
            const preapplyParams: OperationObject = { ...operation, protocol, signature: signedPayload.signature };
            /* const preapplyResponse: PreapplyResponse[] = */ await Tezos.rpc.preapplyOperations([preapplyParams]);
            //console.log(preapplyResponse[0]);
            //console.log("Preapply ok");

            // 6. inject operation
            //console.log("5. inject");
            const opHash = await Tezos.rpc.injectOperation(`${forgedBytes}${sbytes}`);
            //console.log(opHash);

            return opHash;
        }
        catch (error: any) {
            throw error;
        }
    }

    const sendBallotOperation = async (ballotValue: 'yay' | 'nay' | 'pass'): Promise<void> => {
        setIsLoading(true);
        setInfoMessage(undefined);
        setErrorMessage(undefined);
        setSuccessMessage(undefined);
        try {
            if (connectionData.beaconConnection) {

                const opHash = await forgeAndSend(ballotValue);
                setIsLoading(true);
                setInfoMessage(`Operation ${toOpHTMLLink(connectionData.network, opHash)} sent. Waiting for confirmation...`);
                subscribe(opHash);

                //FIXME waiting for Taquito to fix it or to move "proposals" methods to wallet API

                /*
                const input: RequestOperationInput = {
                    operationDetails: [{
                        kind: TezosOperationType.BALLOT,
                        source: userData.address,
                        period: voteContext.periodIndex,
                        proposal: currentProposal,
                        ballot: ballotValue
                    }]
                }

                const result: OperationResponse = await connectionData.beaconConnection.beaconWallet.client.requestOperation(input);
                setInfoMessage(undefined);
                setSuccessMessage(`Operation ${toOpHTMLLink(connectionData.network, result.transactionHash)} sent`);
                */
            }
            else {
                if (connectionData.ledgerConnection) {
                    setInfoMessage("Please accept request on your device.");
                    
                    const ballotOperation: BallotOperation = await Tezos.contract.ballot({
                        proposal: currentProposal,
                        ballot: ballotValue
                    });

                    setSuccessMessage(undefined);
                    setInfoMessage(`Operation ${toOpHTMLLink(connectionData.network, ballotOperation.hash)} sent. Waiting for confirmation...`);
                    subscribe(ballotOperation.hash);
                }
            }
        }
        catch (error: any) {
            console.error(error);
            setErrorMessage(ErrorService.getErrorMessage(error));
            setInfoMessage(undefined);
            setSuccessMessage(undefined);
            setIsLoading(false);
        }
    }

    const yay = async (): Promise<void> => {
        sendBallotOperation(BallotValue.YAY);
    };

    const nay = async (): Promise<void> => {
        sendBallotOperation(BallotValue.NAY);
    };

    const pass = async (): Promise<void> => {
        sendBallotOperation(BallotValue.PASS);
    };

    return (
        <div>
            <div className="ballot-buttons">
                <div className="text-muted ballot-buttons-subtitle">Click on the button of your choice to send your ballot:</div>
                <div className="ballot-buttons-group">
                    <button className={`button is-success ${isLoading ? "is-loading" : ""}`} onClick={yay} disabled={isLoading}>Yay</button>
                    <button className={`button is-danger ${isLoading ? "is-loading" : ""}`} onClick={nay} disabled={isLoading}>Nay</button>
                    <button className={`button is-warning ${isLoading ? "is-loading" : ""}`} onClick={pass} disabled={isLoading}>Pass</button>
                </div>
            </div>
            <div>
                <FeedbackMessage infoMessage={infoMessage} errorMessage={errorMessage} successMessage={successMessage} loading={false} />
            </div>
        </div>
    )
}

export default BallotButtons;