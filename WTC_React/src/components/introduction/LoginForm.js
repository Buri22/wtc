import React, {Component} from 'react';
import {Col, FormGroup, FormControl, Button} from 'react-bootstrap';
import {user} from '../../model/user';

export default class LoginForm extends Component {
    state = {
        email: '',
        password: '',
        errorMessage: ''
    };

    handleUserInput (e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ [name]: value });
    }
    handleSubmit() {
        let data = {
            email: this.state.email,
            password: this.state.password
        };
        
        user.logIn(data)
            .then((response) => {
                if (response.successful) {
                    this.props.isUserLogged = true;
                }
                else if (response.msg) {
                    // update result action message
                    this.setState({ errorMessage: response.msg });
                }
            });
        //let loginAttempt = { msg: `email: ${data.email}, password: ${data.password}` };
    }
    handleRegisterClick() {
        let { goToRegister } = this.props;

        goToRegister();
    }

    render(){
        return(
            <Col lg={4} lgOffset={4}>
                <h2 className="text-center">Login</h2>

                {/*TODO: implement result action messages*/}
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
                    <span className="glyphicon glyphicon-arrow-right"></span>
                    Sign up
                </Button>
                
                {/*TODO: create forgot password functionality*/}
            </Col>
        );
    };
}