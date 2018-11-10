import React, { Component } from 'react';
import { Modal, Button, Form, FormGroup, FormControl, ControlLabel, Col } from 'react-bootstrap';

import DateTimeHelper from '../../services/DateTimeHelper';
import taskList from '../../model/task';

// TODO: Implement Date picker and Time picker

export default class CreateTask extends Component {
    constructor (props) {
        super(props);

        this.state= {
            taskName:    '',
            spentTime:   '00:00:00',
            dateCreated: DateTimeHelper.getFormatedDate(),
            msg:         ''
        }

    }

    handleUserInput (e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ [name]: value });
    }
    handleSubmit(e) {
        e.preventDefault();

        //console.log('createTaskForm was submitted');
        taskList.createTask({
            new_name:         this.state.taskName,
            new_spent_time:   this.state.spentTime,
            new_date_created: this.state.dateCreated
        })
        .then((response) => {
            if (response.success || response.modalHide) {
                this.props.handleCloseModal(response.msg);
            }
            else if (response.logout) {
                // TODO: handle logout through context and pass msg to the component
                console.log('handle logout through context')
            }
            else if (response.msg) {
                this.setState({ msg: response.msg });
            }

            //this.setState({ msg: response.msg });
        });
    }

    createTaskEnabled() {
        return true;
    }

    render() {
        return (
            <Modal show={true} onHide={this.props.handleCloseModal}>

                <Modal.Header closeButton>
                    <Modal.Title>Create new task</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form
                        horizontal
                        id='createTaskForm'
                        onSubmit={this.handleSubmit.bind(this)}
                    >
                        <FormGroup controlId='taskName'>
                            <Col componentClass={ControlLabel} md={4}>Task Name</Col>
                            <Col md={6}>
                                <FormControl
                                    type='text'
                                    name='taskName'
                                    value={this.state.taskName}
                                    onChange={this.handleUserInput.bind(this)}
                                    placeholder='Activity name'
                                    required='required'
                                    autoFocus
                                />
                            </Col>
                        </FormGroup>
                        
                        <FormGroup controlId='spentTime'>
                            <Col componentClass={ControlLabel} md={4}>Spent Time</Col>
                            <Col md={6}>
                                <FormControl
                                    type='text'
                                    name='spentTime'
                                    value={this.state.spentTime}
                                    onChange={this.handleUserInput.bind(this)}
                                    placeholder='Allowed format is 00:00:00'
                                />
                            </Col>
                        </FormGroup>
                        
                        <FormGroup controlId='dateCreated'>
                            <Col componentClass={ControlLabel} md={4}>Date Created</Col>
                            <Col md={6}>
                                <FormControl
                                    type='text'
                                    name='dateCreated'
                                    value={this.state.dateCreated}
                                    onChange={this.handleUserInput.bind(this)}
                                    placeholder='Allowed format is...'
                                />
                            </Col>
                        </FormGroup>
                    </Form>
                    {this.state.msg && <span className='modalErrorMsg red'>{this.state.msg}</span>}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        onClick={this.props.handleCloseModal}
                        className='left'
                    >
                        Close
                    </Button>
                    <Button
                        bsStyle='primary'
                        type='submit'
                        form='createTaskForm'
                        disabled={!this.createTaskEnabled()}
                    >
                        Create
                    </Button>
                </Modal.Footer>

            </Modal>
        );
    };
}