import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';

import App from './components/App';
import Arbitrage from './components/Arbitrage';
import Wallet from './components/Wallet';

ReactDOM.render(
  <Router>
    <div>
      <Route exact path="/" component={App} />
      <Route path="/arbitrage" component={Arbitrage}/>
      <Route path="/wallet" component={Wallet}/>

    </div>
  </Router>,
document.getElementById('root'));
