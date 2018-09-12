import React, { Component } from 'react';
import _ from 'lodash';

import * as Api from 'lib/api';
import websocket from "config";
import './Arbitrage.css';

import Orderbook from './Orderbook';
import Coinprofit from './Coinprofit';
import Ordersend from './Ordersend';

class Arbitrage extends Component {

  
  constructor(props) {
    super(props);
    this.state = {
      subscribeCoin : 'BTC'
    };

    this.coinList = ['BTC', 'ETH', 'EOS', 'BCH', 'BTG', 'ETC', 'XRP', 'REP' ];

  }

  componentDidMount() {
    
    // set default coin.
    this.setState({subscribeCoin : 'BTC'});

    // connect to websocket.
    this.socket = new WebSocket(websocket.URL);
    this.socket.onopen = () => this.onSocketOpen()
    this.socket.onmessage = (m) => this.onSocketMessage(m.data);
    this.socket.onclose = () => this.onSocketClose()

    const token = sessionStorage.getItem('token');

    // Get User Wallet Info.
    if(token) {
      Api.GetBalance(token)
        .then(data => {
          console.log(data);
          if(data) {
            this.setState({
              wallet: data.message
            });
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
    else {
      alert("Token is null, Need to signin");
    }
  }

  onSocketOpen = () => {
    this.sendCoinSubscribe();
  }

  onSocketClose = () => {
    this.socket.close();
  }

  sendCoinSubscribe = async () => {
    const token = sessionStorage.getItem('token');

    let subsStatus = await Api.GetMarketSubs(token);
    subsStatus = subsStatus.message;

    let wsSubscribe = {
      type : "subscribe",
      channel : [
        {
          name : "aggregate",
          product_ids : [
            {
              name : `${this.state.subscribeCoin}KRW`,
              ask_market : [],
              bid_market : []
            }
          ]
        }
      ]
    }

    subsStatus.map(item => {
      if(item.subscribe[this.state.subscribeCoin] === 1) {
        // Only BID subscribe
        wsSubscribe.channel[0].product_ids[0].bid_market.push(item.market);
      }
      else if(item.subscribe[this.state.subscribeCoin] === 2) {
        // Only ASK subscribe
        wsSubscribe.channel[0].product_ids[0].ask_market.push(item.market);
      }
      else if(item.subscribe[this.state.subscribeCoin] === 3) {
        // ASK, BID subscribe
        wsSubscribe.channel[0].product_ids[0].ask_market.push(item.market);
        wsSubscribe.channel[0].product_ids[0].bid_market.push(item.market);
      }  
    });

    this.socket.send(JSON.stringify(wsSubscribe));
  }


  onSocketMessage = (message) => {
    const parseJson = JSON.parse(message);
    let setEnable = true;

    _.forEach(parseJson, (item, key) => {
      if(key.split('_')[1] === 'ASK' || key.split('_')[1] === 'BID') {
        if(item.length < 10) {
          setEnable = false;
        }
      }
    })

    if(setEnable) {
      this.setState({
        orderbook : parseJson
      });
    }

  }



  onClickSelCoin = (e) => {
    this.setState({
      subscribeCoin : e.target.id
    });
    console.log("change the default coin");
    this.sendCoinSubscribe();

  }

  render() {
    return (
      <div className="arbitrage-wrapper">
        <span className="coin-title"> { this.state.orderbook ? this.state.orderbook.coinName : null} </span>
        <p>
          {
            this.coinList.map(coin => {
              if(coin === this.state.subscribeCoin) {
                return <button className="coin-selected-button" id={coin} onClick={this.onClickSelCoin}>{coin}</button>
              }
              else {
                return <button className="coin-select-button" id={coin} onClick={this.onClickSelCoin}>{coin}</button>
              }
            })
          }
        </p>
        <p>
          <Coinprofit coinName={this.state.subscribeCoin} orderbook = {this.state.orderbook}/>
        </p>

        <div className="arbitrage-grid-container">

          <div className="arbitrage-grid-item">
            <Orderbook orderbook={this.state.orderbook} />
          </div>
          <div className="arbitrage-grid-item">
            <Ordersend 
              coinName  = {this.state.subscribeCoin} 
              wallet    = {this.state.wallet ? this.state.wallet : null} 
              orderbook = {this.state.orderbook}
            />
          </div>

        </div>
      </div>
    );
  }
}

export default Arbitrage;