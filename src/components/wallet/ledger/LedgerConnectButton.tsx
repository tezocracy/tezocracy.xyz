import { useContext, useEffect, useState } from 'react';
import { DerivationType, LedgerSigner } from '@taquito/ledger-signer';
import { TezosToolkit } from "@taquito/taquito";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import { UserContext } from "../../../common/context/UserContext";
import { TezosContext } from '../../../common/context/TezosContext';
import { UserData } from '../../../types';
import { ConnectionContext, ConnectionDataType } from '../../../common/context/ConnectionContext';
import config from '../../../Config';
import TezosService from '../../../common/service/TezosService';
import { Network } from '@airgap/beacon-sdk';

function LedgerConnectButton() {

    const { setUserData } = useContext(UserContext);
    const { Tezos, network }: { Tezos: TezosToolkit, network: Network } = useContext(TezosContext);
    const { setConnectionData } = useContext(ConnectionContext);

    const [message, setMessage] = useState<string>(undefined);
    const [errorMessage, setErrorMessage] = useState<string>(undefined);

    const [displayCustomInputs, setDisplayCustomInputs] = useState<boolean>(false);
    const [derivationPath, setDerivationPath] = useState<string>(config.defaultLedgerDerivationPath);
    const [derivationType, setDerivationType] = useState<number>(DerivationType.ED25519);

    let mobileNavigatorObject: any = window.navigator;
    const ledgerAvailable: boolean = mobileNavigatorObject.hid;

    useEffect(() => {

    }, [])

    const connectLedger = () => {
        setMessage(undefined);
        setErrorMessage(undefined);

        const initTezApp = async () => {

            let transport;

            try {
                try {
                    transport = await TransportWebHID.create();
                }
                catch (error: any) {
                    console.log(error);
                    setErrorMessage(error.message);
                    return;
                }

                setMessage("Please accept request on your Ledger ...")
                const ledgerSigner = new LedgerSigner(
                    transport,
                    derivationPath, //HDPathTemplate(0), // path optional (equivalent to "44'/1729'/1'/0'")
                    true, // prompt optional
                    DerivationType.ED25519 // derivationType optional
                );

                Tezos.setProvider({ signer: ledgerSigner });

                //const publicKey = await Tezos.signer.publicKey();
                const publicKeyHash = await Tezos.signer.publicKeyHash();
                setMessage(undefined);

                const newUserData: UserData = {
                    address: publicKeyHash,
                    balance: (await Tezos.tz.getBalance(publicKeyHash)).toNumber(),
                    isDelegate: (await TezosService.isBaker(publicKeyHash))
                };
                setUserData(newUserData);

                const newConnectionData: ConnectionDataType = {
                    beaconConnection: undefined,
                    ledgerConnection: {
                        transport: transport
                    },
                    network: network
                };
                setConnectionData(newConnectionData);
            }
            catch (error: any) {
                transport.close();
                console.log(error.message);
                console.error(error);
                setMessage(undefined);
                setErrorMessage(error.message);
            }
        }

        initTezApp();
    }

    return (
        <div className="ledger-connect-button">

            <div className="block button-block">
                <button className="button" onClick={connectLedger} disabled={!ledgerAvailable}>
                    Connect with Ledger
                </button>
                <div className="block is-size-7 disclaimer">
                    {
                        !mobileNavigatorObject.hid &&
                        <span className='ledger-error'>
                            Not available on this device or browser.
                        </span>
                    }

                    {
                        mobileNavigatorObject.hid &&
                        <span>Please connect your Ledger and open Tezos application.</span>
                    }
                </div>

            </div>

            {
                mobileNavigatorObject.hid &&
                <div className='block custom-block'>
                    <label className="checkbox">
                        Customize path <input type="checkbox" defaultChecked={displayCustomInputs} onChange={e => setDisplayCustomInputs(e.target.checked)} />
                    </label>
                    <div className={`block custom-values ${displayCustomInputs ? '' : 'is-hidden'}`}>
                        <div className="columns">
                            <div className='column'>
                                <input className="input" type="text" placeholder="Text input" value={derivationPath} onChange={e => setDerivationPath(e.target.value)} />
                            </div>
                        </div>
                        <div className='columns'>
                            <div className='column'>
                                <div className='select'>
                                    <select value={derivationType} onChange={e => setDerivationType(parseInt(e.target.value))}>
                                        <option value="0">ED25519</option>
                                        <option value="1">SECP256K1</option>
                                        <option value="2">P256</option>
                                        <option value="3">BIP32_ED25519</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            <div className="block feedback-message">
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
    );
}

export default LedgerConnectButton;