import React, {Component} from 'react';
import {Row, Col} from 'react-bootstrap';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default class Introduction extends Component {
    
    pages = {
        login: 1,
        register: 2
    };
    state = { page: this.pages.login };

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
                page = <LoginForm
                            isUserLogged={this.props.isUserLogged}
                            goToRegister={this.goToRegister.bind(this)}
                        />;
                break;
            case this.pages.register:
                page = <RegisterForm goToLogin={this.goToLogin.bind(this)} />;
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