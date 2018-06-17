import React, { Component } from 'react';
import axios from 'axios';
import { Button, Grid, Row, Col, ButtonToolbar, Table } from 'react-bootstrap';

class App extends Component {

    constructor(){
        super();
        // Make a request for a user with a given ID
axios.get('http://google.com')
.then(function (response) {
  console.log(response);
})
.catch(function (error) {
  console.log(error);
});

    }

    render() {
        return (
            <Grid>
                <Row className="show-grid">
                <Col xs={12} md={8}>
                    One column
                </Col>
                </Row>
            </Grid>
        );
    }
}

export default App;