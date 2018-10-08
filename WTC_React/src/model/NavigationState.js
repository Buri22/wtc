import {Component} from 'react';
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