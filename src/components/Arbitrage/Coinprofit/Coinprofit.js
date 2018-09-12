import React, { Component } from 'react';
import _ from 'lodash';

import * as util from "lib/utils";

import './Coinprofit.css';

class Coinprofit extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };


  }
  
  componentDidMount() {



  }

  calculateCoinBenefit = (data) => {
    if(data.orderbook) {
      let toCalculate = {};
      
      _.forEach(data.orderbook, (item, key) => {
        if(key.split('_')[1] === 'ASK') {
          toCalculate.askPrice = Number(item[0].price);
          toCalculate.askVolume = Number(item[0].volume);
        }
        else if(key.split('_')[1] === 'BID') {
          const length = item.length;
          toCalculate.bidPrice = Number(item[length-1].price);
          toCalculate.bidVolume = Number(item[length-1].volume);
        }
      });

      toCalculate.minimumVol = toCalculate.askVolume > toCalculate.bidVolume ? toCalculate.bidVolume : toCalculate.askVolume;

      // Fiat Benefit!
      toCalculate.requiredFiatFunds = toCalculate.askPrice * toCalculate.minimumVol;
      toCalculate.fiatProfit = toCalculate.minimumVol * (toCalculate.bidPrice - toCalculate.askPrice);

      // Crypto Coin Benefit
      toCalculate.requiredCoinFunds = toCalculate.minimumVol * toCalculate.bidPrice;
      toCalculate.coinProfit = toCalculate.requiredCoinFunds / toCalculate.askPrice - toCalculate.minimumVol;

      // Common value.
      toCalculate.percentageProfit = (toCalculate.coinProfit / toCalculate.minimumVol) * 100;
      toCalculate.percentageProfit = util.convertFloatDigit(toCalculate.percentageProfit, 2)

      return (
        <tbody>
          <tr>
            <td style={{ color: "#F79F1F" }}>{ toCalculate.percentageProfit }%</td>
            <td style={{ color: "whitesmoke" }}>KRW</td>
            <td style={{ color: "whitesmoke" }}>{ data.coinName }</td>
          </tr>
          <tr>
            <td style={{ color: "whitesmoke" }}>Req.Funds</td>
            <td style={{ color: "gold" }}>₩{ util.expressKRW(toCalculate.requiredFiatFunds) }</td>
            <td style={{ color: "gold" }}>₩{ util.expressKRW(toCalculate.requiredCoinFunds) }</td>
          </tr>
          <tr>
            <td style={{ color: "whitesmoke" }}>Profit</td>
            <td style={{ color: "gold" }}>₩{ util.expressKRW(toCalculate.fiatProfit) }</td>
            <td style={{ color: "gold" }}>{ util.convertFloatDigit(toCalculate.coinProfit, 6) } { data.coinName }</td>
          </tr>
        </tbody>

      )
    }
  }

  render() {
    return (
      <div className="coinprofit-wrapper">
        <table className="coinprofit-table">
          { this.calculateCoinBenefit(this.props) }
        </table>
      </div>
    );
  }
}

export default Coinprofit;