import React, {Component} from 'react';
import {Col, FormGroup, FormControl, Button} from 'react-bootstrap';
import UserService from '../../services/UserService';

export default class LoginForm extends Component {
    state = {
        email: '',
        password: '',
        errorMessage: this.props.msg
    };

    handleUserInput (e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ [name]: value });
    }
    handleSubmit(e) {
        e.preventDefault();
        
        UserService.logIn({
                email: this.state.email,
                password: this.state.password
            })
            .then((response) => {
                if (response.success) {
                    this.props.onLoginSuccess();
                }
                else if (response.msg) {
                    // update submit result message
                    this.setState({ errorMessage: response.msg });
                }
            });
    }
    handleRegisterClick() {
        this.props.onRegisterClick();
    }

    render(){
        return(
            <Col lg={4} lgOffset={4}>
                <h2 className="text-center">Login</h2>

                <span id="login_msg">{this.state.errorMessage}</span>

                <form onSubmit={this.handleSubmit.bind(this)}>
                    <FormGroup controlId="emailLogin">
                        <FormControl
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={this.state.email}
                            onChange={this.handleUserInput.bind(this)}
                            autoComplete="email"
                            required="required"
                        />
                    </FormGroup>

                    <FormGroup controlId="passwordLogin">
                        <FormControl
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={this.state.password}
                            onChange={this.handleUserInput.bind(this)}
                            autoComplete="current-password"
                            required="required"
                        />
                    </FormGroup>

                    <Button 
                        type="submit"
                        id="login"
                        bsStyle="primary"
                        bsSize="large"
                        block
                    >
                        Login
                    </Button>
                </form>

                <Button 
                    bsStyle="link"
                    className="right"
                    onClick={this.handleRegisterClick.bind(this)}
                >
                    <span>Sign up  </span>
                    <span className="glyphicon glyphicon-arrow-right"></span>
                </Button>
                
                {/*TODO: create forgot password functionality*/}
            </Col>
        );
    };
}