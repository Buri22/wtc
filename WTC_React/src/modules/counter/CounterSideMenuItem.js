import React, {Component} from 'react';
import {Button} from 'react-bootstrap';

export default class CounterSideMenuItem extends Component {

    onStopBtnClick(e) {
        let id = e.currentTarget.parentElement.dataset.id;
        this.props.data.onStopBtnClick(id);
    }

    render() {
        let result = '';
        if (this.props.data) {
            // Render sideMenuItem just when we have data available
            result = 
                <div id="counter_side_menu_active_item"
                    data-id={this.props.data.task.id}
                >
                    <span className="name">{this.props.data.taskIndex}. {this.props.data.task.name}</span>
                    <span className="spent_time">{this.props.data.task.spentTimeInHms()}</span>

                    <Button
                        bsStyle="primary"
                        bsSize="large"
                        className="stop"
                        onClick={this.onStopBtnClick.bind(this)}
                    >
                        Stop
                    </Button>
                </div>
            ;
        }
        return result;
    }
}