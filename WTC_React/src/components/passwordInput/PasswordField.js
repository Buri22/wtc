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

        return (
            <FormGroup validationState={this.props.progressInputColor('error')}>
                <FormControl 
                    type='password'
                    name='password'
                    placeholder='Password'
                    value={password}
                    onChange={this.handlePasswordChange.bind(this)}
                    autoComplete="new-password"
                />
                <FormControl.Feedback />
            </FormGroup>
        );
    }
}

export default SharedLogic(PasswordField);


