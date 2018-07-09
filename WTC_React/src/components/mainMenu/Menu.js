import React, {Component} from 'react';
import {Navbar, Nav, NavItem, NavDropdown} from 'react-bootstrap';

import LogOut from './LogOut';
import AccountSettings from './AccountSettings';
import AppSettings from './AppSettings';

export default class Menu extends Component {
    state = {
        activeKey: 1
    };

    handleSelect(selectedKey) {
        this.setState({ activeKey: selectedKey });
    }

    render(){
        return(
            <Navbar fluid collapseOnSelect>
            <Navbar.Header>
                <Navbar.Brand>
                    <a href="#brand">Work Time Counter</a>
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
                <Nav activeKey={this.state.activeKey} onSelect={this.handleSelect.bind(this)}>
                    <NavItem eventKey={1} href="#">
                        Link
                    </NavItem>
                    <NavItem eventKey={2} href="#">
                        Link
                    </NavItem>
                </Nav>
                <Nav pullRight>
                    <NavDropdown title="Account" id="account-nav-dropdown">
                        <AccountSettings logout={this.props.logout} />
                        <LogOut logout={this.props.logout} />
                    </NavDropdown>
                    <AppSettings logout={this.props.logout} />
                </Nav>
            </Navbar.Collapse>
            </Navbar>
        );
    }
}