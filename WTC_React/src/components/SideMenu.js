import React, {Component} from 'react';
import { SIDE_MENU_CONTAINER } from '../constants';
import modulConfig from '../modulConfig.json';
import Mediator from '../services/Mediator';

export default class SideMenu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modules: [],
            data: []
        };

        Mediator.subscribe('UpdateModuleItem', this.updateModuleItem.bind(this));
    }

    componentDidMount () {
        // load the module from JSON config
        modulConfig.map (item => {
            if (item.sideMenuItemPath && !this.state.modules[item.name]) {
                import (`../${item.sideMenuItemPath}`)
                    .then (module => {
                        this.state.modules[item.name] = module.default;
                        this.setState ({modules: this.state.modules});
                    });
            }
        });
    }

    updateModuleItem(moduleName, data) {
        let currentData = this.state.data;
        currentData[moduleName] = data;
        this.setState({
            data: currentData
        });
    }

    render(){
        return (
            <div 
                id={SIDE_MENU_CONTAINER} 
                className={this.props.position == 1 ? "left" : "right"}
            >
                {Object.keys(this.state.modules).map(moduleName => {
                    let ModuleSideMenuItem = this.state.modules[moduleName];
                    return <ModuleSideMenuItem 
                                key={moduleName} 
                                data={this.state.data[moduleName]}
                            />
                })}
            </div>
        );
    }
}