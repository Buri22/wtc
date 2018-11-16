import React, { Component } from 'react';
import Loading from './components/loading/Loading';
import Menu from './components/mainMenu/Menu';
import Page from './components/Page';
import Introduction from './components/introduction/Introduction';

import Mediator from './services/Mediator';
import UserService from './services/UserService';
import { TaskList } from './model/task';

class App extends Component {

  state = {
    loggedIn: null,
    msg: ''
  };

  componentDidMount() {
    UserService.isUserLoggedIn()
      .then((response) => {
        this.setState({ loggedIn: response });
      });
  }

  loginSuccess() {
    this.setState({ loggedIn: true });
  }
  logout(msg) {
    // Get confirmation from user that he wants to logout with ticking task, if some is ticking
    if (TaskList.getTaskActive()) {
      let confirmation = confirm('Do you really wont to log out with ticking task?');
      if (confirmation == false) return;
    }

    Mediator.publish('logout');

    this.setState({
      loggedIn: false,
      msg: msg
    });
  }

  renderApp() {
    let appContent;

    if (this.state.loggedIn === null) {
      appContent = <Loading />;
    }
    else if (this.state.loggedIn) {
      appContent =
        <React.Fragment>
          <Menu logout={this.logout.bind(this)} />
          <Page />
        </React.Fragment>;
    }
    else {
      appContent = 
        <Introduction
          onLoginSuccess={this.loginSuccess.bind(this)}
          msg={this.state.msg}
        />;
    }

    return appContent;
  }

  render() {
    return (
      this.renderApp()
    );
  }
}

export default App;
