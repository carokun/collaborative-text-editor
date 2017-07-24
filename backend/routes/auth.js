var express = require('express');
var router = express.Router();
var models = require('../models/models');
var User = models.User;

module.exports = function(passport) {

  router.post('/login', passport.authenticate('local'), function(req, res) {
    res.json(user: req.user);
  });

  router.post('/register', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var passwordRepeat = req.body.passwordRepeat;

    if (password !== passwordRepeat) {
      res.json({ success: false, message: 'passwords do not match' });
    } else {
      var user = new User({
        username: username,
        password: password,
        documents: []
      })
      user.save()
      .then(user => {
        res.json(user: user);
      })
    }

  });

  return router;
};
