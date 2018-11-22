import React, {Component} from 'react';
import { PAGE_CONTAINER } from '../constants';

export default class Page extends Component {
    render(){
        return <div id={PAGE_CONTAINER} className={this.props.compressed ? "compressed" : '' }></div>;
    }
}