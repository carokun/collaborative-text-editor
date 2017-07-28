// var React = require('react');
// var ReactDOM = require('react-dom');

/* This can check if your electron app can communicate with your backend */
// fetch('https://morning-badlands-13664.herokuapp.com')
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
import RevisionHistory from './views/RevisionHistory';
import styles from './assets/stylesheets/main.less';
import TwitterExample from './views/TwitterExample';


  // <Route path='/' component={Login} />
const router = (
  <HashRouter history={history}>
    <div>
      <Route path='/document/:id' component={Document} />
      <Route path='/' exact component={Login} />
      <Route path='/register' exact component={Register} />
      <Route path='/documentlist' exact component={DocumentList} />
      <Route path='/revisionhistory/:docId' component={RevisionHistory} />
    </div>
  </HashRouter>
)

ReactDOM.render(
  router,
  document.getElementById('root')
)
