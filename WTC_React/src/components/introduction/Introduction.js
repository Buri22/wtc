import React, {Component} from 'react';
import {Row, Col} from 'react-bootstrap';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

// chybi popisek tridy
export default class Introduction extends Component {
    
    pages = {
        login: 1,
        register: 2
    };
    state = {
        page: this.pages.login,
        msg: this.props.msg || ''
    };

    goToLogin(msg = '') {
        this.setState({ 
            page: this.pages.login,
            msg: msg
        });
    }
    goToRegister() {
        this.setState({ page: this.pages.register });
    }

    renderpage() {
        let page;

        switch (this.state.page) {
            case this.pages.login:
            // tady bych mozna zmenil naming - gotoRegister je prikaz, zatimco do properties se vetsinou davaji callbacky a handlery
            // jako naming by se hodil napr. onRegisterClick nebo registerNavigationHandler
                page = <LoginForm
                            msg={this.state.msg}
                            handleLogin={this.props.handleLogin}
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