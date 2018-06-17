import React from 'react';
import ReactDOM from 'react-dom';
import './css/styles.css';
import App from './App';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

// TODO move to a HTTP provider service
import axios from 'axios';

/*
// Make a request for a user with a given ID
axios.get('http://localhost/server/functions.php/login')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
 */

ReactDOM.render(<App />, document.getElementById("content"));