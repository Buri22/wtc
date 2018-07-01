import React, {Component} from 'react';
import {Row, Col} from 'react-bootstrap';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default class Introduction extends Component {
    constructor(props) {
        super(props);

        this.pages = {
            login: 1,
            register: 2
        };
        this.state = { page: this.pages.login };

        this.goToLogin = this.goToLogin.bind(this);
        this.goToRegister = this.goToRegister.bind(this);
    }

    goToLogin() {
        this.setState({ page: this.pages.login });
    }
    goToRegister() {
        this.setState({ page: this.pages.register });
    }

    renderpage() {
        let page;

        switch (this.state.page) {
            case this.pages.login:
                page = <LoginForm goToRegister={this.goToRegister} />;
                break;
            case this.pages.register:
                page = <RegisterForm goToLogin={this.goToLogin} />;
                break;
            default:
                // do nothing
        }

        return page;
    }

    render(){
        return(
            <React.Fragment>
                <Row>
                    <Col lg={12}>
                        <h1 className="text-center">Work Time Counter</h1>
                    </Col>
                </Row>
                <Row>
                    {this.renderpage()}
                </Row>
            </React.Fragment>
        );
    };
}