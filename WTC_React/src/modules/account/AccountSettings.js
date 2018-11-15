import React, { Component } from 'react';
import { MenuItem, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Row, Col } from 'react-bootstrap';
import PasswordInput from 'components/passwordInput/PasswordInput';
import ModalContentRenderer from '../../services/ModalContentRenderer';
import CustomModal from '../../components/CustomModal';

import UserService from '../../services/UserService';
import User from '../../model/user';

const passwordConfirmValidationResults = {
    OK: 'success',
    ERROR: 'error',
    UNDEFINED: null
};

/**
 * Renders AccountSettings menu item and modal window with form to edit them
 */
export default class AccountSettings extends Component {
    constructor (props) {
        super(props);

        this.state = { 
            showModal:          false,
            msg:                '',
            userName:           User.getProp('userName'),
            email:              User.getProp('email'),
            changePassword:     false,
            passwordCurrent:    '',
            passwordNew:        '',
            passwordNewConfirm: ''
        };

        this.initialFormState = {};
        this.modalTitle = 'Account Settings';
        this.modalSubmitBtn;
    }

    setInitialFormState() {
        this.initialFormState = {
            userName:           this.state.userName,
            email:              this.state.email,
            changePassword:     false,
            passwordCurrent:    '',
            passwordNew:        '',
            passwordNewConfirm: ''
        }
    }
    validatePasswordConfirm() {
        if (this.state.passwordNewConfirm.length === 0) {
            return passwordConfirmValidationResults.UNDEFINED;
        }
        if (this.state.passwordNew === this.state.passwordNewConfirm) {
            return passwordConfirmValidationResults.OK;
        }
        return passwordConfirmValidationResults.ERROR;
    }
    editEnabled() {
        if (((this.state.userName !== this.initialFormState.userName
                || this.state.email !== this.initialFormState.email)
                && this.state.changePassword === false)
            || (this.state.changePassword === true
                && this.state.passwordCurrent.length > 0
                && this.state.passwordNew.length > 0
                && this.state.passwordNewConfirm.length > 0
                && this.validatePasswordConfirm() === passwordConfirmValidationResults.OK)) {
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
    handleChangePassCheck(e) {
        this.setState({ changePassword: e.target.checked });
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
                email:           this.state.email,
                changePassword:  this.state.changePassword,
                passwordCurrent: this.state.passwordCurrent,
                passwordNew:     this.state.passwordNew,
                passwordConfirm: this.state.passwordNewConfirm,
            })
            .then((response) => {
                if (response.success) {
                    this.setInitialFormState();
                    // hide modal window + set initial form values
                    this.setState({
                        showModal:          false,
                        changePassword:     false,
                        passwordCurrent:    '',
                        passwordNew:        '',
                        passwordNewConfirm: ''
                    });
                    this.props.handleUserNameChange(this.state.userName);
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
                    form='accountSettingsForm'
                    disabled={!this.editEnabled()}
                >Edit</Button>;
        }
        return <React.Fragment>
            <MenuItem
                onClick={this.handleShowModal.bind(this)}
                title={this.modalTitle}
            >
                <span className='glyphicon glyphicon-user'></span>
                <span> Account</span>
            </MenuItem>

            {this.state.showModal && 
                <ModalContentRenderer>
                    <CustomModal
                        title={this.modalTitle}
                        submitBtn={this.modalSubmitBtn}
                        handleCloseModal={this.handleCloseModal.bind(this)}
                    >
                        <Form
                            horizontal
                            id='accountSettingsForm'
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

                            <FormGroup controlId='changePassword'>
                                <Col componentClass={ControlLabel} md={4}>Change Password</Col>
                                <Col md={6}>
                                    <Checkbox
                                        onChange={this.handleChangePassCheck.bind(this)}
                                        checked={this.state.changePassword}
                                    ></Checkbox>
                                </Col>
                            </FormGroup>

                            {this.state.changePassword && (
                                <React.Fragment>
                                <FormGroup controlId='currentPassword'>
                                    <Col componentClass={ControlLabel} md={4}>Current Password *</Col>
                                    <Col md={6}>
                                        <FormControl
                                            type='password'
                                            name='passwordCurrent'
                                            value={this.state.passwordCurrent}
                                            onChange={this.handleUserInput.bind(this)}
                                            autoComplete='current-password'
                                            required='required'
                                        />
                                    </Col>
                                </FormGroup>

                                <Row className='lableAlignBottom'>
                                    <Col componentClass={ControlLabel} md={4}>New Password *</Col>
                                    <Col md={6}>
                                        <PasswordInput
                                            name='passwordNew'
                                            controlId='newPassword'
                                            passwordValue={this.state.passwordNew}
                                            handlePasswordInput={this.handleUserInput.bind(this)}
                                        />
                                    </Col>
                                </Row>

                                <FormGroup
                                    validationState={this.validatePasswordConfirm()}
                                    controlId='confirmNewPassword'
                                >
                                    <Col componentClass={ControlLabel} md={4}>Confirm New Password *</Col>
                                    <Col md={6}>
                                        <FormControl
                                            type='password'
                                            name='passwordNewConfirm'
                                            value={this.state.passwordNewConfirm}
                                            onChange={this.handleUserInput.bind(this)}
                                            autoComplete='new-password'
                                            required='required'
                                        />
                                        <FormControl.Feedback />
                                    </Col>
                                </FormGroup>
                                </React.Fragment>
                            )}
                        </Form>
                        {this.state.msg && <span className='modalErrorMsg right red'>{this.state.msg}</span>}
                    </CustomModal>
                </ModalContentRenderer>
            }
        </React.Fragment>;
    }
}