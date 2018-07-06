import React, {Component} from 'react';
import {Col} from 'react-bootstrap';

import StrengthMeter from './StrengthMeter';
import PasswordField from './PasswordField';

const SPECIAL_CHARS_REGEX = /[^A-Za-z0-9]/;
const DIGIT_REGEX = /[0-9]/;

export default class PasswordInput extends Component {
    state = { password: '' };

    static defaultProps = {
        goodPasswordPrinciples: [
            {
                key: 0,
                label: '6+ characters',
                predicate: password => password.length >= 6
            },
            {
                key: 1,
                label: 'at least one digit',
                predicate: password => password.match(DIGIT_REGEX) !== null
            },
            {
                key: 2,
                label: 'at least one special character',
                predicate: password => password.match(SPECIAL_CHARS_REGEX) !== null
            }
        ]
    }

    changePassword(password) {
        this.props.handlePasswordInput(password);
    }

    render() {
        let { goodPasswordPrinciples } = this.props;
        let { passwordValue } = this.props;

        return (
            <React.Fragment>
                <Col lg={12}>
                    <StrengthMeter 
                        principles={goodPasswordPrinciples}
                        password={passwordValue}
                    />
                </Col>
                <Col lg={12}>
                    <PasswordField
                        controlId={this.props.controlId}
                        principles={goodPasswordPrinciples}
                        password={passwordValue}
                        onPasswordChange={this.changePassword.bind(this)}
                    />
                </Col>
            </React.Fragment>
        );
    }
}