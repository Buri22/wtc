import React, {Component} from 'react';
import {FormGroup, FormControl} from 'react-bootstrap';

import { SharedLogic } from './SharedLogic';

class PasswordField extends Component {
    static defaultProps = {
        password: ''
    }

    handlePasswordChange(ev) {
        let { onPasswordChange } = this.props;

        onPasswordChange(ev.target.value);
    }

    render() {
        let { password } = this.props;
        let validationStateColor = password.length > 0 ? this.props.progressInputColor('error') : null;

        return (
            <FormGroup
                validationState={validationStateColor}
                controlId={this.props.controlId}
            >
                <FormControl 
                    type='password'
                    name='password'
                    placeholder='Password'
                    value={password}
                    onChange={this.handlePasswordChange.bind(this)}
                    autoComplete='new-password'
                />
                <FormControl.Feedback />
            </FormGroup>
        );
    }
}

export default SharedLogic(PasswordField);


