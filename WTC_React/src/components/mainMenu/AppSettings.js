import React, { Component } from 'react';
import { NavItem, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col } from 'react-bootstrap';
import { MODAL_CONTAINER } from '../../constants';
import PortalRenderer from '../../services/PortalRenderer';
import CustomModal from '../CustomModal';

import UserService from '../../services/UserService';
import User from '../../model/user';
import { APP_SETTINGS_OPTIONS } from '../../constants';
import {  APP_CONTEXT } from '../../globals';

const RenderOptions = ({ options }) => (
    options.map((option, index) => {
        return (<option key={index} value={option.id}>{option.name}</option>);
    })
);

/**
 * Renders AppSettings menu item and modal window with form to edit them
 */
export default class AppSettings extends Component {
    constructor (props) {
        super(props);

        this.state = { 
            showModal:        false,
            msg:              '',
            themeColor:       APP_CONTEXT.themeColor,
            sideMenuIsActive: APP_CONTEXT.sideMenuIsActive,
            sideMenuPosition: APP_CONTEXT.sideMenuPosition
        };

        this.initialFormState = {};
        this.modalTitle = 'App settings';
        this.modalSubmitBtn;
    }

    componentWillMount() {
        this.userAppSettings = User.getProp('appSettings');

        this.setState({
            themeColor:       this.userAppSettings.theme.color,
            sideMenuIsActive: this.userAppSettings.sideMenu.active,
            sideMenuPosition: this.userAppSettings.sideMenu.position
        }, () => this.setInitialFormState());
        
    }

    setInitialFormState() {
        this.initialFormState = {
            themeColor:       this.state.themeColor,
            sideMenuIsActive: this.state.sideMenuIsActive,
            sideMenuPosition: this.state.sideMenuPosition
        }
    }
    editEnabled() {
        if (Number(this.state.themeColor) !== this.initialFormState.themeColor
            || this.state.sideMenuIsActive !== this.initialFormState.sideMenuIsActive
            || (this.state.sideMenuIsActive === true
                && Number(this.state.sideMenuPosition) !== this.initialFormState.sideMenuPosition)) {
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
    handleSideMenuActive(e) {
        this.setState({ sideMenuIsActive: e.target.checked });
    }
    handleUserInput (e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ [name]: value });
    }
    handleSubmit(e) {
        e.preventDefault();

        UserService.editAppData({
                themeColor:       this.state.themeColor,
                sideMenuIsActive: this.state.sideMenuIsActive,
                sideMenuPosition: this.state.sideMenuPosition
            })
            .then((response) => {
                if (response.success) {
                    // hide modal window
                    this.setState({ showModal: false });
                    this.setInitialFormState();
                    this.props.onAppSettingsChange(true);
                    // TODO: rerender App to demonstrate the changes - use context to provide app theme data to components
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
                form='appSettingsForm'
                disabled={!this.editEnabled()}
            >Edit</Button>;
        }
        return <React.Fragment>
            <NavItem
                onClick={this.handleShowModal.bind(this)}
                title={this.modalTitle}
            >
                <span className='glyphicon glyphicon-cog'></span>
            </NavItem>

            {this.state.showModal && 
                <PortalRenderer container={MODAL_CONTAINER}>
                    <CustomModal
                        title={this.modalTitle}
                        submitBtn={this.modalSubmitBtn}
                        handleCloseModal={this.handleCloseModal.bind(this)}
                    >
                        <Form
                            horizontal
                            id='appSettingsForm'
                            onSubmit={this.handleSubmit.bind(this)}
                        >
                            <FormGroup controlId='themeColorSelect'>
                                <Col componentClass={ControlLabel} md={4}>Theme Color</Col>
                                <Col md={6}>
                                    <FormControl
                                        componentClass='select'
                                        name='themeColor'
                                        value={this.state.themeColor}
                                        onChange={this.handleUserInput.bind(this)}
                                    >
                                        <RenderOptions options={APP_SETTINGS_OPTIONS.themeColors}/>
                                    </FormControl>
                                </Col>
                            </FormGroup>

                            <FormGroup controlId='sideMenuActive'>
                                <Col componentClass={ControlLabel} md={4}>Side Menu Active</Col>
                                <Col md={6}>
                                    <Checkbox
                                        onChange={this.handleSideMenuActive.bind(this)}
                                        checked={this.state.sideMenuIsActive}
                                    ></Checkbox>
                                </Col>
                            </FormGroup>

                            {this.state.sideMenuIsActive && (
                                <React.Fragment>
                                    <FormGroup controlId='sideMenuPositionSelect'>
                                        <Col componentClass={ControlLabel} md={4}>Side Menu Position</Col>
                                        <Col md={6}>
                                            <FormControl
                                                componentClass='select'
                                                name='sideMenuPosition'
                                                value={this.state.sideMenuPosition}
                                                onChange={this.handleUserInput.bind(this)}
                                            >
                                                <RenderOptions options={APP_SETTINGS_OPTIONS.sideMenuPositions}/>
                                            </FormControl>
                                        </Col>
                                    </FormGroup>
                                </React.Fragment>
                            )}
                        </Form>
                        {this.state.msg && <span className='modalErrorMsg right red'>{this.state.msg}</span>}
                    </CustomModal>
                </PortalRenderer>
            }
        </React.Fragment>;
    }
}