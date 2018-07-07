import React, { Component } from 'react';
import { NavItem, Modal, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Row, Col } from 'react-bootstrap';
import user from '../../model/user';
import PasswordInput from '../passwordInput/PasswordInput';

export default class AccountSettings extends Component {
    state = { 
        showModal: false,
        showPasswordSection: false,
        userName: '',
        email: '',
        passwordCurrent: '',
        passwordNew: '',
        passwordNewConfirm: '',
        //errorMessage: ''
     };

     componentWillMount() {
        this.setState({
            userName: user.getUserProp('userName'),
            email: user.getUserProp('email')
        });
     }

    handleShowModal() {
        this.setState({ showModal: true });
    }
    handleCloseModal() {
        this.setState({ showModal: false });
    }
    handleChangePassCheck(e) {
        this.setState({ showPasswordSection: e.target.checked });
    }
    handleUserInput (e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ [name]: value });
    }
    handleSubmit(e) {
        e.preventDefault();

        console.log('handleSubmit of accountSettingsForm');
    }

    validatePasswordConfirm() {
        if (this.state.passwordNewConfirm.length === 0) return null;
        if (this.state.passwordNew === this.state.passwordNewConfirm) return 'success';
        return 'error';
    }

    render() {
        return <React.Fragment>
            <NavItem
                onClick={this.handleShowModal.bind(this)}
                title='Account Settings'
            >
                <span className='glyphicon glyphicon-user'></span>
                <span> {this.state.userName || 'User'}</span>
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
                                />
                            </Col>
                        </FormGroup>

                        <FormGroup controlId='changePassword'>
                            <Col componentClass={ControlLabel} md={4}>Change Password</Col>
                            <Col md={6}>
                                <Checkbox
                                    onChange={this.handleChangePassCheck.bind(this)}
                                    checked={this.state.showPasswordSection}
                                ></Checkbox>
                            </Col>
                        </FormGroup>

                        {this.state.showPasswordSection && (
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
                                    />
                                    <FormControl.Feedback />
                                </Col>
                            </FormGroup>
                            </React.Fragment>
                        )}
                    </Form>
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
                    >Edit</Button>
                </Modal.Footer>

            </Modal>
        </React.Fragment>;
    }
}