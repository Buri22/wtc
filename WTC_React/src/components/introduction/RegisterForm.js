import React, {Component} from 'react';
import {Col, FormGroup, FormControl, Button} from 'react-bootstrap';
import {user} from '../../model/user';
import PasswordInput from '../passwordInput/PasswordInput';

export default class RegisterForm extends Component {
    state = {
        userName: '',
        email: '',
        password: '',
        passwordConfirm: '',
        errorMessage: ''
    };

    handleUserInput (e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ [name]: value });
    }
    handlePasswordInput(password) {
        this.setState({ password: password });
    }
    handleSubmit(e) {
        e.preventDefault();

        let data = {
            userName: this.state.userName,
            email: this.state.email,
            password: this.state.password,
            passwordConfirm: this.state.passwordConfirm
        };
        
        user.register(data)
            .then((response) => {
                if (response.success) {
                    // go to login page with success msg
                    this.props.goToLogin(response.msg);
                }
                else if (response.msg) {
                    // update result action message
                    this.setState({ errorMessage: response.msg });
                }
            });

    }
    handleLoginClick() {
        this.props.goToLogin();
    }
    validatePasswordConfirm() {
        if (this.state.passwordConfirm.length === 0) return null;
        if (this.state.password === this.state.passwordConfirm) return 'success';
        return 'error';
    }

    render(){
        return(
            <Col lg={4} lgOffset={4}>
                <h2 className='text-center'>Sign up</h2>

                {/*TODO: implement result action messages*/}
                <span id='register_msg'>{this.state.errorMessage}</span>

                <form onSubmit={this.handleSubmit.bind(this)}>
                    <FormGroup controlId='userName'>
                        <FormControl
                            type='text'
                            name='userName'
                            placeholder='User name'
                            value={this.state.userName}
                            onChange={this.handleUserInput.bind(this)}
                            autoComplete='username'
                        /> 
                    </FormGroup>

                    <FormGroup controlId='emailReg'>
                        <FormControl
                            type='email'
                            name='email'
                            placeholder='Email address'
                            value={this.state.email}
                            onChange={this.handleUserInput.bind(this)}
                            autoComplete='email'
                        />
                    </FormGroup>

                    <PasswordInput
                        controlId='passwordReg'
                        passwordValue={this.state.password}
                        handlePasswordInput={this.handlePasswordInput.bind(this)}
                    />

                    <FormGroup
                        validationState={this.validatePasswordConfirm()}
                        controlId='passwordRegConfirm'
                    >
                        <FormControl
                            type='password'
                            name='passwordConfirm'
                            placeholder='Confirm password'
                            value={this.state.passwordConfirm}
                            onChange={this.handleUserInput.bind(this)}
                            autoComplete='new-password'
                        />
                        <FormControl.Feedback />
                    </FormGroup>

                    <Button 
                        type='submit'
                        id='register'
                        bsStyle='primary'
                        bsSize='large'
                        block
                    >
                        Sign up
                    </Button>
                </form>

                <Button 
                    bsStyle='link'
                    onClick={this.handleLoginClick.bind(this)}
                >
                    <span className='glyphicon glyphicon-arrow-left'></span>
                    Login
                </Button>
            </Col>
        );
    };
}