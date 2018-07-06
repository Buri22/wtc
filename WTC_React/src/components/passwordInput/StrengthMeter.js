import React, {Component} from 'react';
import {Panel, ProgressBar} from 'react-bootstrap';

import classNames from 'classnames';
import { SharedLogic } from './SharedLogic';

class StrengthMeter extends Component {
    render() {
        return (
            <Panel>
                <PrinciplesProgress {...this.props}/>
                <h5 className="text-center">A good password has:</h5>
                <PrincipleList {...this.props}/>
            </Panel>
        );
    }
}
export default SharedLogic(StrengthMeter);

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

        return <ul>
                {principles.map(principle => 
                    <li key={principle.key} className={this.principleClass(principle)}>
                        <small>
                            {principle.label}
                        </small>
                    </li>
                    )
                }
                </ul>;
    }
}

class PrinciplesProgress extends Component {
    render() {
        return <ProgressBar 
                    now={this.props.satisfiedPercent()} 
                    bsStyle={this.props.progressInputColor()}
                />;
    }
}