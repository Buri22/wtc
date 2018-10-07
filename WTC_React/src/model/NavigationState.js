// - pamatuje si globalni stav aplikace, historii
// - pole stavu dle nazvu modulu
// - k notifikovani a zmene stavu komponent pouzije mediator

// - import moduleConfig.json
// - load all modules with modulePath to array
// - then send the path to Page component to render it dynamicaly

import modulConfig from '../modulConfig.json';
import Page from '../components/Page';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

export default class NavigationState extends Component {
    constructor(props) {
        super(props);
        this.pageContainer = document.getElementById('PageContent');
    }
    render() {
        return ReactDOM.createPortal(this.props.children, this.pageContainer);
    }
}

// class NavigationState {
//     constructor() {
//         this.activeModule = null;
//         this.modules = [];
//         this.stateHistory = []; // do we really need this?

//     }

//     _loadModules() {
//         // load the modules from JSON config
//         modulConfig.map (item => {
//             if (item.modulePath) {
//                 this.modules[item.name] = item.modulePath;
//             }
//         });
//     }

//     renderModule(moduleName) {
//         console.log('NavigationState saves the active module and calls Page to render module.');
//         this.activeModule = moduleName;
//         this.stateHistory.push(moduleName); // do we really need this?
//         // call the module to render itself
//         Page.renderModule(moduleName);
//     }
// }

// let navigator = new NavigationState();

// const navigatorProxy = {
//     renderModule: navigator.renderModule.bind(navigator)
// };

// export default navigatorProxy;