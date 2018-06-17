import React from 'react';
import ReactDOM from 'react-dom';
import './css/styles.css';
import App from './App';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

// TODO move to a HTTP provider service
import axios from 'axios';

ReactDOM.render(<App />, document.getElementById("content"));