import React, {Component} from 'react';
import {NavItem} from 'react-bootstrap';
import { PAGE_CONTAINER } from '../../constants';
import PortalRenderer from '../../services/PortalRenderer';
import Counter from './Counter';

// TODO: refactor menu items to extend some base menu item component with common functionality

export default class CounterMenuItem extends Component {
    constructor() {
        super();
        this.isActive;
    }

    handleMenuItemClick() {
        this.props.onMenuItemClick('Counter');
    }

    render() {
        this.isActive = false;
        let moduleContent;
        
        if (this.props.activeModule == 'Counter') {
            this.isActive = true;
            moduleContent = <PortalRenderer container={PAGE_CONTAINER}>
                                <Counter />
                            </PortalRenderer>;
        }

        return (
            <React.Fragment>
                <NavItem 
                    active={this.isActive}
                    onClick={this.handleMenuItemClick.bind(this)}
                >
                    Counter
                </NavItem>
                {moduleContent}
            </React.Fragment>
        );
    }
}