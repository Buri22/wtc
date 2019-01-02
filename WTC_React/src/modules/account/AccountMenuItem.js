import React, {Component} from 'react';
import {NavDropdown} from 'react-bootstrap';

import AccountSettingsBtn from './AccountSettings';
import AccountCategoriesBtn from './AccountCategories';
import LogOutBtn from './LogOut';
import User from 'model/user';

export default class AccountMenuItem extends Component {
  state = {
    userName: User.getProp('userName')
  };
  handleUserNameChange(userName) {
    this.setState({userName: userName});
  }

  render () {
    return (
      <NavDropdown title={this.state.userName || 'User'} id="account-nav-dropdown">
        <AccountSettingsBtn logout={this.props.logout} handleUserNameChange={this.handleUserNameChange.bind(this)}/>
        <AccountCategoriesBtn logout={this.props.logout} />
        <LogOutBtn logout={this.props.logout} />
      </NavDropdown>
    );
  }
}
