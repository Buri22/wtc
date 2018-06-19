import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';

import StrengthMeter from './StrengthMeter';
import PasswordField from './PasswordField';

const SPECIAL_CHARS_REGEX = /[^A-Za-z0-9]/;
const DIGIT_REGEX = /[0-9]/;

export default class PasswordInput extends Component {
    constructor(props) {
        super(props);
        this.state = { password: '' };

        this.changePassword = this.changePassword.bind(this);
        this.satisfiedPercent = this.satisfiedPercent.bind(this);
    }

    changePassword(password) {
        this.setState({ password });
    }
    satisfiedPercent() {
        let { goodPasswordPrinciples } = this.props;
        let { password } = this.state;

        let satisfiedCount = goodPasswordPrinciples.map(p => p.predicate(password))
                                                    .reduce((count, satisfied) => 
                                                        count + (satisfied ? 1 : 0)
                                                    , 0);

        let principlesCount = goodPasswordPrinciples.length;

        return (satisfiedCount / principlesCount) * 100.0;
    }

    render() {
        let { goodPasswordPrinciples } = this.props;
        let { password } = this.state;

        return (
            <Grid>
                <Row>
                    <Col md={8}>
                        <PasswordField 
                            password={password}
                            onPasswordChange={this.changePassword}
                            satisfiedPercent={this.satisfiedPercent}
                        />
                    </Col>
                    <Col md={4}>
                        <StrengthMeter 
                            principles={goodPasswordPrinciples}
                            password={password}
                            satisfiedPercent={this.satisfiedPercent}
                        />
                    </Col>
                </Row>
            </Grid>
        );
    }
}

PasswordInput.defaultProps = {
    goodPasswordPrinciples: [
        {
            key: 0,
            label: '6+ characters',
            predicate: password => password.length >= 6
        },
        {
            key: 1,
            label: 'with at least one digit',
            predicate: password => password.match(DIGIT_REGEX) !== null
        },
        {
            key: 2,
            label: 'with at least one special character',
            predicate: password => password.match(SPECIAL_CHARS_REGEX) !== null
        }
    ]
}