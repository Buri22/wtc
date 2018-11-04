import {Component} from 'react';
import ReactDOM from 'react-dom';
import { MODAL_CONTAINER } from '../constants';

export default class ModalContentRenderer extends Component {
    constructor(props) {
        super(props);
        this.modalContainer = document.getElementById(MODAL_CONTAINER);
    }
    render() {
        return ReactDOM.createPortal(this.props.children, this.modalContainer);
    }
}