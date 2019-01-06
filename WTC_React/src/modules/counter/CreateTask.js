import React, { Component } from 'react';
import { Button, Form, FormGroup, FormControl, ControlLabel, Col } from 'react-bootstrap';
import CustomModal from '../../components/CustomModal';
import CategorySelectBox from '../../components/CategorySelectBox';

import DateTimeHelper from '../../services/DateTimeHelper';
import TaskService from '../../services/TaskService';
import CategoryList from '../../model/category';

// TODO: Implement Date picker and Time picker

export default class CreateTask extends Component {
    constructor (props) {
        super(props);

        this.modalTitle = 'Create new task';
        this.modalSubmitBtn = <Button
                bsStyle='primary'
                type='submit'
                form='createTaskForm'
            >
                Create
            </Button>;

        this.state= {
            taskName:    '',
            spentTime:   '00:00:00',
            dateCreated: DateTimeHelper.getFormatedDate(),
            categoryId: '',
            msg:         ''
        }

    }

    handleUserInput (e) {
        this.setState({ [e.target.name]: e.target.value });
    }
    handleCategoryIdChange(e) {
        this.setState({ categoryId: e.target.value == "" ? null : e.target.value })
    }
    handleSubmit(e) {
        e.preventDefault();

        TaskService.createTask({
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

    render() {
        return (
            <CustomModal
                title={this.modalTitle}
                submitBtn={this.modalSubmitBtn}
                handleCloseModal={this.props.handleCloseModal}
            >
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
                                placeholder='Allowed format is...'
                                required='required'
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId='dateCreated'>
                        <Col componentClass={ControlLabel} md={4}>Task Category</Col>
                        <Col md={6}>
                            <FormControl
                                type='text'
                                name='dateCreated'
                                value={this.state.dateCreated}
                                onChange={this.handleUserInput.bind(this)}
                                placeholder='Allowed format is...'
                                required='required'
                            />
                            <CategorySelectBox 
                                initialValue={this.state.categoryId}
                                optionCategories={CategoryList.getCategoryList()}
                                handleCategoryParentIdChange={this.handleCategoryIdChange.bind(this)}
                            />
                        </Col>
                    </FormGroup>

                </Form>
                {this.state.msg && <span className='modalErrorMsg red'>{this.state.msg}</span>}
            </CustomModal>
        );
    };
}