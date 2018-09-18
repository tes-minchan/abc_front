import React, { Component } from 'react';
import * as Api from 'lib/api';
import './Orderinfo.css';

class Orderinfo extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
    
    this.token = sessionStorage.getItem('token');

    Api.GetOrderinfo(this.token)
      .then(res => {
        this.setState({
          orderinfo : res.message
        })
      })
      .catch(err => {
        console.log(err);
      })

  }

  onClickRefreshOrderinfo = () => {
    Api.GetOrderinfo(this.token)
    .then(res => {
      this.setState({
        orderinfo : res.message
      })
    })
    .catch(err => {
      console.log(err);
    })
  }

  render() {

    const orderinfoArea = this.state.orderinfo ? 
      (
        this.state.orderinfo.map(item => {
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
              <td>{item.status}</td>
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
              <td>status</td>
            </tr>
            {orderinfoArea}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Orderinfo;