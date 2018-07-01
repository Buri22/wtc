import React, {Component} from 'react';
import gif from '../../img/loading.gif';

export default class Loading extends Component {
    render() {
        return(
            <div>
                <img src={gif} alt="Loading..."/>
            </div>
        );
    }
}