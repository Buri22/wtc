import React, {Component} from 'react';
import {NavItem} from 'react-bootstrap';
import Navigator from '../../model/NavigationState';
import Statistics from './Statistics';

export default class StatisticsMenuItem extends Component {

    handleMenuItemClick() {
        this.props.onMenuItemClick('Statistics');
    }

    render() {
        let moduleContent;
        
        if (this.props.currentAppState.activeModule == 'Statistics') {
            moduleContent = <Navigator>
                <Statistics />
            </Navigator>;
        }

        return (
            <React.Fragment>
                <NavItem 
                    onClick={this.handleMenuItemClick.bind(this)}
                >
                Statistics
                </NavItem>
                {moduleContent}
            </React.Fragment>
        );
    }
}