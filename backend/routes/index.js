var express = require('express');
var router = express.Router();
var models = require('../models/models');
var User = models.User;
var Document = models.Document;

module.exports = function(passport) {

  router.post('/documents', function(req, res) {
    var userID = req.user._id;
    console.log('user', req.user);
    User.findById(userID)
    .then(user => {
      console.log(user);
    })
    .catch(err => {
      console.log('err', err);
    })
  });

  return router;
};
