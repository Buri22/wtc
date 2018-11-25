import React, { Component } from 'react';
import Loading from './components/loading/Loading';
import Menu from './components/mainMenu/Menu';
import Page from './components/Page';
import SideMenu from './components/SideMenu';
import Introduction from './components/introduction/Introduction';

import Mediator from './services/Mediator';
import User from './model/user';
import UserService from './services/UserService';
import { TaskList } from './model/task';
import { APP_CONTEXT, GLOBAL_MSG_CONTAINER } from './constants';

class App extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      loggedIn: null,
      msg: '',
      themeColor: APP_CONTEXT.themeColor,
      sideMenuIsActive: APP_CONTEXT.sideMenuIsActive,
      sideMenuPosition: APP_CONTEXT.sideMenuPosition
    };
  }

  componentDidMount() {
    UserService.isUserLoggedIn()
      .then((response) => {
        this.setAppSettings(response);
      });
  }
  setAppSettings(isLoggedIn) {
    let appSettings = null;
    if (isLoggedIn) {
      appSettings = User.getProp('appSettings');
    }
    this.setState({
      loggedIn: isLoggedIn,
      msg: '',
      themeColor: appSettings ? appSettings.theme.color : null,
      sideMenuIsActive: appSettings ? appSettings.sideMenu.active : null,
      sideMenuPosition: (appSettings && appSettings.sideMenu.active) ? appSettings.sideMenu.position : null
    });
  }

  loginSuccess() {
    this.setAppSettings(true);
  }
  logout(msg) {
    // Get confirmation from user that he wants to logout with ticking task, if some is ticking
    if (TaskList.getTaskActive()) {
      let confirmation = confirm('Do you really wont to log out with ticking task?');
      if (confirmation == false) return;
    }

    Mediator.publish('Logout');

    this.setState({
      loggedIn: false,
      msg: msg,
      themeColor: APP_CONTEXT.themeColor,
      sideMenuIsActive: APP_CONTEXT.sideMenuIsActive,
      sideMenuPosition: APP_CONTEXT.sideMenuPosition
    });
  }

  renderApp() {
    let appContent;

    if (this.state.loggedIn === null) {
      appContent = <Loading />;
    }
    else if (this.state.loggedIn) {
      appContent =
        <APP_CONTEXT.Provider value={this.state}>
          <Menu 
            logout={this.logout.bind(this)}
            onAppSettingsChange={this.setAppSettings.bind(this)}
          />
          <div id={GLOBAL_MSG_CONTAINER}></div>
          <Page compressed={this.state.sideMenuIsActive} />
          {this.state.sideMenuIsActive && 
            <SideMenu position={this.state.sideMenuPosition} />
          }
        </APP_CONTEXT.Provider>;
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
