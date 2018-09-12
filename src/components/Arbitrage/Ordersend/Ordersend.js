import React, { Component, Fragment } from 'react';
import './Ordersend.css';
import * as util from "lib/utils";

class Ordersend extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };


  }

  onClickVolumeSel = (e) => {

    console.log(e.target.id);
  }

  calculateBenefit = (orderbook) => {

    let returnData = {}

    const parseAsk = orderbook[`${orderbook.coinName}_ASK`].slice(0,10)[0];
    const parseBid = orderbook[`${orderbook.coinName}_BID`].slice(0,10)[0];

    returnData.askPrice  = parseAsk.price;
    returnData.askVolume = parseAsk.volume;
    returnData.askMarket = parseAsk.market;
    returnData.bidPrice  = parseBid.price;
    returnData.bidVolume = parseBid.volume;
    returnData.bidMarket = parseBid.market;

    returnData.minimumVol = returnData.askVolume > returnData.bidVolume ? returnData.bidVolume : returnData.askVolume;
    returnData.requiredFiatFunds = returnData.askPrice * returnData.minimumVol;
    returnData.requiredCoinFunds = returnData.minimumVol * returnData.bidPrice;

    return returnData;
  }

  render() {
    const {coinName, wallet, orderbook} = this.props;

    const buyArea = () =>  {
      if(wallet && orderbook) {
        const element = this.calculateBenefit(orderbook);
        return (
          <Fragment>
            <span className="ordersend-market-title">{ element.askMarket }</span>
            <table className="ordersend-table">
              <tbody>
                <tr>
                  <td style={{ textAlign:"left"}}>KRW Balance</td>
                  <td style={{ color:"gold", textAlign:"right" }}> ₩ { wallet[element.askMarket]['KRW'] ? util.expressKRW(wallet[element.askMarket]['KRW'].available) : 0 }</td>
                </tr>
                <tr>
                  <td style={{ textAlign:"left"}}>Required Funds</td>
                  <td style={{ color:"gold", textAlign:"right" }}> ₩ { element.requiredFiatFunds ? util.expressKRW(element.requiredFiatFunds) : 0 }</td>
                </tr>
              </tbody>
            </table>
          </Fragment>
        )
      }
      else {
        return null;
      }
    }

    const sellArea = () =>  {
      if(wallet && orderbook) {
        const element = this.calculateBenefit(orderbook);
        return (
          <Fragment>
            <span className="ordersend-market-title">{ element.bidMarket }</span>
            <table className="ordersend-table">
              <tbody>
                <tr>
                  <td style={{ textAlign:"left"}}>COIN Balance</td>
                  <td style={{ color:"gold", textAlign:"right" }}> ₩ { wallet[element.bidMarket][coinName] ? wallet[element.bidMarket][coinName].available : 0 }</td>
                </tr>
                <tr>
                  <td style={{ textAlign:"left"}}>Required Funds</td>
                  <td style={{ color:"gold", textAlign:"right" }}> ₩ { element.requiredCoinFunds ? util.expressKRW(element.requiredCoinFunds) : 0 }</td>
                </tr>
              </tbody>
            </table>
          </Fragment>
        )
      }
      else {
        return null;
      }
    }




    return (
      <div>
        <div>
          <button className="coin-select-button" id="volume_100" onClick={this.onClickVolumeSel}>100%</button>
          <button className="coin-select-button" id="volume_50" onClick={this.onClickVolumeSel}>50%</button>
          <button className="coin-select-button" id="volume_10" onClick={this.onClickVolumeSel}>10%</button>
        </div>
        <div className="ordersend-grid-container">

          <div className="ordersend-grid-item">
            {buyArea()}
          </div>

          <div className="ordersend-grid-item">
            {sellArea()}
          </div>

        </div>
      </div>
    );
  }
}

export default Ordersend;