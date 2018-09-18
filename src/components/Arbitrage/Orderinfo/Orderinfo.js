import React, { Component } from 'react';
import * as Api from 'lib/api';
import './Orderinfo.css';

class Orderinfo extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
    
  }

  render() {
    const {pendingOrders, completedOrders} = this.props;

    const pendingOrderinfoArea = pendingOrders ? 
      (
        pendingOrders.map(item => {
          return (
            <tr>
              <td>{item.reg_date}</td>
              <td>{item.market}</td>
              <td>{item.currency}</td>
              <td>{item.price}</td>
              <td>{item.volume}</td>
              <td>{item.remain_volume}</td>
              <td>{item.side}</td>
              <td>{item.market_status}</td>
            </tr>
          )
        })
        
      )
    : null;

    const completedOrderinfoArea = completedOrders ? 
    (
      completedOrders.map(item => {
        return (
          <tr>
            <td>{item.trade_date}</td>
            <td>{item.market}</td>
            <td>{item.currency}</td>
            <td>{item.price}</td>
            <td>{item.volume}</td>
            <td>{item.side}</td>
            <td>{item.trade_funds}</td>
            <td>{item.fee}</td>
          </tr>
        )
      })
    )
    : null;

    return (
      <div className="orderinfo-wrap">
        <span className="coin-title"> PENDING ORDERS </span>
        {/* <button className="coin-select-button" onClick={this.onClickRefreshOrderinfo}> REFRESH </button><br /> */}
        
        <table className="orderinfo-table">
          <tbody>
            <tr>
              <td>time</td>
              <td>market</td>
              <td>currency</td>
              <td>price</td>
              <td>volume</td>
              <td>remain_volume</td>
              <td>side</td>
              <td>market_status</td>
            </tr>
            {pendingOrderinfoArea}
          </tbody>
        </table>

        <span className="coin-title"> COMPLETED ORDERS </span>
        <table className="orderinfo-table">
          <tbody>
            <tr>
              <td>time</td>
              <td>market</td>
              <td>currency</td>
              <td>price</td>
              <td>volume</td>
              <td>side</td>
              <td>trade_funds</td>
              <td>fee</td>
            </tr>

            {completedOrderinfoArea}
          </tbody>

        </table>
      </div>
    );
  }
}

export default Orderinfo;