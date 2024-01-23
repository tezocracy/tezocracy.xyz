import { RequestSignPayloadInput, SigningType } from "@airgap/beacon-sdk";
import { OpKind, TezosToolkit } from "@taquito/taquito";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { TezosContext, VoteContextType } from "../../../../common/context/TezosContext";
import { ConnectionContext } from "../../../../common/context/ConnectionContext";
import FeedbackMessage from "../../../../common/components/FeedbackMessage";
import { ProposalsOperation } from "@taquito/taquito/dist/types/operations/proposals-operation";
import { CheckLg } from "react-bootstrap-icons";
import { toOpHTMLLink } from "../../../../common/Utils";
import { localForger } from "@taquito/local-forging";
import { UserContext } from "../../../../common/context/UserContext";
import bs58check from "bs58check";
import { OperationObject, PreapplyResponse } from "@taquito/rpc";
import ErrorService from "../../../../common/service/ErrorService";

function UpVoteButton({ notVotedProposals, votedProposals, setNotVotedProposals, setVotedProposals }: { notVotedProposals: string[], votedProposals: string[], setVotedProposals: Dispatch<SetStateAction<string[]>>, setNotVotedProposals: Dispatch<SetStateAction<string[]>>}) {

    const { Tezos, voteContext }: { Tezos: TezosToolkit, voteContext: VoteContextType } = useContext(TezosContext);
    const { connectionData } = useContext(ConnectionContext);
    const { userData } = useContext(UserContext);

    const [selectedProposals, setSelectedProposals] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [infoMessage, setInfoMessage] = useState<string>(undefined);
    const [successMessage, setSuccessMessage] = useState<string>(undefined);
    const [errorMessage, setErrorMessage] = useState<string>(undefined);

    useEffect(() => {
        (async () => {
            
        })();
    }, [notVotedProposals, votedProposals]);

    const subscribe = async (opHash: string): Promise<void> => {

        // Subscribe to event stream to follow operation status
        const ballotFilter = {
            and: [{ source: userData.address, kind: OpKind.PROPOSALS.toString(), opHash: opHash }]
        }

        const sub = Tezos.stream.subscribeOperation({
            or: [ballotFilter]
        })

        // When operation is confirmed
        sub.on('data', (data) => {
            setInfoMessage(undefined);
            setSuccessMessage(`Operation ${toOpHTMLLink(connectionData.network, data.hash)} confirmed.`);
            setIsLoading(false);

            // Refresh component data with voted/unvoted proposals
            document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name="proposals"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            setVotedProposals(votedProposals.concat(selectedProposals));
            setNotVotedProposals(notVotedProposals.filter(elementA => !selectedProposals.includes(elementA)));
            setSelectedProposals([]);
        });

        sub.on('error', (error) => {
            setInfoMessage(undefined);
            setErrorMessage(`Operation failed: ${error}`);
            setIsLoading(false);
        })
    }
    

    const createUpvoteOperation = async (): Promise<any> => {

        if (selectedProposals === undefined || selectedProposals.length === 0) {
            setErrorMessage(`No proposal selected.`);
        }

        const branch: string = await Tezos.rpc.getBlockHash();

        const operation = {
            "branch": branch,
            "contents": [
                {
                    "kind": OpKind.PROPOSALS,
                    "source": userData.address,
                    "period": parseInt(voteContext.periodIndex),
                    "proposals": selectedProposals
                }
            ]
        };

        return operation;
    }

    const forgeAndSend = async (): Promise<string> => {

        try {
            //console.log("1. create operation object");
            const operation = await createUpvoteOperation();

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
            const preapplyResponse: PreapplyResponse[] = await Tezos.rpc.preapplyOperations([preapplyParams]);
            //console.log(preapplyResponse[0]);
            ///console.log("Preapply ok");

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

    const upVote = async (): Promise<void> => {
        setIsLoading(true);
        setInfoMessage(undefined);
        setErrorMessage(undefined);
        setSuccessMessage(undefined);
        try {
            if (connectionData.beaconConnection) {

                const opHash = await forgeAndSend();
                setIsLoading(true);
                setInfoMessage(`Operation ${toOpHTMLLink(connectionData.network, opHash)} sent. Waiting for confirmation...`);
                subscribe(opHash);

                //FIXME waiting for Taquito to fix it or to move "proposals" methods to wallet API
            
                /*
                const input: RequestOperationInput = {
                    operationDetails: [{
                        kind: TezosOperationType.PROPOSALS,
                        period: voteContext.periodIndex,
                        proposals: selectedProposals
                    }]
                }
                const result: OperationResponse = await connectionData.beaconConnection.beaconWallet.client.requestOperation(input);
                setInfoMessage(undefined);
                setSuccessMessage(`Operation ${toOpHTMLLink(connectionData.networkType, result.transactionHash)} sent`);
                */
            }
            else {
                if (connectionData.ledgerConnection) {
                    setInfoMessage("Please accept request on your device.");
                    
                    const proposalsOperation: ProposalsOperation = await Tezos.contract.proposals({
                        proposals: selectedProposals
                    });

                    setSuccessMessage(undefined);
                    setInfoMessage(`Operation ${toOpHTMLLink(connectionData.network, proposalsOperation.hash)} sent. Waiting for confirmation...`);
                    subscribe(proposalsOperation.hash);
                }
            }
        }
        catch (error: any) {
            setErrorMessage(ErrorService.getErrorMessage(error));
            setInfoMessage(undefined);
            setSuccessMessage(undefined);
            setIsLoading(false);
        }  
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedProposals(prev => [...prev, value]);
        } else {
            setSelectedProposals(prev => prev.filter(x => x !== value));
        }
    }

    return (
        <>
            <div className="ballot-buttons">
                <div >
                    {notVotedProposals.map((item, i) => <div key={i} className="upvote-proposal not-voted-proposal">
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                name="proposals"
                                value={item}
                                onChange={handleChange}
                            /> {item}
                        </label>
                    </div>)}
                    {votedProposals.map((item, i) => <div key={i}>
                        <span className="upvote-proposal voted-proposal"><CheckLg />{item}</span>
                    </div>)}
                </div>
                <div className="ballot-buttons-group">
                    <button className={`button is-success ${isLoading ? "is-loading" : ""}`} onClick={upVote} disabled={isLoading || selectedProposals.length<1}>Upvote</button>
                </div>
            </div>
            <div>
                <FeedbackMessage infoMessage={infoMessage} errorMessage={errorMessage} successMessage={successMessage} loading={false} />
            </div>
        </>
    )
};

export default UpVoteButton;