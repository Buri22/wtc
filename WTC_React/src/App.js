import React, {Component} from 'react';
import {user} from './model/user';

import Loading from './components/loading/Loading';
import Menu from './components/Menu';
import Page from './components/Page';
import Introduction from './components/introduction/Introduction';

//import {Button, Grid, Row, Col, ButtonToolbar, Table} from 'react-bootstrap';

// testing components
//import PasswordInput from './components/passwordInput/PasswordInput';
//import Header from './components/changableHeader/Header'

class App extends Component {
  
  state = { loggedIn: null };

  componentDidMount() {
    this.setState({ loggedIn: user.isUserLoggedIn() });
  }

  renderApp() {
    let appContent;

    if (this.state.loggedIn === null) {
      appContent = <Loading />;
    }
    else if (this.state.loggedIn) {
      appContent = 
        <React.Fragment>
          <Menu />
          <Page />
        </React.Fragment>;
    }
    else {
      appContent = <Introduction />;
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
