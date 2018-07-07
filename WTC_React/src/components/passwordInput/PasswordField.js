import React, {Component} from 'react';
import {FormGroup, FormControl} from 'react-bootstrap';

import { SharedLogic } from './SharedLogic';

class PasswordField extends Component {
    static defaultProps = {
        password: ''
    }

    handlePasswordChange(evt) {
        this.props.onPasswordChange(evt);
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
                    name={this.props.name}
                    placeholder='Password'
                    value={password}
                    onChange={this.handlePasswordChange.bind(this)}
                    autoComplete='new-password'
                    required='required'
                />
                <FormControl.Feedback />
            </FormGroup>
        );
    }
}

export default SharedLogic(PasswordField);


