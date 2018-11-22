import {Component} from 'react';
import ReactDOM from 'react-dom';
//import { SIDE_MENU_CONTAINER } from '../constants';

export default class PortalRenderer extends Component {
    constructor(props) {
        super(props);
        this.pageContainer = document.getElementById(this.props.container);
    }
    render() {
        return ReactDOM.createPortal(this.props.children, this.pageContainer);
    }
}