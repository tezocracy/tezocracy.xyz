const bakerislandLogo = require('../../assets/bakerisland-logo.png');
const midlBanner = require('../../assets/midl-baking-banner.png');

function Sponsors() {
    return (
        <div className="card">
            <div className="card-content">
                <div className='logos'>
                    <h4 className="title is-4">Provided by</h4>
                    <div className="columns">
                        <div className="column has-text-centered">
                            <div className="block">
                                <a href="https://midl.dev/tezos" target="_blank" rel="noreferrer"><img src={midlBanner} alt="MIDL.dev" className="shadow p-3 mb-5 bg-body rounded"></img></a>
                            </div>
                            <div className="block">
                                <a href="https://tzstats.com/tz1LVqmufjrmV67vNmZWXRDPMwSCh7mLBnS3"  target="_blank" rel="noreferrer"><img src={bakerislandLogo} alt="Bakerisland" className="shadow p-3 mb-5 bg-body rounded"></img></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sponsors;