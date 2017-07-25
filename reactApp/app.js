// var React = require('react');
// var ReactDOM = require('react-dom');

/* This can check if your electron app can communicate with your backend */
// fetch('http://localhost:3000')
// .then(resp => resp.text())
// .then(text => console.log(text))
// .catch(err => {throw err})

import React from 'react';
import ReactDOM from 'react-dom'
import { HashRouter, Route, IndexRoute } from 'react-router-dom';
import Document from './views/Document';
import Login from './views/Login';
import Register from './views/Register';
import DocumentList from './views/DocumentList';
import styles from './assets/stylesheets/main.less';

  // <Route path='/' component={Login} />
const router = (
  <HashRouter history={history}>
    <div>
      <Route path='/document' exact component={Document} />
      <Route path='/' exact component={Login} />
      <Route path='/register' exact component={Register} />
      <Route path='/documentlist' exact component={DocumentList} />
    </div>
  </HashRouter>
)

ReactDOM.render(
  router,
  document.getElementById('root')
)
