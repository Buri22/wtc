import {Component} from 'react';
import ReactDOM from 'react-dom';
import { PAGE_CONTAINER } from '../constants';

export default class ModuleContentRenderer extends Component {
    constructor(props) {
        super(props);
        this.pageContainer = document.getElementById(PAGE_CONTAINER);
    }
    render() {
        return ReactDOM.createPortal(this.props.children, this.pageContainer);
    }
}