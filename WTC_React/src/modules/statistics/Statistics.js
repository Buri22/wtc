import React, {Component} from 'react';
import { FormGroup, FormControl, Col, ControlLabel, Button } from 'react-bootstrap';
import SalesForceService from '../../services/SalesForceService';
export default class Statistics extends Component {
    constructor (props) {
        super (props);
        this.state = {
            sfAction: ''
        }
    }

    handleUserInput (e) {
        this.setState({ [e.target.name]: e.target.value });
    }
    handleRequestToSalesForce() {
        SalesForceService.sendRequest({
            SFAction: this.state.sfAction
        })
        .then((response) => {
            console.log(response);
        });
    }
    handleChangeDataRequestToSalesForce() {
        SalesForceService.sendChangeDataRequest()
        .then((response) => {
            console.log(response);
        });
    }

    render(){
        return <div>Statistics content<br/>
            
            <FormGroup controlId='sfAction'>
                <Col componentClass={ControlLabel} md={4}>SalesForce action</Col>
                <Col md={6}>
                    <FormControl
                        type='text'
                        name='sfAction'
                        value={this.state.sfAction}
                        onChange={this.handleUserInput.bind(this)}
                        placeholder='Enter sobject and further params...'
                        autoFocus
                    />
                </Col>
            </FormGroup>
            <Button
                className="sendRequestToSalesForce"
                bsStyle="primary"
                onClick={this.handleRequestToSalesForce.bind(this)}
            >
                Send Request To SalesForce
            </Button>
            <Button
                className="changeDataInSalesForce"
                bsStyle="info"
                onClick={this.handleChangeDataRequestToSalesForce.bind(this)}
            >
                Change data in SalesForce
            </Button>
        </div>;
    }
}