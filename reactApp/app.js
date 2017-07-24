// var React = require('react');
// var ReactDOM = require('react-dom');

/* This can check if your electron app can communicate with your backend */
// fetch('http://localhost:3000')
// .then(resp => resp.text())
// .then(text => console.log(text))
// .catch(err => {throw err})

import React from 'react';
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, IndexRoute } from 'react-router-dom';
import Editor from './components/Editor';
import Login from './views/Login';

const router = (
  <BrowserRouter history={history}>
    <Route path='/' component={Login} />
  </BrowserRouter>
)

ReactDOM.render(
  router,
  document.getElementById('root')
)
