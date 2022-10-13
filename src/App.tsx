import './App.css';
import Header from './components/Header';
import Proposal from './components/proposal/Proposal';
import { Col, Container, Row } from 'react-bootstrap';
import { TezosToolkit } from '@taquito/taquito';
import MyBallot from './components/actions/MyBallot';
import Config from './Config';
import Sponsors from './components/Sponsors';
import { localForger } from '@taquito/local-forging'
import { useState } from 'react';
import Constants from "./Constants";

function App() {

  let Tezos: TezosToolkit = new TezosToolkit(Config.network.rpcUrl);
  Tezos.setForgerProvider(localForger);

  const [period, setPeriod] = useState<string>(Constants.Period.NONE);
  const [proposal, setProposal] = useState<string | undefined>();

  return (
    <div>
      <Header />
      <Container className="content">
        <Row>
          <Col>
            <Proposal Tezos={Tezos} setPeriod={setPeriod} setProposal={setProposal}/>
          </Col>
          <Col>
            <MyBallot Tezos={Tezos} period={period} proposal={proposal}/>
          </Col>
        </Row>
        <Sponsors />
      </Container>
    </div>
  );
}

export default App;
