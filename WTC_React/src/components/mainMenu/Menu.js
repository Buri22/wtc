import React, {Component} from 'react';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';

import LogOut from './LogOut';
import AccountSettings from './AccountSettings';

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
                    <NavDropdown eventKey={3} title="Dropdown" id="basic-nav-dropdown">
                        <MenuItem eventKey={3.1}>Action</MenuItem>
                        <MenuItem eventKey={3.2}>Another action</MenuItem>
                        <MenuItem eventKey={3.3}>Something else here</MenuItem>
                        <MenuItem divider />
                        <MenuItem eventKey={3.4}>Separated link</MenuItem>
                    </NavDropdown>
                </Nav>
                <Nav pullRight>
                    <AccountSettings logout={this.props.logout} />
                    <LogOut logout={this.props.logout} />
                </Nav>
            </Navbar.Collapse>
            </Navbar>
        );
    }
}