import React, {Component} from 'react';
import {Navbar, Nav, NavItem} from 'react-bootstrap';

import {DEFAULT_MODULE} from '../../constants';
import MenuItemRenderer from '../../services/MenuItemRenderer';
import AppSettings from './AppSettings';

export default class Menu extends Component {
  state = {
    activeKey: 1,
    activeModule: DEFAULT_MODULE
  };

  handleSelect (selectedKey) {
    this.setState ({activeKey: selectedKey});
  }

  onMenuItemClick(currentMenuItem) {
    this.state.activeModule = currentMenuItem;
    this.setState({activeModule: this.state.activeModule});
  }

  render () {
    return (
      <Navbar fluid collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#brand">Work Time Counter</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav
            activeKey={this.state.activeKey}
            onSelect={this.handleSelect.bind (this)}
          >            
            <MenuItemRenderer
              position="left"
              activeModule={this.state.activeModule}
              onMenuItemClick={this.onMenuItemClick.bind(this)}
            />
          </Nav>
          <Nav pullRight>
            <MenuItemRenderer position="right" />
            <AppSettings logout={this.props.logout} />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
