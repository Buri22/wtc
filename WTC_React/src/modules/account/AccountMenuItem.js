import React, {Component} from 'react';
import {NavDropdown} from 'react-bootstrap';

import AccountSettingsBtn from './AccountSettings';
import LogOutBtn from './LogOut';

export default class AccountMenuItem extends Component {
  render () {
    return (
      <NavDropdown title="Account" id="account-nav-dropdown">
        <AccountSettingsBtn logout={this.props.logout} />
        <LogOutBtn logout={this.props.logout} />
      </NavDropdown>
    );
  }
}
