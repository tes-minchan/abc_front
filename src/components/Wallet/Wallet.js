import React, { Component } from 'react';
import * as Api from 'lib/api';
import Header from '../Header';
import _ from 'lodash';

import * as util from "lib/utils";
import './Wallet.css';


class Wallet extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };

    this.coinList = [ 'KRW', 'BTC' , 'BCH' , 'EOS' , 'ETC' , 'ETH' , 'LTC' , 'OMG' , 'QTUM' , 'XRP' , 'ZIL' , 'XLM'];
  }

  componentDidMount() {
    this.token = sessionStorage.getItem('token');
    let toSetData = [];

    if(this.token) {
      Api.GetBalance(this.token)
        .then(data => {

          if(data.success) {
            data.message['TOTAL'] = {};
            this.coinList.forEach(coin => {
              let sumCoin = 0;

              _.forEach(data.message, (element, market) => {
                const coinBalance = element[coin] ? Number(element[coin].available) : 0;
                sumCoin += Number(coinBalance);

              });
              data.message['TOTAL'][coin] = sumCoin;
            });

            this.setState({
              wallet: data.message
            });
          }

        })
        .catch(error => {
          console.log(error);
        });
    }

  }

  onClickRefreshWallet = () => {
    Api.GetBalance(this.token)
    .then(data => {
      if(data.success) {
        alert("wallet refresh success");
        this.setState({
          wallet: data.message
        });
      }
      else {
        alert("wallet refresh fail");
      }
    })
    .catch(error => {
      alert("wallet refresh error");
      console.log(error);
    });
  }

  render() {

    const walletArea = this.state.wallet ? (
      _.map(this.state.wallet, (item, market) => {

        if(market === 'TOTAL') {
          return (
            <tr>
              <td style={{color:"#e17055"}}>{market}</td>
              {
                this.coinList.map(coin => {
                  if(coin === 'KRW') {
                    //  util.expressKRW
                    return (<td> ₩ { item[coin] ? util.expressKRW(item[coin]) : 0 }</td>)
                  }
                  else {
                    return (<td>{ item[coin] ? util.convertFloatDigit(item[coin], 8) : 0 }</td>)
                  }
                })
              }
            </tr>
          )
        }
        else {
          return (
            <tr>
              <td style={{color:"rgb(82, 176, 120)"}}>{market}</td>
              {
                this.coinList.map(coin => {
                  if(coin === 'KRW') {
                    //  util.expressKRW
                    return (<td> ₩ { item[coin] ? util.expressKRW(item[coin].available) : 0 }</td>)
                  }
                  else {
                    return (<td>{ item[coin] ? item[coin].available : 0 }</td>)
                  }
                })
              }
            </tr>
          )
        }
      })
    ) : null;

    return (
      <div>
        <Header />
        <div className="wallet-wrapper">
          <div style={{textAlign : "right", marginBottom: "15px"}}>
            <button className="wallet-refresh-btn" onClick={this.onClickRefreshWallet}> WALLET REFRESH </button>
          </div>

          <table className="wallet-table">
            <tbody>
              <tr>
                <th style={{color:"gold"}}>MARKET</th>
                {
                  this.coinList.map(coin => {
                    return (
                      <th style={{color:"gold"}}>{coin}</th>
                    )
                  })
                }
              </tr>
              { walletArea }
            </tbody>
          </table>
        </div>

      </div>
    );
  }
}

export default Wallet;