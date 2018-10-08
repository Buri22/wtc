import React, {Component} from 'react';
import modulConfig from '../modulConfig.json';

export default class MenuItemRenderer extends Component {
    state = {
        modules: {}
    };

    componentDidMount () {
        // load the module from JSON config
        modulConfig.map (item => {
            if (this.props.position === item.menuItemPosition) {
                if (!this.state.modules[item.name]) {
                    import (`../${item.menuItemPath}`).then (module => {
                        this.state.modules[item.name] = module.default;       // this is little bit strange assignment and state update
                        this.setState ({modules: this.state.modules});
                    });
                }
            }
        });
    }
    render () {
        return (
            <React.Fragment>
                {Object.keys(this.state.modules).map(key => {
                    let ModuleMenuItem = this.state.modules[key];
                    return <ModuleMenuItem key={key} activeModule={this.props.activeModule} onMenuItemClick={this.props.onMenuItemClick}/>
                })}
            </React.Fragment>
        );
    }
}