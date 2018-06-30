import React, {Component} from 'react';
import {Col, FormGroup, FormControl, Button} from 'react-bootstrap';

export default class LoginForm extends Component {
    constructor(props) {
        super(props);

        this.handleRegisterClick = this.handleRegisterClick.bind(this);
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
                {/* <span id="login_msg"></span> */}

                <FormGroup controlId="emailLogin">
                    <FormControl type="email" placeholder="Email address"/> 
                </FormGroup>

                <FormGroup controlId="passwordLogin">
                    <FormControl type="password" placeholder="Password"/> 
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

                <Button 
                    bsStyle="link"
                    className="right"
                    onClick={this.handleRegisterClick}
                >
                    <span className="glyphicon glyphicon-arrow-right"></span>
                    Register
                </Button>
                
                {/*TODO: create forgot password functionality*/}
            </Col>
        );
    };
}