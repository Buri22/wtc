import React, {Component} from 'react';
import {NavItem} from 'react-bootstrap';
import Navigator from '../../model/NavigationState';
import Counter from './Counter';

export default class CounterMenuItem extends Component {

    handleMenuItemClick() {
        this.props.onMenuItemClick('Counter');
    }

    render() {
        let moduleContent;
        
        if (this.props.activeModule == 'Counter') {
            moduleContent = <Navigator>
                <Counter />
            </Navigator>;
        }

        return (
            <React.Fragment>
                <NavItem 
                    onClick={this.handleMenuItemClick.bind(this)}
                >
                Counter
                </NavItem>
                {moduleContent}
            </React.Fragment>
        );
    }
}