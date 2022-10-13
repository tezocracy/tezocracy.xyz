import bakerislandLogo from '../images/bakerisland-logo.png'
import midlBanner from '../images/midl_baking_banner.png'
import { Col, Row } from 'react-bootstrap';

function Sponsors() {
    return (
        <div className='logos'>
            <Row>
                <Col className='text-center'>
                    <a href="https://midl.dev/" target="_blank"><img src={midlBanner} alt="MIDL.dev" className="shadow p-3 mb-5 bg-body rounded"></img></a>
                </Col>
                <Col className='text-center'>
                    <img src={bakerislandLogo} alt="Bakerisland" className="shadow p-3 mb-5 bg-body rounded"></img>
                </Col>
            </Row>
        </div>
    )
}

export default Sponsors;