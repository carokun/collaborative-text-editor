var express = require('express');
var router = express.Router();
var models = require('../models/models');
var User = models.User;
var Document = models.Document;

module.exports = function(passport) {

  router.get('/documents', function(req, res) {
    console.log('user', req.user);
    var userID = req.user._id;

    User.findById(userID)
    .then(user => {
      res.json(user.documents);
    })
    .catch(err => {
      console.log('err', err);
    })
  });

  return router;
};
