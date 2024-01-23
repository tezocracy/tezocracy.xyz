import { useContext } from "react";
import { UserContext } from "../../../common/context/UserContext";
import { TezosToolkit } from "@taquito/taquito";
import { TezosContext } from "../../../common/context/TezosContext";
import { ConnectionContext } from "../../../common/context/ConnectionContext";
const beaconIcon = require('../../../assets/beaconicon.png');
const ledgerIcon = require('../../../assets/ledgericon.png');

function DisconnectButton() {

    const { userData, setUserData } = useContext(UserContext);
    const { Tezos }: { Tezos: TezosToolkit } = useContext(TezosContext);
    const { connectionData, setConnectionData } = useContext(ConnectionContext);

    const getConnectionMethod = () => {
        let connectionName: string;
        let connectionIcon: string;

        if (connectionData.beaconConnection !== undefined) {
            connectionName = "Beacon";
            connectionIcon = beaconIcon;
        }
        else {
            if (connectionData.ledgerConnection !== undefined) {
                connectionName = "Ledger";
                connectionIcon = ledgerIcon;
            }
            else {
                connectionName = "undefined";
                connectionIcon = '';
            }
        }

        return (
            <>
                <span className="connection-method-icon">
                    <img src={connectionIcon} alt={connectionName}></img>&nbsp;
                </span>
                <span className="connection-method-name">
                    {connectionName}
                </span>
            </>
        );
    }

    const disconnect = async () => {
        if (userData !== undefined) {
            if (connectionData.ledgerConnection?.transport)
            connectionData.ledgerConnection.transport.close();
            setUserData(undefined);
            Tezos.setSignerProvider(undefined);
            setConnectionData(undefined);
            await connectionData?.beaconConnection?.beaconWallet?.clearActiveAccount();
        }
    }

    return (
        <div className="block disconnect-button">
            <button className="button is-danger is-light" onClick={disconnect}>Disconnect</button>
            <div className="block is-size-7 disclaimer">
                Connected with {getConnectionMethod()}
            </div>
        </div>
    );
}

export default DisconnectButton;