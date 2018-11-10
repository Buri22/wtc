import React, {Component} from 'react';
import {Row, Col, FormGroup, FormControl, Button} from 'react-bootstrap';
import UserService from '../../services/UserService';
import PasswordInput from '../passwordInput/PasswordInput';

// chybi popisek tridy
export default class RegisterForm extends Component {
    state = {
        userName: '',
        email: '',
        password: '',
        passwordConfirm: '',
        errorMessage: ''
    };

    handleUserInput (e) {
        this.setState({ [e.target.name]: e.target.value });
    }
    handleSubmit(e) {
        e.preventDefault();
        
        UserService.register({
                userName: this.state.userName,
                email: this.state.email,
                password: this.state.password,
                passwordConfirm: this.state.passwordConfirm
            })
            .then((response) => {
                if (response.success) {
                    // go to login page with success msg
                    this.props.onLoginClick(response.msg);
                }
                else if (response.msg) {
                    // update result action message
                    this.setState({ errorMessage: response.msg });
                }
            });

    }
    handleLoginClick() {
        this.props.onLoginClick();
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
                            required='required'
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
                            required='required'
                        />
                    </FormGroup>

                    <Row>
                        <PasswordInput
                            controlId='passwordReg'
                            passwordValue={this.state.password}
                            handlePasswordInput={this.handleUserInput.bind(this)}
                        />
                    </Row>

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
                            required='required'
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
                    <span> Login</span>
                </Button>
            </Col>
        );
    };
}