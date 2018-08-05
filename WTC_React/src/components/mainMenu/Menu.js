import React, {Component} from 'react';
import {Navbar, Nav, NavItem} from 'react-bootstrap';
import modulConfig from '../../modulConfig.json';
import AppSettings from './AppSettings';

class ModuleRenderer extends Component {
  state = {
    module: null,
    moduleLoaded: false,
  };

  constructor () {
    super ();
    this.modules = [];
  }

  componentDidMount () {
    // load the module from JSON config
    modulConfig.map (item => {
      if (this.props.position === item.menuItemPosition) {
        let existing = this.modules[item.name];

        if (existing) {
          // load existing module
          this.setState ({
            moduleLoaded: true,
            module: this.state.modules[item.name],
          });
        } else {
          // load new module
          this.setState ({moduleLoaded: false});
          import (`../../${item.menuItemPath}`).then (module => {
            this.modules[item.name] = module.default;
            this.setState ({moduleLoaded: true, module: module.default});
          });
        }
      }
    });
  }

  render () {
    if (this.state.moduleLoaded) {
      const WTCModule = this.state.module;
      return <WTCModule />;
    } else {
      return <div>Loading module</div>;
    }
  }
}

export default class Menu extends Component {
  state = {
    activeKey: 1,
  };

  handleSelect (selectedKey) {
    this.setState ({activeKey: selectedKey});
  }

  render () {
    return (
      <Navbar fluid collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#brand">Work Time Counter</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav
            activeKey={this.state.activeKey}
            onSelect={this.handleSelect.bind (this)}
          >
            <NavItem eventKey={1} href="#">
              Link
            </NavItem>
            <NavItem eventKey={2} href="#">
              Link
            </NavItem>
          </Nav>
          <Nav pullRight>
            <ModuleRenderer position="right" />
            {/* <NavDropdown title="Account" id="account-nav-dropdown">
                        <AccountSettings logout={this.props.logout} />
                        <LogOut logout={this.props.logout} />
                    </NavDropdown> */}
            <AppSettings logout={this.props.logout} />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
