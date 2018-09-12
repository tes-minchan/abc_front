import React, { Component } from 'react';
import _ from 'lodash';
import './Orderbook.css';

class Orderbook extends Component {
  constructor(props) {
    super(props);
    this.priceGap = 0;
  }

  render() {

    let askOrderbook = null;
    let bidOrderbook = null;

    if(this.props.orderbook) {
      let askPrice = 0;
      let bidPrice = 0;
      const parseAsk = this.props.orderbook[`${this.props.orderbook.coinName}_ASK`].slice(0,10).reverse();
      askPrice = Number(parseAsk[parseAsk.length-1].price);
      askOrderbook = parseAsk.map(item => {

        return (
          <tr>
            <td style={{ width: "100px", color: "#c8d6e5" }}>{item.volume}</td>
            <td style={{ width: "100px", color: "rgb(226, 19, 70)" }}>{item.price}</td>
            <td style={{ width: "100px", color: "#8395a7" }}>{item.market}</td>
          </tr>
        )
      });
      const parseBid = this.props.orderbook[`${this.props.orderbook.coinName}_BID`].reverse().slice(0,10);
      bidPrice = Number(parseBid[0].price);
      bidOrderbook = parseBid.map(item => {

        return (
          <tr>
            <td style={{ width: "100px", color: "#c8d6e5" }}>{item.volume}</td>
            <td style={{ width: "100px", color: "rgb(82, 176, 120)" }}>{item.price}</td>
            <td style={{ width: "100px", color: "#8395a7" }}>{item.market}</td>
          </tr>
        )
      });
      this.priceGap = askPrice-bidPrice;

    }

      
    return (
      <div>
        <table className="arbitrage-table">
          <tbody>
            { askOrderbook }
            <tr>
              <td></td>
              <td style={{ color: "goldenrod" , fontSize: "30px"}}> { this.priceGap }</td>
            </tr>
            { bidOrderbook }
          </tbody>
        </table>
      </div>
    );
  }
}

export default Orderbook;

