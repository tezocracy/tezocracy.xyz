import { useContext, useEffect } from "react";
import { UserContext } from "../../common/context/UserContext";
import { shortAddress } from "../../common/Utils";

function UserInfo() {

    const { userData } = useContext(UserContext);
    
    useEffect(() => {

    }, [userData])

    return (
        <div className="user-info-card">
            {
                userData &&
                <div className="user-data">
                    <p><i className="bi-person-fill"></i>&nbsp;<span className="">{shortAddress(userData.address, 5)}</span></p>
                    <p><i className="bi-wallet-fill"></i>&nbsp;<span className="">{parseFloat((userData.balance / 1000000).toPrecision(5)).toLocaleString()} ꜩ</span></p>
                </div>
            }
        </div>
    )
}

export default UserInfo;