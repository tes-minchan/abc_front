import React, { Component, Fragment } from 'react';
import Header from '../Header';
import websocket from "config";
import _ from 'lodash';
import './Arbitrage_triangle.css';

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
    this.setState({
      arbiTriInfo : parseJson
    });



  }

  render() {

    let arbitrageTriArea = null;

    if(this.state.arbiTriInfo) {
      arbitrageTriArea = _.map(this.state.arbiTriInfo, (element, name) => {
        return (
          <tr>
            <td>{name}</td>
            <td>{element.price}</td>
            <td>{element.volume}</td>

          </tr>
        )
      });
    }


    return (
      <Fragment>
        <Header />
        <div className="arbitriangle-wrapper">
          <table className="arbitriangle-table">
            <tbody>
              {arbitrageTriArea}
            </tbody>
          </table>
        </div>
      </Fragment>
    );
  }
}

export default Arbitrage_Triangle;