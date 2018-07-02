import React, {Component} from 'react';
import gif from '../../img/loading.gif';

export default class Loading extends Component {
    render() {
        return(
            <div className="text-center">
                <img src={gif} alt="Loading..."/>
            </div>
        );
    }
}