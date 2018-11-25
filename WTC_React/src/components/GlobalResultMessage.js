import React from 'react';
import { Alert } from 'react-bootstrap';

import { GLOBAL_MSG_CONTAINER } from '../constants';
import PortalRenderer from '../services/PortalRenderer';

export default class ResultMessage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: true
        };
    }

    handleDismiss() {
        this.setState({ show: false });
    }

    render() {
        if (this.state.show) {
            return (
                <PortalRenderer container={GLOBAL_MSG_CONTAINER}>
                    <Alert 
                        bsStyle={this.props.bsStyle} 
                        onDismiss={this.handleDismiss.bind(this)}
                    >
                        <h4>{this.props.msg}</h4>
                    </Alert>
                </PortalRenderer>
            );
        }
        return null;
    };
}