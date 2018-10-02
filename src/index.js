import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';

import App from './components/App';
import Arbitrage from './components/Arbitrage';
import Wallet from './components/Wallet';
import Arbitrage_Triangle from './components/Arbitrage-Triangle';


ReactDOM.render(
  <Router>
    <div>
      <Route exact path="/" component={App} />
      <Route path="/arbitrage-korea" component={Arbitrage}/>
      <Route path="/wallet" component={Wallet}/>
      <Route path="/arbitrage-triangle" component={Arbitrage_Triangle}/>

    </div>
  </Router>,
document.getElementById('root'));
