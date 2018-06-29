import React, {Component} from 'react';
import {Panel, ProgressBar} from 'react-bootstrap';

import classNames from 'classnames';

export default class StrengthMeter extends Component {
    render() {
        return (
            <Panel>
                <PrinciplesProgress {...this.props}/>
                <h5>A good password is:</h5>
                <PrincipleList {...this.props}/>
            </Panel>
        );
    }
}

class PrincipleList extends Component {
    principleSatisfied(principle) {
        let { password } = this.props;

        return principle.predicate(password);
    }
    principleClass(principle) {
        let satisfied = this.principleSatisfied(principle);

        return classNames({
            ['text-success']: satisfied,
            ['text-danger']: !satisfied
        });
    }

    render() {
        let { principles } = this.props;

        return (
            <ul>
                {principles.map(principle => 
                <li key={principle.key} className={this.principleClass(principle)}>
                    <small>
                        {principle.label}
                    </small>
                </li>
                )}
            </ul>
        );
    }
}

class PrinciplesProgress extends Component {
    constructor(props) {
        super(props);
        this.satisfiedPercent = this.props.satisfiedPercent.bind(this);
    }
    
    progressColor() {
        let percentage = this.satisfiedPercent();

        return classNames({
            danger: (percentage < 33.4),
            success: (percentage >= 66.7),
            warning: (percentage >= 33.4 && percentage < 66.7)
        });
    }

    render() {
        return (<ProgressBar now={this.satisfiedPercent()} 
                            bsStyle={this.progressColor()}/>);
    }
}