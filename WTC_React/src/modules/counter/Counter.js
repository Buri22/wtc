import React, {Component} from 'react';
import { Col, Button, ListGroup, ListGroupItem} from 'react-bootstrap';

import PortalRenderer from '../../services/PortalRenderer';
import PaginationBox from '../../components/PaginationBox';
import Loading from '../../components/Loading';
import CreateTask from './CreateTask';
import EditDeleteTask from './EditDeleteTask';
//import ResultMsg from '../../components/GlobalResultMessage';

import { TaskList } from '../../model/task';
import TaskService from '../../services/TaskService';
import TickingManager from './TickingManager';
import { MODAL_CONTAINER } from '../../constants';

export default class Counter extends Component {

    constructor() {
        super();

        this.state = {
            taskListDataLoaded: false,
            itemsPerPage:       20,
            currentPage:        1,
            msg:                '',
            tickingTime:        null,
            showModal:          false
        };
        this.modalContent = null;
    }

    componentWillMount() {
        TickingManager.switchRenderTicking(true, this.updateTaskSpentTime.bind(this), this.handleStopBtnResponse.bind(this));
        if (!TaskList.isLoaded()) {
            TaskService.loadTaskList().then(result => {
                if (result.success) {
                    this.setState({ taskListDataLoaded: true });
                    TickingManager.checkTickingItem();
                }
            });
        }
        else {
            this.setState({ taskListDataLoaded: true });
            TickingManager.checkTickingItem();
        }
    }
    componentWillUnmount() {
        TickingManager.switchRenderTicking(false);
    }

    updateTaskSpentTime(task) {
        this.setState({ tickingTime: task.spentTime });
    }
    handleStartBtn(e) {
        let listItem = e.currentTarget.parentElement;
        TickingManager.startTicking(Number(listItem.dataset.id))
            .then(response => {
                if (response.success) {
                    // make item active highlighted
                    listItem.classList.add("active");
                }
                this.setState({ msg: response.msg });
            });
    }
    handleStopBtn(e) {
        let listItem = e.currentTarget.parentElement;
        TickingManager.stopTicking(Number(listItem.dataset.id));
    }
    handleStopBtnResponse(response) {
        this.setState({
            msg: response.msg,
            tickingTime: response.success ? null : this.state.tickingTime
        });
    };
    handleCreateBtn() {
        this.modalContent = <CreateTask handleCloseModal={this.handleCloseModal.bind(this)} />;
        this.setState({ showModal: true });
    }
    handleTaskClick(e) {
        // Continue just if user did not clicked on Start/Stop Button
        if (e.target.type !== "button") {
            this.modalContent = <EditDeleteTask 
                    handleCloseModal={this.handleCloseModal.bind(this)} 
                    taskId={e.currentTarget.dataset.id}
                />;
            this.setState({ showModal: true });
        }
    }
    handleCloseModal(msg = '') {
        this.setState({ 
            showModal: false,
            msg: typeof msg === "string" ? msg : ''
        });
    }

    renderTaskList() {
        if (this.state.taskListDataLoaded) {
            // Render task list just in case user has at least one task
            if (TaskList.getLength() > 0) {
                let taskListData = TaskList.getTasklist(),
                indexFrom = (this.state.currentPage - 1) * this.state.itemsPerPage,
                indexTo = this.state.currentPage * this.state.itemsPerPage;

                let tasks = taskListData.map((taskData, index) => {
                    if (indexFrom <= index && index < indexTo) {
                        return (
                            <ListGroupItem
                                key={index}
                                data-id={taskData.id}
                                className={taskData.taskStarted == 1 ? 'active': ''}
                                onClickCapture={this.handleTaskClick.bind(this)}
                            >
                                <span className="taskIndex">{index + 1}.</span>
                                <span className="name">{taskData.name}</span>{/* TODO: handle too long task names */}
                                <span className="spentTime">{taskData.spentTimeInHms()}</span>
                                {TickingManager.isTicking() ?
                                    <Button className="start" bsStyle="success" disabled>Start</Button>
                                    : <Button className="start" bsStyle="success" onClick={this.handleStartBtn.bind(this)}>Start</Button>
                                }
                                <Button className="stop" bsStyle="primary" onClick={this.handleStopBtn.bind(this)}>Stop</Button>
                            </ListGroupItem>
                        )
                    }
                });
                return (
                    <ListGroup id="taskList">
                        <ListGroupItem className="header">
                            <span className="taskIndex">No.</span>
                            <span className="name">Name</span>
                            <span className="spentTime">Spent time</span>
                        </ListGroupItem>
                        {tasks}
                    </ListGroup>
                );
            }
            else {
                return <span className="centered_flex">You have no tasks yet, can create one by clicking on Create button.</span>;
            }
        } else {
            return <Loading />;
        }
    }

    changeItemsPerPage(itemsPerPage) {
        this.setState({itemsPerPage: itemsPerPage});
    }
    changeCurrentPage(currentPage) {
        this.setState({currentPage: currentPage});
    }
    renderPagination() {
        if (this.state.taskListDataLoaded && TaskList.getLength() > 20) {
            return <PaginationBox 
                        totalItems={TaskList.getLength()}
                        itemsPerPage={this.state.itemsPerPage}
                        currentPage={this.state.currentPage}
                        changeItemsPerPage={this.changeItemsPerPage.bind(this)}
                        changeCurrentPage={this.changeCurrentPage.bind(this)}
                    />;
        }
    }

    render(){
        return (
            <React.Fragment>
            <h2 className="text-center">Tasks</h2>

            {this.state.msg && <span className='result_msg centered_flex'>{this.state.msg}</span>}

            <Button 
                bsStyle="success"
                bsSize="large"
                id="newTaskBtn"
                onClick={this.handleCreateBtn.bind(this)}
            >
                Create
            </Button>

            <Col sm={12} md={8} mdOffset={2}>
                {this.renderPagination()}
                {this.renderTaskList()}
                {this.renderPagination()}
            </Col>

            {this.state.showModal && 
                <PortalRenderer container={MODAL_CONTAINER}>
                    {this.modalContent}
                </PortalRenderer>
            }

            </React.Fragment>
        );
    }
}