import React, {Component} from 'react';
import {Col, FormGroup, FormControl, Button} from 'react-bootstrap';

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
    handleSubmit() {
        let data = {
            userName: this.state.userName,
            email: this.state.email,
            password: this.state.password,
            passwordConfirm: this.state.passwordConfirm
        };
        //let loginAttempt = user.logIn(data);
        let registerAttempt = { msg: `email: ${data.email}, password: ${data.password}` };

        if (registerAttempt.successful) {
            this.props.isUserLogged = true;
        }
        else if (registerAttempt.msg) {
            // update result action message
            this.setState({ errorMessage: registerAttempt.msg });
        }
    }
    handleLoginClick() {
        let { goToLogin } = this.props;

        goToLogin();
    }

    render(){
        return(
            <Col lg={4} lgOffset={4}>
                <h2 className="text-center">Sign up</h2>

                {/*TODO: implement result action messages*/}
                <span id="register_msg">{this.state.errorMessage}</span>

                <form onSubmit={this.handleSubmit.bind(this)}>
                    <FormGroup controlId="userName">
                        <FormControl
                            type="text"
                            name="userName"
                            placeholder="User name"
                            value={this.state.userName}
                            onChange={this.handleUserInput.bind(this)}
                            autoComplete="username"
                        /> 
                    </FormGroup>

                    <FormGroup controlId="emailReg">
                        <FormControl
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={this.state.email}
                            onChange={this.handleUserInput.bind(this)}
                            autoComplete="email"
                        /> 
                    </FormGroup>

                    <FormGroup controlId="passwordReg">
                        <FormControl
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={this.state.password}
                            onChange={this.handleUserInput.bind(this)}
                            autoComplete="new-password"
                        /> 
                    </FormGroup>

                    <FormGroup controlId="passwordRegConfirm">
                        <FormControl
                            type="password"
                            name="passwordConfirm"
                            placeholder="Confirm password"
                            value={this.state.passwordConfirm}
                            onChange={this.handleUserInput.bind(this)}
                            autoComplete="new-password"
                        /> 
                    </FormGroup>

                    <Button 
                        type="submit"
                        id="register"
                        bsStyle="primary"
                        bsSize="large"
                        block
                    >
                        Sign up
                    </Button>
                </form>

                <Button 
                    bsStyle="link"
                    onClick={this.handleLoginClick.bind(this)}
                >
                    <span className="glyphicon glyphicon-arrow-left"></span>
                    Login
                </Button>
            </Col>
        );
    };
}