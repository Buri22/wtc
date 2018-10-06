import React, {Component} from 'react';
import {NavDropdown} from 'react-bootstrap';

import AccountSettingsBtn from './AccountSettings';
import LogOutBtn from './LogOut';
import user from 'model/user';

export default class AccountMenuItem extends Component {
  state = {
    userName: user.getProp('userName')
  };
  handleUserNameChange(userName) {
    this.setState({userName: userName});
  }

  render () {
    return (
      <NavDropdown title={this.state.userName || 'User'} id="account-nav-dropdown">
        <AccountSettingsBtn logout={this.props.logout} handleUserNameChange={this.handleUserNameChange.bind(this)}/>
        <LogOutBtn logout={this.props.logout} />
      </NavDropdown>
    );
  }
}
