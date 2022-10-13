import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Badge, Button, Card } from "react-bootstrap";
import { PersonFill } from "react-bootstrap-icons";
import { toBalance } from "../Utils";
import Config from "../../Config";

function Wallet({ Tezos, userAddress, wallet, setWallet, setUserAddress, setDelegate }: { Tezos: TezosToolkit, userAddress: string, wallet: BeaconWallet, setWallet: Dispatch<SetStateAction<BeaconWallet>>, setUserAddress: Dispatch<SetStateAction<string>>, setDelegate: Dispatch<SetStateAction<boolean>> }) {

    const [userBalance, setUserBalance] = useState<number>(0);

    /**
     * Set user address and balances on wallet connection
     */
    const setup = async (pkh: string): Promise<void> => {

        setUserAddress(pkh);
        const balance = await Tezos.tz.getBalance(pkh);
        setUserBalance(balance.toNumber());

        try {
            const delegate = await Tezos.rpc.getDelegates(pkh);
            const isDelegate: boolean = delegate?.deactivated === false
            setDelegate(isDelegate);
        }
        catch (error) {
            setDelegate(false);
        }

    };

    const connectWallet = async (): Promise<void> => {

        try {
            await wallet.requestPermissions({
                network: {
                    type: Config.network.networkType,
                    rpcUrl: Config.network.rpcUrl
                }
            });
            // gets user's address
            const userAddress = await wallet.getPKH();
            await setup(userAddress);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        (async () => {
            // creates a wallet instance
            const wallet = new BeaconWallet({
                name: Config.application.name,
                preferredNetwork: Config.network.networkType,
                disableDefaultEvents: false
            });

            Tezos.setWalletProvider(wallet);
            setWallet(wallet);
            // checks if wallet was connected before
            const activeAccount = await wallet.client.getActiveAccount();
            if (activeAccount) {
                const userAddress = await wallet.getPKH();
                await setup(userAddress);
            }

        })();
    }, []);

    const disconnectWallet = async (): Promise<void> => {
        setUserAddress("");
        setUserBalance(0);
        const tezosTK = new TezosToolkit(Config.network.rpcUrl);
        Tezos = tezosTK;
        if (wallet) {
            await wallet.clearActiveAccount();
        }
        window.location.reload();
    };

    return (
        <div>
            <h4>My wallet</h4>
            {(userAddress != null && userAddress !== "") &&
                <div>
                    <div>
                        <Card.Text>
                            <Badge bg="light" text="dark" className="balance-badge">
                                <PersonFill /> &nbsp; {userAddress || "Not connected"} &nbsp;
                                <Badge bg="secondary" as="span" className="balance-badge">{toBalance(userBalance)} ꜩ</Badge>
                            </Badge>
                        </Card.Text>
                        <Card.Text>
                            <Button variant="outline-danger" onClick={disconnectWallet}>Disconnect</Button>
                        </Card.Text>
                    </div>

                </div>
            }

            {(userAddress == null || userAddress === "") &&
                <Card.Text>
                    <Button variant="outline-primary" onClick={connectWallet}>Connect wallet</Button>
                </Card.Text>
            }
        </div>
    )
}

export default Wallet;