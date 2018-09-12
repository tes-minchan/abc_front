import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import App from './components/App';
import Arbitrage from './components/Arbitrage';

ReactDOM.render(
  <Router>
    <div>
      <Route exact path="/" component={App} />
      <Route path="/arbitrage" component={Arbitrage}/>

    </div>
  </Router>,
document.getElementById('root'));
