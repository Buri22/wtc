import React, {Component} from 'react';
import {Button, Grid, Row, Col, ButtonToolbar, Table} from 'react-bootstrap';

class App extends Component {
  render () {
    return (
      <div className="App">
        <h2>Grid example</h2>
        <Grid>
          <Row className="show-grid">
            <Col xs={12} md={8}>
              One column
            </Col>
          </Row>
        </Grid>
        <ButtonToolbar>
          <Button>Default button</Button>
          <Button bsStyle="primary">Primary button</Button>
          <Button bsStyle="success">Success</Button>
        </ButtonToolbar>
      </div>
    );
  }
}

export default App;
