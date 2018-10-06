import React, {Component} from 'react';
import modulConfig from '../modulConfig.json';

export default class MenuItemRenderer extends Component {
    state = {
        modules: []
    };

    componentDidMount () {
        // load the module from JSON config
        modulConfig.map (item => {
        if (this.props.position === item.menuItemPosition) {
            import (`../${item.menuItemPath}`).then (module => {
                this.state.modules.push (module.default);
                this.setState ({modules: this.state.modules});
            });
        }
        });
    }

    render () {
        return (
        <React.Fragment>
            {this.state.modules.map ((ModuleItem, index) => <ModuleItem key={index}/>)}
        </React.Fragment>
        );
    }
}