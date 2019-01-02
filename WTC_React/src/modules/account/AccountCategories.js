import React, { Component } from 'react';
import { MenuItem, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Row, Col } from 'react-bootstrap';
import TreeView from 'treeview-react-bootstrap';
import { MODAL_CONTAINER } from '../../constants';
import PortalRenderer from '../../services/PortalRenderer';
import CustomModal from '../../components/CustomModal';

import UserService from '../../services/UserService';
import User from '../../model/user';

/**
 * Renders AccountCategories menu item and modal window with form to edit them
 */
export default class AccountCategories extends Component {
    constructor (props) {
        super(props);

        this.state = { 
            showModal:          false,
            msg:                '',
            userName:           User.getProp('userName'),
            email:              User.getProp('email')
        };

        this.initialFormState = {};
        this.modalTitle = 'Task Categories';
        this.modalSubmitBtn;
    }

    setInitialFormState() {
        this.initialFormState = {
            userName:           this.state.userName,
            email:              this.state.email
        }
    }
    editEnabled() {
        if (this.state.userName !== this.initialFormState.userName
            || this.state.email !== this.initialFormState.email) {
            return true;
        }

        return false;
    }

    handleShowModal() {
        this.setState({ showModal: true });
    }
    handleCloseModal() {
        this.setState({ showModal: false });
    }
    handleUserInput (e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ [name]: value });
    }
    handleSubmit(e) {
        e.preventDefault();

        UserService.editAccountData({
                userName:        this.state.userName,
                email:           this.state.email
            })
            .then((response) => {
                if (response.success) {
                    this.setInitialFormState();
                    // hide modal window + set initial form values
                    this.setState({
                        showModal:          false
                    });
                    // TODO: set result message with mediator into some general result message box
                }
                else if (response.success === false) {
                    this.props.logout(response.msg);
                }
                else if (response.msg) {
                    this.setState({ msg: response.msg });
                }
            });
    }

    render() {
        if (this.state.showModal) {
            this.modalSubmitBtn = <Button
                    bsStyle='primary'
                    type='submit'
                    form='accountCategoriesForm'
                    disabled={!this.editEnabled()}
                >Edit</Button>;
        }
        return <React.Fragment>
            <MenuItem
                onClick={this.handleShowModal.bind(this)}
                title={this.modalTitle}
            >
                <span className='glyphicon glyphicon-equalizer'></span>
                <span> Categories</span>
            </MenuItem>

            {this.state.showModal && 
                <PortalRenderer container={MODAL_CONTAINER}>
                    <CustomModal
                        title={this.modalTitle}
                        submitBtn={this.modalSubmitBtn}
                        handleCloseModal={this.handleCloseModal.bind(this)}
                    >
                        <Form
                            horizontal
                            id='accountCategoriesForm'
                            onSubmit={this.handleSubmit.bind(this)}
                        >
                            <FormGroup controlId='userName'>
                                <Col componentClass={ControlLabel} md={4}>User Name</Col>
                                <Col md={6}>
                                    <FormControl
                                        type='text'
                                        name='userName'
                                        value={this.state.userName}
                                        onChange={this.handleUserInput.bind(this)}
                                        autoComplete='username'
                                        placeholder='Enter your User Name'
                                        required='required'
                                        autoFocus
                                    />
                                </Col>
                            </FormGroup>
                            
                            <FormGroup controlId='userEmail'>
                                <Col componentClass={ControlLabel} md={4}>Email</Col>
                                <Col md={6}>
                                    <FormControl
                                        type='email'
                                        name='email'
                                        value={this.state.email}
                                        onChange={this.handleUserInput.bind(this)}
                                        autoComplete='email'
                                        placeholder='Enter your Email'
                                        required='required'
                                    />
                                </Col>
                            </FormGroup>
                        </Form>
                        {this.state.msg && <span className='modalErrorMsg right red'>{this.state.msg}</span>}
                    </CustomModal>
                </PortalRenderer>
            }
        </React.Fragment>;
    }
}