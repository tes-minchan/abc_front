import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'

import * as Api from 'lib/api';
import './Signin.css';

class Signin extends Component {

  constructor(props) {
    super(props);
    this.state = {
      redirect : false
    };

  }

  onChange = (id) => {
    return (e) => {
      let scope = {}
      scope[id]=e.target.value
      this.setState(scope)
    }
  }
  
  onClickSignin = (e) => {
    const userinfo = {
      data : {
        "id"       : this.state.id,
        "password" : this.state.password
      }
    }
    
    Api.SignIn(userinfo)
    .then((data) => {
      sessionStorage.setItem('token', data.message);
      this.setState({
        redirect : true
      });
    }, (err) => {
      // Need to error control
      console.log(err);
      // alert(err.response.data.message);
    });

  }

  render() {
    if(this.state.redirect) {
      return <Redirect to='/arbitrage-korea' />
    }
    else {
      return (
        <div className="form-wrapper">
          <h1> Signin</h1>
          <input type="text" name="id" placeholder="ID" required="" onChange={this.onChange('id')}/><br />
          <input type="password" name="pwd" placeholder="PASSWORD" required="" onChange={this.onChange('password')} /><br />
          <button className="signin-button" onClick={this.onClickSignin}>Sign In</button>
        </div>
      );
    }
  }
}

export default Signin;