import React, {Component} from 'react';
import {Navbar, Nav} from 'react-bootstrap';

import {DEFAULT_MODULE} from '../../constants';
import MenuItemRenderer from '../../services/MenuItemRenderer';
import AppSettings from './AppSettings';

// chybi popisek tridy
export default class Menu extends Component {
  state = {
    activeModule: DEFAULT_MODULE
  };

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
          <Nav id="mainMenu">
            <MenuItemRenderer
              position="left"
              activeModule={this.state.activeModule}
              onMenuItemClick={this.onMenuItemClick.bind(this)}
            />
          </Nav>
          <Nav pullRight>
            <MenuItemRenderer position="right" logout={this.props.logout} />
            <AppSettings
              logout={this.props.logout}
              onAppSettingsChange={this.props.onAppSettingsChange}
            />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
