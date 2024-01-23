import { useContext, useEffect } from "react";
import UserInfo from "./UserInfo";
import DisconnectButton from "./ledger/DisconnectButton";
import LedgerConnectButton from "./ledger/LedgerConnectButton";
import { UserContext } from "../../common/context/UserContext";
import BeaconConnectButton from "./beacon/BeaconConnectButton";
import NetworkSelector from "./NetworkSelector";
import { TezosContext } from "../../common/context/TezosContext";
import { NetworkType } from "@airgap/beacon-sdk";
import config from "../../Config";
import Transaction from "../content/business/Transaction";

function Wallet() {

    const { userData, setUserData } = useContext(UserContext);
    const { network } = useContext(TezosContext);

    useEffect(() => {
        (async () => {
        })();
    }, [network]);

    return (
        <div>
            <UserContext.Provider value={{ userData, setUserData }}>
                <div className="columns">
                    <div className="column">
                        <div className="card">

                            <div className="card-content">
                                {
                                    network.type !== NetworkType.MAINNET &&
                                    <div className='columns network-name'>
                                        <div className='column'>
                                            {network.type}
                                        </div>
                                    </div>
                                }
                                <h4 className="title is-4">My wallet</h4>
                                {
                                    config.networks.length > 1 &&
                                    <div className='columns'>
                                        <div className='column'>
                                            <NetworkSelector />
                                        </div>
                                    </div>
                                }

                                {
                                    userData &&

                                    <div>
                                        <div className="block"><UserInfo /></div>

                                        <div className="block"><DisconnectButton /></div>

                                        {
                                            config.developerMode &&
                                            <>
                                                <div>Developer mode</div>
                                                <Transaction />
                                            </>
                                        }

                                    </div>
                                }

                                {
                                    !userData &&
                                    <div>
                                        <div className="columns">
                                            <div className="column">
                                                <LedgerConnectButton />
                                            </div>
                                            <div className="column">
                                                <BeaconConnectButton />
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>



            </UserContext.Provider>
        </div>
    );
}

export default Wallet;