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
import Document from './views/Document';
import Login from './views/Login';
import Register from './views/Register';
import DocumentList from './views/DocumentList';

const router = (
  <BrowserRouter history={history}>
    <Route path='/' component={Document} />
    <Route path='/login' exact component={Login} />
    <Route path='/register' exact component={Register} />
    <Route path='/documentlist' exact component={DocumentList} />
  </BrowserRouter>
)

ReactDOM.render(
  router,
  document.getElementById('root')
)
