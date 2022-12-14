import { Badge, Container, Nav, Navbar } from "react-bootstrap";
import { Github } from "react-bootstrap-icons";
import Config from "../Config";
import logo from '../images/tezos-ballot-logo.png';

function Header() {
    return (
        <Navbar bg="light" expand="lg">
            <Container fluid>
                <Nav>
                    <Navbar.Brand>
                        <div className="d-inline-block align-text-top h2">
                            <img src={logo} alt={Config.application.name} width="50" height="50" />
                            &nbsp;
                            {Config.application.name}
                        </div>
                        {
                            Config.network.networkType !== "mainnet" &&

                            <>
                                <span>&nbsp;</span>
                                <Badge bg="secondary">{Config.network.networkType}</Badge>
                            </>
                        }
                        <p>A tool for Tezos Bakers to vote for Governance Proposals, directly from the Browser!</p>
                    </Navbar.Brand>
                </Nav>
                <Nav>
                    <Nav.Link href={Config.application.githubRepository} target="_blank" title="See on Github">
                        <Github />
                    </Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    );
}

export default Header;
