import React, { Component } from 'react';
import { Tabs, Tab, Button, Form, FormGroup, FormControl, ControlLabel, Col } from 'react-bootstrap';
import CustomModal from '../../components/CustomModal';
import CategorySelectBox from '../../components/CategorySelectBox';

import { TaskList } from '../../model/task';
import DateTimeHelper from '../../services/DateTimeHelper';
import TaskService from '../../services/TaskService';
import CategoryList from '../../model/category';

// TODO: Implement Date picker and Time picker

export default class EditDeleteTask extends Component {
    constructor (props) {
        super(props);

        this.originalTask = TaskList.getTaskById(this.props.taskId);
        this.editFormSubmitBtn = <Button
                bsStyle='primary'
                type='submit'
                form='editTaskForm'
            >
                Edit
            </Button>;
        this.deleteFormSubmitBtn = <Button
                bsStyle='primary'
                type='submit'
                form='deleteTaskForm'
            >
                Delete
            </Button>;

        this.state= {
            tabKey:         1,
            modalTitle:     'Edit task',
            modalSubmitBtn: this.editFormSubmitBtn,
            taskName:       this.originalTask.name,
            spentTime:      this.originalTask.spentTimeInHms(),
            dateCreated:    DateTimeHelper.getFormatedDate(this.originalTask.dateCreated),
            categoryId:     this.originalTask.categoryId,
            password:       '',
            msg:            ''
        }

    }

    handleTabSelect(key) {
        this.setState({ 
            tabKey: key,
            modalSubmitBtn: key == 1 ? this.editFormSubmitBtn : this.deleteFormSubmitBtn,
            modalTitle: key == 1 ? 'Edit task' : 'Delete task'
        });
    }

    handleUserInput(e) {
        this.setState({ [e.target.name]: e.target.value });
    }
    handleCategoryIdChange(e) {
        this.setState({ categoryId: e.target.value == "" ? null : e.target.value })
    }
    handleSubmit(e) {
        e.preventDefault();

        if (e.target.id.indexOf('edit') > -1) {
            TaskService.editTask({
                item_id:          this.originalTask.id,
                new_name:         this.state.taskName,
                new_spent_time:   this.state.spentTime,
                new_date_created: this.state.dateCreated,
                new_category_id:  this.state.categoryId
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
            });
        }
        else if (e.target.id.indexOf('delete') > -1) {
            TaskService.deleteTask({
                task_id: this.originalTask.id,
                password: this.state.password
            })
            .then((response) => {
                if (response.success || response.modalHide) {
                    this.props.handleCloseModal(response.msg);
                }
                else if (response.msg) {
                    this.setState({ msg: response.msg });
                }
            });
        }
        else {
            console.log('some undexpected element submitted form: ', e.target);
        }
    }

    render() {
        return (
            <CustomModal
                title={this.state.modalTitle}
                submitBtn={this.state.modalSubmitBtn}
                handleCloseModal={this.props.handleCloseModal}
            >
                <Tabs
                    activeKey={this.state.tabKey}
                    onSelect={this.handleTabSelect.bind(this)}
                    animation={false}
                    id="edit_delete_tabs"
                >

                    <Tab eventKey={1} title="Edit">
                        <Form
                            horizontal
                            id='editTaskForm'
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
                                        placeholder='Allowed format is HH:mm:ss'
                                        required='required'
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
                                        placeholder='Allowed format is dd.MM.yyyy'
                                        required='required'
                                    />
                                </Col>
                            </FormGroup>

                            <FormGroup controlId='taskCategory'>
                                <Col componentClass={ControlLabel} md={4}>Task Category</Col>
                                <Col md={6}>
                                    <CategorySelectBox 
                                        initialValue={this.state.categoryId}
                                        optionCategories={CategoryList.getCategoryList()}
                                        handleCategoryParentIdChange={this.handleCategoryIdChange.bind(this)}
                                    />
                                </Col>
                            </FormGroup>

                        </Form>
                    </Tab>

                    <Tab eventKey={2} title="Delete">
                        <span className="info">If you really want to delete task: <strong>{this.originalTask.name}</strong>, enter password.</span>
                        <Form
                            horizontal
                            id='deleteTaskForm'
                            onSubmit={this.handleSubmit.bind(this)}
                        >                            
                            <FormGroup controlId="password">
                                <Col componentClass={ControlLabel} md={4}>Confirm password</Col>
                                <Col md={6}>
                                    <FormControl
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={this.state.password}
                                        onChange={this.handleUserInput.bind(this)}
                                        required="required"
                                    />
                                </Col>
                            </FormGroup>
                        </Form>
                    </Tab>

                </Tabs>

                {this.state.msg && <span className='modalErrorMsg red'>{this.state.msg}</span>}

            </CustomModal>
        );
    };
}