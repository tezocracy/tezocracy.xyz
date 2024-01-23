import config from "../../Config";

const logo = require('../../assets/tezos-ballot-logo.png');

function Navbar() {
    return (
        <>
            <nav className="navbar" role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <a className="navbar-item" href="https://tezocracy.xyz">
                        <span className="site-logo"><img src={logo} alt="Tezocracy logo"/> </span>
                        <span className="site-name"><h1 className="title is-2">{config.applicationName}</h1></span>
                    </a>
                </div>
            </nav>
        </>
    );
}

export default Navbar;