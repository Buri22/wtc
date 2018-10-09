import React, {Component} from 'react';
import {NavItem} from 'react-bootstrap';
import ModuleContentRenderer from '../../services/ModuleContentRenderer';
import Statistics from './Statistics';

export default class StatisticsMenuItem extends Component {
    constructor() {
        super();
        this.isActive;
    }

    handleMenuItemClick() {
        this.props.onMenuItemClick('Statistics');
    }

    render() {
        this.isActive = false;
        let moduleContent;
        
        if (this.props.activeModule == 'Statistics') {
            this.isActive = true;
            moduleContent = <ModuleContentRenderer>
                                <Statistics />
                            </ModuleContentRenderer>;
        }

        return (
            <React.Fragment>
                <NavItem 
                    active={this.isActive}
                    onClick={this.handleMenuItemClick.bind(this)}
                >
                    Statistics
                </NavItem>
                {moduleContent}
            </React.Fragment>
        );
    }
}