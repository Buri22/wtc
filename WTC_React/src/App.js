import React, {Component} from 'react';

import Menu from './components/Menu';
import Page from './components/Page';
import LoginRegister from './components/account/LoginRegister';

//import {Button, Grid, Row, Col, ButtonToolbar, Table} from 'react-bootstrap';

// testing components
//import PasswordInput from './components/passwordInput/PasswordInput';
//import Header from './components/changableHeader/Header'

class App extends Component {
  constructor() {
    super();

    this.state = { loggedIn: false };
  }

  renderApp() {
    let appContent;

    if (this.state.loggedIn) {
      appContent = 
        <React.Fragment>
          <Menu />
          <Page />
        </React.Fragment>;
    }
    else {
      appContent = <LoginRegister />;
    }

    return appContent;
  }

  render () {
    return (
      this.renderApp()
    );
  }
}

export default App;
