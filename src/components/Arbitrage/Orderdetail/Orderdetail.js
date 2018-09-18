import React, { Component } from 'react';
import * as Api from 'lib/api';
import './Orderdetail.css';

class Orderdetail extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount () {

    this.token = sessionStorage.getItem('token');

    Api.GetOrderdetail(this.token)
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
    const orderinfoArea = this.state ? 
    (
      this.state.orderinfo.map(item => {
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
      <div className="orderdetail-wrap">
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

            {orderinfoArea}

          </tbody>

        </table>
      </div>
    );
  }
}

export default Orderdetail;