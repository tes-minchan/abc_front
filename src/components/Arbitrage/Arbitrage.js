import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'

import _ from 'lodash';

import * as Api from 'lib/api';
import websocket from "config";
import './Arbitrage.css';

import Orderbook from './Orderbook';
import Coinprofit from './Coinprofit';
import Ordersend from './Ordersend';
import Orderinfo from './Orderinfo';
import Orderdetail from './Orderdetail';

class Arbitrage extends Component {

  
  constructor(props) {
    super(props);
    this.state = {
      subscribeCoin : 'BTC',
      redirect : false
    };

    this.coinList = [ 'BTC' , 'BCH' , 'EOS' , 'ETC' , 'ETH' , 'LTC' , 'OMG' , 'QTUM' , 'XRP' , 'ZIL'];
  }

  componentDidMount() {
    
    // set default coin.
    this.setState({subscribeCoin : 'BTC'});

    // connect to websocket.
    this.socket = new WebSocket(websocket.URL);
    this.socket.onopen = () => this.onSocketOpen()
    this.socket.onmessage = (m) => this.onSocketMessage(m.data);
    this.socket.onclose = () => this.onSocketClose()

    this.token = sessionStorage.getItem('token');

    // Get User Wallet Info.
    if(this.token) {
      Api.GetBalance(this.token)
        .then(data => {
          if(data) {
            this.setState({
              wallet: data.message
            });
          }
        })
        .catch(error => {
          console.log(error);
        });

      Api.GetOrderinfo(this.token)
      .then(res => {
        this.setState({
          pendding_orders : res.message
        })
      })
      .catch(err => {
        console.log(err);
      });
  
      Api.GetOrderdetail(this.token)
      .then(res => {
        this.setState({
          completed_orders : res.message
        })
      })
      .catch(err => {
        console.log(err);
      });
    }
    else {
      
      alert("Token is null, Need to signin");
      this.setState({
        redirect : true
      })
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

  onClickRefreshWallet = () => {
    Api.GetBalance(this.token)
    .then(data => {
      if(data) {
        alert("wallet refresh success");
        this.setState({
          wallet: data.message
        });
      }
    })
    .catch(error => {
      alert("wallet refresh error");
      console.log(error);
    });
  }

  onClickRefreshOrderinfo = () => {
    console.log(1, "onClickRefreshOrderinfo");
    if(this.token) {
      console.log(2, "onClickRefreshOrderinfo");

      Api.RefreshOrders(this.token)
        .then(res => {
          Api.GetOrderinfo(this.token)
          .then(res => {
            this.setState({
              pendding_orders : res.message
            })
          })
          .catch(err => {
            console.log(err);
          });
      
          Api.GetOrderdetail(this.token)
          .then(res => {
            this.setState({
              completed_orders : res.message
            })
          })
          .catch(err => {
            console.log(err);
          });
        })
        .catch(err => {
          console.log(err);
        })
    }

  }

  onClickSelCoin = (e) => {
    if(e.target.id !== this.state.subscribeCoin) {
      this.setState({
        subscribeCoin : e.target.id
      });
      this.sendCoinSubscribe();
    }
  }

  render() {
    if(this.state.redirect) {
      return <Redirect to='/' />

    }
    else {

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
              <button className="coin-select-button" onClick={this.onClickRefreshWallet}> WALLET REFRESH </button>
              <br /><br />

              <Ordersend 
                coinName  = {this.state.subscribeCoin} 
                wallet    = {this.state.wallet ? this.state.wallet : null} 
                orderbook = {this.state.orderbook}
                orderRefresh = {this.onClickRefreshOrderinfo}
                walletRefresh = {this.onClickRefreshWallet}
              />
            </div>
  
          </div>
          <button className="coin-select-button" onClick={this.onClickRefreshOrderinfo}> Order Refresh </button>

          <div style={{color:"white"}}>
            <Orderinfo 
              pendingOrders = {this.state.pendding_orders ? this.state.pendding_orders : null } 
              completedOrders = {this.state.completed_orders ? this.state.completed_orders : null }
            />

          </div>
  
        </div>
      );
    }
  }
}

export default Arbitrage;