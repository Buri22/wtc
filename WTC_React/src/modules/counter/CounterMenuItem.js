import React, {Component} from 'react';
import {NavItem} from 'react-bootstrap';

export default class CounterMenuItem extends Component {
    render() {
        return <NavItem eventKey={1}>Counter</NavItem>;
    }
}