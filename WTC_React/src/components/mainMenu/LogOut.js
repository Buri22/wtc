import React, { Component } from 'react';
import { NavItem } from 'react-bootstrap';
import user from '../../model/user';
import Loading from '../loading/Loading';

export default class LogOut extends Component {
    state = {
        inProcess: false
    };

    handleLogout() {
        this.setState({ inProcess: true });
        user.logOut()
            .then((response) => {
                if (response === true) {
                    this.props.logout();
                }
                else {
                    this.setState({ inProcess: false });
                }
            });
    }

    renderLogOutMenuItem() {
        let itemContent;

        if (this.state.inProcess) {
            itemContent =
                <NavItem
                    title='Loading'
                    className='loading'
                >
                    <Loading />
                </ NavItem>;
        }
        else {
            itemContent =
                <NavItem
                    onClick={this.handleLogout.bind(this)}
                    title="Logout"
                >
                    <span className="glyphicon glyphicon-log-out"></span>
                </NavItem>;
        }
        return itemContent;
    }

    render() {
        return this.renderLogOutMenuItem();
    }
}