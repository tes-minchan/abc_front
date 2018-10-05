import React, { Component, Fragment } from 'react';
import Header from '../Header';
import websocket from "config";
import _ from 'lodash';
import './Arbitrage_triangle.css';
import * as config from './Config';
import * as Cal from './calculation';

class Arbitrage_Triangle extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };

  }

  componentDidMount() {

    // connect to websocket.
    this.socket = new WebSocket(websocket.URL);
    this.socket.onopen = () => this.onSocketOpen()
    this.socket.onmessage = (m) => this.onSocketMessage(m.data);
    this.socket.onclose = () => this.onSocketClose()

  }

  onSocketOpen = () => {
    let wsSubscribe = {
      type : "arbi-tri",
      base_currency : 'BTC',
      counter_currency : 'ETH',
      korea_base_market : 'BITHUMB',
      korea_counter_market : 'GOPAX',
      abroad_market : 'BINANCE'
    }

    this.socket.send(JSON.stringify(wsSubscribe));
  }

  onSocketClose = () => {

  }

  onSocketMessage = (message) => {
    const parseJson = JSON.parse(message);
    
    const toSetData = _.map(parseJson, (element, name) => {
      const splitName = name.split('_');
      let retData = {
        market : splitName[0],
        counterCoin   : splitName[1].substr(0,3),
        baseCoin : splitName[1].substr(3,6),
        side   : splitName[2],
        price  : element.price,
        volume : element.volume
      }
      retData.minvol = config.orderinfo[retData.market][retData.counterCoin].minVol;
      return retData;
    });

    this.setState({
      arbiTriInfo : toSetData,
      arbiInfo : Cal.calculation(toSetData)
    });


  }

  render() {

    let arbitrageTriArea = null;
    let arbiInfo1Area = null;
    let arbiInfo2Area = null;

    if(this.state.arbiTriInfo) {
      arbitrageTriArea = this.state.arbiTriInfo.map((item) => {
        return (
          <tr>
            <td>{item.market}</td>
            <td>{item.counterCoin}</td>
            <td>{item.baseCoin}</td>
            <td>{item.side}</td>
            <td>{item.price}</td>
            <td>{item.volume}</td>
          </tr>
        )
      });
    }

    if(this.state.arbiInfo) {
      arbiInfo1Area = this.state.arbiInfo.values.map(item => {
        return (
          <td>{item}</td>
        );
      });
      

      arbiInfo2Area = this.state.arbiInfo.cycleloss.map(item => {
        return (
          <td>{item}</td>
        );
      });
      
    }

    return (
      <Fragment>
        <Header />
        <div>

          <select>
            <option value="volvo">GOPAX</option>
            <option value="saab">BITHUMB</option>
            <option value="opel">UPBIT</option>
            <option value="audi">COINONE</option>
          </select>

        </div>
        <div className="arbitriangle-wrapper">
          <table className="arbitriangle-table">
            <tbody>
              {arbitrageTriArea}
              <tr>values</tr>
              <tr>
              {arbiInfo1Area}
              </tr>
              <tr>cycleloss</tr>
              <tr>
              {arbiInfo2Area}
              </tr>
            </tbody>
          </table>
        </div>
      </Fragment>
    );
  }
}

export default Arbitrage_Triangle;