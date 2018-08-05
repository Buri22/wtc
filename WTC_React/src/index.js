import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

require('../css/styles.less');
require('bootstrap/dist/css/bootstrap.css');      
require('bootstrap/dist/css/bootstrap-theme.css');

ReactDOM.render(<App />, document.querySelector('.container'));