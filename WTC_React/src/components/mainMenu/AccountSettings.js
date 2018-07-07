import React, { Component } from 'react';
import { NavItem, Modal, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Row, Col } from 'react-bootstrap';
import user from '../../model/user';
import PasswordInput from '../passwordInput/PasswordInput';

export default class AccountSettings extends Component {
    constructor (props) {
        super(props);

        this.state = { 
            showModal: false,
            userName: user.getProp('userName'),
            email: user.getProp('email'),
            changePassword: false,
            passwordCurrent: '',
            passwordNew: '',
            passwordNewConfirm: '',
            msg: ''
        };

        this.initialFormState = {
            userName:           this.state.userName,
            email:              this.state.email,
            changePassword:     this.state.changePassword,
            passwordCurrent:    this.state.passwordCurrent,
            passwordNew:        this.state.passwordNew,
            passwordNewConfirm: this.state.passwordNewConfirm
        };
        this.passwordConfirmValidationResults = {
            OK: 'success',
            ERROR: 'error',
            UNDEFINED: null
        };
    }

    validatePasswordConfirm() {
        if (this.state.passwordNewConfirm.length === 0) return this.passwordConfirmValidationResults.UNDEFINED;
        if (this.state.passwordNew === this.state.passwordNewConfirm) return this.passwordConfirmValidationResults.OK;
        return this.passwordConfirmValidationResults.ERROR;
    }
    editEnabled() {
        if (((this.state.userName !== this.initialFormState.userName
                || this.state.email !== this.initialFormState.email)
                && this.state.changePassword === false)
            || (this.state.changePassword === true
                && this.state.passwordCurrent.length > 0
                && this.state.passwordNew.length > 0
                && this.state.passwordNewConfirm.length > 0
                && this.validatePasswordConfirm() === this.passwordConfirmValidationResults.OK)) {
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

        user.editAccountData({
                userName:        this.state.userName,
                email:           this.state.email,
                changePassword:  this.state.changePassword,
                passwordCurrent: this.state.passwordCurrent,
                passwordNew:     this.state.passwordNew,
                passwordConfirm: this.state.passwordNewConfirm,
            })
            .then((response) => {
                console.log(response);
                if (response.success) {
                    this.setState({ showModal: false });
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
        return <React.Fragment>
            <NavItem
                onClick={this.handleShowModal.bind(this)}
                title='Account Settings'
            >
                <span className='glyphicon glyphicon-user'></span>
                <span> {this.initialFormState.userName || 'User'}</span>
            </NavItem>

            <Modal show={this.state.showModal} onHide={this.handleCloseModal.bind(this)}>

                <Modal.Header closeButton>
                    <Modal.Title>Account settings</Modal.Title>
                </Modal.Header>

                <Modal.Body>
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
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        onClick={this.handleCloseModal.bind(this)}
                        className='left'
                    >Close</Button>
                    <Button
                        bsStyle='primary'
                        type='submit'
                        form='accountSettingsForm'
                        disabled={!this.editEnabled()}
                    >Edit</Button>
                </Modal.Footer>

            </Modal>
        </React.Fragment>;
    }
}