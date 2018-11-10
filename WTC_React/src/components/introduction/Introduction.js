import React, {Component} from 'react';
import {Row, Col} from 'react-bootstrap';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

/**
 * Renders Login or Register page
 * TODO: finally it could have also some Into page about the WTC
 */
export default class Introduction extends Component {
    
    pages = {
        login: 1,
        register: 2
    };
    state = {
        page: this.pages.login,
        msg: this.props.msg || ''
    };

    onLoginClick(msg = '') {
        this.setState({ 
            page: this.pages.login,
            msg: msg
        });
    }
    onRegisterClick() {
        this.setState({ page: this.pages.register });
    }

    renderpage() {
        let page;

        switch (this.state.page) {
            case this.pages.login:
                page = <LoginForm
                            msg={this.state.msg}
                            onLoginSuccess={this.props.onLoginSuccess}
                            onRegisterClick={this.onRegisterClick.bind(this)}
                        />;
                break;
            case this.pages.register:
                page = <RegisterForm onLoginClick={this.onLoginClick.bind(this)} />;
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