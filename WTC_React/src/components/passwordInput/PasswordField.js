import React, {Component} from 'react';
import {FormGroup, FormControl, ControlLabel} from 'react-bootstrap';

import classNames from 'classnames';

export default class PasswordField extends Component {
    constructor(props) {
        super(props);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }

    handlePasswordChange(ev) {
        let { onPasswordChange } = this.props;

        onPasswordChange(ev.target.value);
    }

    inputColor() {
        let { satisfiedPercent } = this.props;
        let percentage = satisfiedPercent();

        return classNames({
            error: (percentage < 33.4),
            success: (percentage >= 66.7),
            warning: (percentage >= 33.4 && percentage < 66.7)
        });
    }

    render() {
        let { password } = this.props;

        return (
            <FormGroup validationState={this.inputColor()}>
                <ControlLabel>Password</ControlLabel>
                <FormControl 
                    type='password'
                    value={password}
                    onChange={this.handlePasswordChange}
                />
                <FormControl.Feedback />
            </FormGroup>
        );
    }
}
