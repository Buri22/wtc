import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';

// TODO: Implement Date picker and Time picker

export default class CustomModal extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <Modal show={true} onHide={this.props.handleCloseModal}>

                <Modal.Header closeButton>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {this.props.children}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        onClick={this.props.handleCloseModal}
                        className='left'
                    >
                        Close
                    </Button>
                    {this.props.submitBtn}
                </Modal.Footer>

            </Modal>
        );
    };

    // TODO: implement PropTypes - checking
}