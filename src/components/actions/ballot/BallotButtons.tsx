import { RequestSignPayloadInput, SigningType, TezosOperationType } from "@airgap/beacon-sdk";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { OpKind, TezosToolkit } from "@taquito/taquito";
import { Alert, Button, Col, Row, Spinner } from "react-bootstrap";
import Parser from 'html-react-parser';
import { useState } from "react";
import Constants from "../../../Constants";
import bs58check from "bs58check";
import { OperationObject, PreapplyResponse } from '@taquito/rpc';
import { localForger } from '@taquito/local-forging';
import Config from "../../../Config";

function BallotButtons({ Tezos, wallet, userAddress }: { Tezos: TezosToolkit, wallet: BeaconWallet, userAddress: string }) {

    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [statusType, setStatusType] = useState<'success' | 'danger' | 'primary'>();
    const [feedbackMessage, setFeedbackMessage] = useState<string>("");
    const [waiting, setWaiting] = useState<boolean>(false);

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
                    "source": userAddress,
                    "period": period,
                    "proposal": currentProposal,
                    "ballot": ballotValue
                }
            ]
        };

        console.log(operation);

        return operation;
    }

    const forgeAndSend = async (ballotValue: 'yay' | 'nay' | 'pass'): Promise<string> => {

        try {


            console.log("1. create operation object");
            const operation = await createBallotOperation(ballotValue);

            console.log("2. forge operation");
            //const forgedBytes: string = await Tezos.rpc.forgeOperations(operation);
            const forgedBytes = await localForger.forge(operation);

            console.log(forgedBytes);

            console.log("3. sign transaction");
            const payload: RequestSignPayloadInput = {
                signingType: SigningType.OPERATION,
                payload: '03' + forgedBytes,
                sourceAddress: userAddress,
            };

            const signedPayload = await wallet.client.requestSignPayload(payload);
            console.log(signedPayload.signature);

            // 4. decode signature and slice prefix
            console.log("4. decode signature");
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
            console.log("5. preapply");
            const protocol: string = await (await Tezos.rpc.getProtocols()).protocol;
            const preapplyParams: OperationObject = { ...operation, protocol, signature: signedPayload.signature };
            const preapplyResponse: PreapplyResponse[] = await Tezos.rpc.preapplyOperations([preapplyParams]);
            console.log(preapplyResponse[0]);
            console.log("Preapply ok");

            // 6. inject operation
            console.log("5. inject");
            const opHash = await Tezos.rpc.injectOperation(`${forgedBytes}${sbytes}`);
            console.log(opHash);

            return opHash;
        }
        catch (error: any) {
            console.error("ERROR " + error);
            throw error;
        }

    }

    const subscribe = async (opHash: string): Promise<void> => {

        // Subscribe to event stream to follow operation status
        const ballotFilter = {
            and: [{ source: userAddress, kind: 'ballot', opHash: opHash }]
        }

        const sub = Tezos.stream.subscribeOperation({
            or: [ballotFilter]
        })

        // When operation is confirmed
        sub.on('data', (data) => {
            console.log("Operation found");
            console.log(data);

            const opResult = (data as any)?.metadata?.operation_result;

            if (opResult?.status === Constants.APPLIED) {
                console.log("Operation applied")
                setStatusType('success');
                setFeedbackMessage(`Ballot confirmed. <a href="${Config.network.viewerUrl}/${opHash}" target="_blank">Check it.</a>`);
                window.location.reload();
            }

            if (opResult?.status === Constants.FAILED) {
                console.log("Operation failed")
                setStatusType('danger');
                const errorMessage = opResult.errors.map((item: any) => item.id).join(', ');
                setFeedbackMessage(`Operation failed: ${errorMessage}`);
                setWaiting(false);
            }
        });
    }

    const sendBallotOperation = async (ballotValue: 'yay' | 'nay' | 'pass'): Promise<void> => {
        setWaiting(true);
        setShowAlert(true);
        setStatusType('primary');
        setFeedbackMessage("Sending...");

        try {
            const opHash = await forgeAndSend(ballotValue);
            subscribe(opHash);
        }
        catch (error: any) {
            console.log(error);
            if (error?.message) {
                setStatusType('danger');
                setFeedbackMessage(error.message);
                setWaiting(false);
            }
        }
    }

    const yay = async (): Promise<void> => {
        sendBallotOperation(Constants.BallotValue.YAY);
    };

    const nay = async (): Promise<void> => {
        sendBallotOperation(Constants.BallotValue.NAY);
    };

    const pass = async (): Promise<void> => {
        sendBallotOperation(Constants.BallotValue.PASS);
    };

    return (
        <div>
            <div className="ballot-buttons">
                <div className="text-muted ballot-buttons-subtitle">Click on the button of your choice to send your ballot:</div>
                <div className="ballot-buttons-group">
                    <Button className="ballot-button" variant="success" onClick={yay} disabled={waiting}>Yay</Button>
                    <Button className="ballot-button" variant="danger" onClick={nay} disabled={waiting}>Nay</Button>
                    <Button className="ballot-button" variant="warning" onClick={pass} disabled={waiting}>Pass</Button>
                </div>
            </div>
            <Row>
                <Col>
                    <br />
                    {showAlert && feedbackMessage &&
                        <Alert variant={statusType} onClose={() => setShowAlert(false)} dismissible>
                            {Parser(feedbackMessage)}
                            &nbsp; {waiting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : ""}
                        </Alert>
                    }
                </Col>
            </Row>
        </div>
    )
}

export default BallotButtons;