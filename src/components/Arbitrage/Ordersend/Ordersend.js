import React, { Component, Fragment } from 'react';
import './Ordersend.css';
import * as util from "lib/utils";
import * as Api from 'lib/api';
import * as config from './Config';

class Ordersend extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tradeVol : 1
    };
    
    this.tradeVolList = [1, 0.75, 0.5, 0.25, 0.1, 0.01];

  }

  onClickVolumeSel = (e) => {
    this.setState({ tradeVol : Number(e.target.id) })
  }


  onClickArb = async () => {
    const {coinName, wallet, orderbook, orderRefresh, walletRefresh} = this.props;

    const parseAsk = orderbook[`${orderbook.coinName}_ASK`].slice(0,10)[0];
    const parseBid = orderbook[`${orderbook.coinName}_BID`].slice(0,10)[0];
    const element = this.calculateBenefit(orderbook, wallet);
    const tradeVol = util.convertFloatDigit(Number(element.tradeVol * this.state.tradeVol), 4);

    let buyEnable = await this.checkAskVolume(coinName, element, parseAsk, tradeVol, wallet);
    let sellEnable = await this.checkBidVolume(coinName, element, parseBid, tradeVol, wallet);

    if(sellEnable && buyEnable) {
      
      let buyOrderinfo = {
        "market" : element.askMarket.toUpperCase(),
        "coin"   : coinName.toUpperCase(),
        "side"   : "BUY",
        "price"  : element.askOrderPrice,
        "volume" : tradeVol.toString()
      }

      // Api.OrderSend(buyOrderinfo)
      // .then((data) => {
      //   console.log("BUY success ",data);
      //   orderRefresh();
      //   walletRefresh();
      // }, (err) => {
      //   // Need to error control
      //   console.log("BUY error ",err);
      //   alert(JSON.stringify(err));
      // });

      const sellOrderinfo = {
        "market" : element.bidMarket.toUpperCase(),
        "coin"   : coinName.toUpperCase(),
        "side"   : "SELL",
        "price"  : element.bidOrderPrice,
        "volume" : tradeVol.toString()
      }
  
      // Api.OrderSend(sellOrderinfo)
      // .then((data) => {
      //   console.log("SELL success ",data);
      //   orderRefresh();
      //   walletRefresh();
      // }, (err) => {
      //   // Need to error control
      //   console.log("SELL error ",err);
      //   alert(JSON.stringify(err));
      // });

      console.log(buyOrderinfo);
      console.log(sellOrderinfo);

    }

  }

  checkAskVolume = (coinName, element, parseAsk, tradeVol, wallet) => {
    return new Promise(async (resolve)=> {
      const minimVol = Number(config.orderinfo[element.askMarket][coinName].minVol);
      const tradeFunds = tradeVol * parseAsk.price;
      let buyEnable = false;

      if(element.askMarket === 'UPBIT') {
        if(tradeFunds > minimVol) {
          // Check user wallet 
          const userBalance = wallet[element.askMarket]['KRW'] ? wallet[element.askMarket]['KRW'].available : 0;
          if(userBalance > tradeFunds) {
            buyEnable = true;
          }
          else {
            alert(`[구매] 지갑 원화가 부족함. KRW : ${userBalance}, required : ${tradeFunds}`)
          }
        }
        else {
          alert(`[구매] 마켓 최소 주문량보다 작음. tradeFunds : ${tradeFunds}, marketVol : ${minimVol}`)
        }
      }
      else {
        if(tradeVol > minimVol) {
          // Check user wallet 
          const userBalance = wallet[element.askMarket]['KRW'] ? wallet[element.askMarket]['KRW'].available : 0;

          if(userBalance > tradeFunds) {
            buyEnable = true;
          }
          else {
            alert(`[구매] 지갑 원화가 부족함. KRW  : ${userBalance}, required : ${tradeFunds}`)
          }
        }
        else {
          alert(`[구매] 마켓 최소 주문량보다 작음. tradeVol : ${tradeVol}, marketVol : ${minimVol}`)
        }
      }

      resolve(buyEnable);
    });
  }

  checkBidVolume = (coinName, element, parseBid, tradeVol, wallet) => {
    return new Promise(async (resolve)=> {
      const minimVol = Number(config.orderinfo[element.bidMarket][coinName].minVol);
      const tradeFunds = tradeVol * parseBid.price;
      let sellEnable = false;

      if(element.bidMarket === 'UPBIT') {
        if(tradeFunds > minimVol) {
          const userBalance = wallet[element.bidMarket][coinName] ? wallet[element.bidMarket][coinName].available : 0;
          if(userBalance > tradeVol) {
            sellEnable = true;
          }
          else {
            alert(`[판매] 지갑 코인이 부족함, coin : ${userBalance}, required : ${tradeVol}`)
          }
        }
        else {
          alert(`[판매] 마켓 최소 주문량보다 작음. tradeFunds : ${tradeFunds}, marketVol : ${minimVol}`)
        }
  
      }
      else {
        if(tradeVol > minimVol) {
          const userBalance = wallet[element.bidMarket][coinName] ? wallet[element.bidMarket][coinName].available : 0;
          if(userBalance > tradeVol) {
            sellEnable = true;
          }
          else {
            alert(`[판매] 지갑 코인이 부족함, userBalance : ${userBalance}, required : ${tradeVol}`)
          }
        }
        else {
          alert(`[판매] 마켓 최소 주문량보다 작음. tradeVol : ${tradeVol}, marketVol : ${minimVol}`)
        }
      }
      resolve(sellEnable);
    });
  }


  calculateBenefit = (orderbook, wallet) => {
    let returnData = {}
    let priceCount = 0;

    const parseAsk = orderbook[`${orderbook.coinName}_ASK`].slice(0,10)[0];
    const parseBid = orderbook[`${orderbook.coinName}_BID`].slice(0,10)[0];

    returnData.askPrice  = parseAsk.price;
    returnData.askVolume = parseAsk.volume;
    returnData.askMarket = parseAsk.market;

    orderbook[`${orderbook.coinName}_ASK`].forEach(item => {
      if(item.market === parseAsk.market) {
        if(priceCount++ > 2) {
          returnData.askOrderPrice  = item.price;
          return;
        }
      }
    });

    orderbook[`${orderbook.coinName}_BID`].forEach(item => {
      if(item.market === parseAsk.market) {
        if(priceCount++ > 2) {
          returnData.bidOrderPrice  = item.price;
          return;
        }
      }
    });

    returnData.bidPrice  = parseBid.price;
    returnData.bidVolume = parseBid.volume;
    returnData.bidMarket = parseBid.market;

    returnData.minimumVol = Number(returnData.askVolume) > Number(returnData.bidVolume) ? returnData.bidVolume : returnData.askVolume;

    const availBuy  = wallet[parseAsk.market].KRW ? wallet[parseAsk.market].KRW.available : 0;
    const availSell = wallet[parseBid.market][orderbook.coinName.substring(0,3)] ? wallet[parseBid.market][orderbook.coinName.substring(0,3)].available : 0;

    returnData.tradeVol = availBuy/parseAsk.price > availSell ? availSell : availBuy/parseAsk.price;
    returnData.tradeVol = returnData.tradeVol > returnData.minimumVol ? returnData.minimumVol : returnData.tradeVol;

    returnData.requiredFiatFunds = returnData.askOrderPrice * (returnData.tradeVol * this.state.tradeVol);
    returnData.requiredCoinFunds = returnData.tradeVol * this.state.tradeVol;

    return returnData;
  }

  render() {
    const {coinName, wallet, orderbook} = this.props;

    const buyArea = () =>  {
      if(wallet && orderbook) {
        const element = this.calculateBenefit(orderbook, wallet);

        return (
          <Fragment>
            <span className="ordersend-market-title" style={{color : "rgb(226, 19, 70)"}}>{ element.askMarket }</span>
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
                <tr>
                  <td style={{ textAlign:"left"}}>Price </td>
                  <td style={{ color:"rgb(226, 19, 70)", textAlign:"right" }}> ₩ {util.expressKRW(element.askPrice)} </td>
                </tr>
                <tr>
                  <td style={{ textAlign:"left"}}>Volume </td>
                  <td style={{ color:"rgb(226, 19, 70)", textAlign:"right" }}> {util.convertFloatDigit(element.askVolume * this.state.tradeVol, 4)} </td>
                </tr>
                <tr>
                  <td style={{ textAlign:"left"}}>tradeMinVol</td>
                  <td style={{ textAlign:"right"}}>{ element.askMarket === 'UPBIT' ? ("₩ "+config.orderinfo[element.askMarket][coinName].minVol) : config.orderinfo[element.askMarket][coinName].minVol + " " + coinName }</td>
                </tr>

              </tbody>
            </table>
            {/* <button className="ordersend-buy-btn" id={"element"} onClick={this.onClickBuy}>BUY</button> */}
          </Fragment>
        )
      }
      else {
        return null;
      }
    }

    const sellArea = () =>  {
      if(wallet && orderbook) {
        const element = this.calculateBenefit(orderbook, wallet);

        return (
          <Fragment>
            <span className="ordersend-market-title" style={{color : "rgb(82, 176, 120)"}}>{ element.bidMarket }</span>
            <table className="ordersend-table">
              <tbody>
                <tr>
                  <td style={{ textAlign:"left"}}>COIN Balance</td>
                  <td style={{ color:"gold", textAlign:"right" }}> { wallet[element.bidMarket][coinName] ? wallet[element.bidMarket][coinName].available : 0 } {coinName}</td>
                </tr>
                <tr>
                  <td style={{ textAlign:"left"}}>Required Coin</td>
                  <td style={{ color:"gold", textAlign:"right" }}> { element.requiredCoinFunds ? util.convertFloatDigit(element.requiredCoinFunds, 4) : 0 }</td>
                </tr>
                <tr>
                  <td style={{ textAlign:"left"}}>Price </td>
                  <td style={{ color:"rgb(82, 176, 120)", textAlign:"right" }}> ₩ {util.expressKRW(element.bidPrice)} </td>
                </tr>
                <tr>
                  <td style={{ textAlign:"left"}}>Volume </td>
                  <td style={{ color:"rgb(82, 176, 120)", textAlign:"right" }}> {util.convertFloatDigit(element.bidVolume * this.state.tradeVol, 4)} </td>
                </tr>
                <tr>
                  <td style={{ textAlign:"left"}}>tradeMinVol</td>
                  <td style={{ textAlign:"right"}}>{ element.bidMarket === 'UPBIT' ? ("₩ "+config.orderinfo[element.bidMarket][coinName].minVol) : config.orderinfo[element.bidMarket][coinName].minVol + " " + coinName }</td>
                </tr>
              </tbody>
            </table>
            {/* <button className="ordersend-sell-btn" id={"element"} onClick={this.onClickSell}>SELL</button> */}

          </Fragment>
        )
      }
      else {
        return null;
      }
    }

    const arbitrageArea = () => {
      if(wallet && orderbook) {
        const element = this.calculateBenefit(orderbook, wallet);
        const tradeVol = util.convertFloatDigit(element.tradeVol * this.state.tradeVol, 4);
        let profit = Number(element.bidPrice) - Number(element.askPrice);
        profit = profit * tradeVol;

        return (
          <Fragment>
            <div>
              <table className="ordersend-arbi-table">
                <tbody>
                  <tr>
                    <td style={{color:"whiteSmoke" , fontSize : "16px", textAlign:"left"}}>Trade Volume</td>
                    <td style={{color:"gold" , fontSize : "16px"}}>{ tradeVol }</td>
                  </tr>
                  <tr>
                    <td style={{color:"whiteSmoke" , fontSize : "16px", textAlign:"left"}}>Profit</td>
                    <td style={{color:"gold" , fontSize : "16px"}}>₩ { util.expressKRW(profit) }</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button className="ordersend-arbi-btn" id={"ARBITRAGE"} onClick={this.onClickArb}>ARBITRAGE</button>

          </Fragment>
        )
      }
    }




    return (
      <div>
        <div>
          {
            this.tradeVolList.map(element => {
              if(element === this.state.tradeVol) {
                return <button className="coin-selected-button" id={element} onClick={this.onClickVolumeSel}>{element*100}%</button>
              }
              else {
                return <button className="coin-select-button" id={element} onClick={this.onClickVolumeSel}>{element*100}%</button>
              }
            })
          }

        </div>
        <div className="ordersend-grid-container">

          <div className="ordersend-grid-item">
            { buyArea() }

          </div>

          <div className="ordersend-grid-item">
            { sellArea() }
          </div>

        </div>
          { arbitrageArea() }

      </div>
    );
  }
}

export default Ordersend;