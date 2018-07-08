import React, { Component } from 'react';
import { MenuItem } from 'react-bootstrap';
import user from '../../model/user';

export default class LogOut extends Component {

    handleLogout() {
        user.logOut()
            .then((response) => {
                if (response === true) {
                    this.props.logout('You were successfuly logged out.');
                }
                else {
                    // TODO: show message that logout failed
                }
            });
    }

    render() {
        return <MenuItem
                    onClick={this.handleLogout.bind(this)}
                    title="Logout"
                >
                    <span className="glyphicon glyphicon-log-out"></span>
                    <span> Logout</span>
                </MenuItem>;
    }
}