import React, {Component} from 'react';
import {Col, FormGroup, FormControl, Button} from 'react-bootstrap';

export default class RegisterForm extends Component {
    constructor(props) {
        super(props);

        this.handleLoginClick = this.handleLoginClick.bind(this);
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
                {/* <span id="register_msg"></span> */}

                <FormGroup controlId="userName">
                    <FormControl type="text" placeholder="User name"/> 
                </FormGroup>

                <FormGroup controlId="emailReg">
                    <FormControl type="email" placeholder="Email address"/> 
                </FormGroup>

                <FormGroup controlId="passwordReg">
                    <FormControl type="password" placeholder="Password"/> 
                </FormGroup>

                <FormGroup controlId="passwordRegConfirm">
                    <FormControl type="password" placeholder="Confirm password"/> 
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

                <Button 
                    bsStyle="link"
                    onClick={this.handleLoginClick}
                >
                    <span className="glyphicon glyphicon-arrow-left"></span>
                    Login
                </Button>
            </Col>
        );
    };
}