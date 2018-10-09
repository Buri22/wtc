import React, {Component} from 'react';
import {Row, Col, Button, ListGroup, ListGroupItem} from 'react-bootstrap';

import Loading from '../../components/loading/Loading';
import taskList from '../../model/task';

export default class Counter extends Component {

    constructor() {
        super();

        this.state = {
            taskListDataLoaded: false
        };
    }

    componentDidMount() {
        if (taskList.getTasklist() == undefined) {
            taskList.loadTaskList().then(result => {
                if (result.success) {
                    this.setState({ taskListDataLoaded: true });
                }
            });
        }
        else {
            this.setState({ taskListDataLoaded: true });
        }
    }

    renderTaskList() {
        let tasks;
        if (this.state.taskListDataLoaded) {
            let taskListData = taskList.getTasklist();
            tasks = taskListData.map((listItemData, index) => (
                <ListGroupItem key={index}>
                    <span className="taskIndex">{index}.</span>
                    <span className="name">{listItemData.name}</span>
                    <span className="spentTime">{listItemData.spentTime}</span>
                    <Button className="start" bsStyle="success">Start</Button>
                    <Button className="stop" bsStyle="primary">Stop</Button>
                    <span className="edit_animation_box"></span>
                </ListGroupItem>
            ));
        } else {
            tasks = <Loading />;
        }
        return (
            <ListGroup>
                <ListGroupItem className="header">
                    <span className="taskIndex">No.</span>
                    <span className="name">Name</span>
                    <span className="spentTime">Spent time</span>
                </ListGroupItem>
                {tasks}
            </ListGroup>
        );
    }

    render(){
        return (
            <Row>
                <h2 className="text-center">Tasks</h2>

                <Button 
                    bsStyle="success"
                    bsSize="large"
                    id="newTaskBtn"
                >
                    Create
                </Button>

                <Col sm={12} md={8} mdOffset={2} className="taskList">
                    <div className="paginationBox"></div>
                    {this.renderTaskList()}
                </Col>

            </Row>
        );
    }
}