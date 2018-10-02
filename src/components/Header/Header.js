import React, { Component } from 'react';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import './Header.css';

export default class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: true
    };
  }

  toggleNavbar = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  render() {
    return (
      <div className="header">
        <Nav>

          <NavItem>
            <NavLink href="/" style={{color:"white"}} >HOME</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="/arbitrage-korea" style={{color:"white"}}>ARBITRAGE-KOREA</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="/wallet" style={{color:"white"}}>WALLET</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="/arbitrage-triangle" style={{color:"white"}}>TRIANGLE-ARB</NavLink>
          </NavItem>

        </Nav>
      </div>
    );
  }
}