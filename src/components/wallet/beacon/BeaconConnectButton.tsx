import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { UserContext } from "../../../common/context/UserContext";
import { TezosToolkit } from "@taquito/taquito";
import { TezosContext } from "../../../common/context/TezosContext";
import { UserData } from "../../../types";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { Network } from "@airgap/beacon-sdk";
import { ConnectionContext, ConnectionDataType } from "../../../common/context/ConnectionContext";
import config from "../../../Config";
import TezosService from "../../../common/service/TezosService";
import {  getConfigNetwork } from "../../../common/Utils";

function BeaconConnectButton() {

    const { setUserData } = useContext(UserContext);
    const { Tezos, network }: { Tezos: TezosToolkit, setTezos: Dispatch<SetStateAction<TezosToolkit>>, network: Network } = useContext(TezosContext);
    const { connectionData, setConnectionData } = useContext(ConnectionContext);

    const [errorMessage, setErrorMessage] = useState<string>(undefined);

    const setup = async (userAddress: string): Promise<void> => {

        let newUserData: UserData = {
            address: userAddress,
            balance: (await Tezos.tz.getBalance(userAddress)).toNumber(),
            isDelegate: (await TezosService.isBaker(userAddress))
        };
        
        setUserData(newUserData);
    };

    useEffect(() => {
        (async () => {
            try {

                // creates a wallet instance
                const newWallet = new BeaconWallet({
                    name: config.applicationName,
                    network: network as Network,
                    disableDefaultEvents: false
                });
                 
                Tezos.setWalletProvider(newWallet);
                Tezos.setProvider({wallet: newWallet});

                const newConnectionData: ConnectionDataType = {
                    beaconConnection: {
                        beaconWallet: newWallet
                    },
                    ledgerConnection: undefined,
                    network: network
                }
                setConnectionData(newConnectionData);

                // checks if wallet was connected before
                const activeAccount = await newWallet.client.getActiveAccount();
                if (activeAccount) {
                    const userAddress = await newWallet.getPKH();
                    await setup(userAddress);
                }

            }
            catch (error: any) {
                setErrorMessage(error.getMessage && error.getMessage());
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Tezos, network, setConnectionData]);

    const connectBeacon = async (): Promise<void> => {
        try {
            await connectionData.beaconConnection.beaconWallet.requestPermissions({
                network: {
                    name: network.name,
                    rpcUrl: network.rpcUrl,
                    type: network.type
                }
            });

            // gets user's address
            const userAddress = await connectionData.beaconConnection.beaconWallet.getPKH();
            await setup(userAddress);

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="beacon-connect-button">

            <div className="block button-block">
                <button className="button" onClick={connectBeacon}>
                    Connect with Beacon
                </button>
            </div>
            <div className="block disclaimer">

            </div>
            <div className="block feedback-message">
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
    )
};

export default BeaconConnectButton;
