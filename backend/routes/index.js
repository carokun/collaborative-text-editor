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

  router.post('/createNewDocument', function(req, res) {
    console.log('hereeee');

    const title = req.body.title;
    const newDoc = new Document({
      owner: req.user._id,
      title: title,
      text: ''
    })
    newDoc.save()
    .then(document => {
      var newDocs = req.user.documents.slice();
      newDocs.push(document);
      req.user.documents = newDocs;
      req.user.save()
      res.json(document)
    })
  });

  router.post('/addSharedDocument', function(req, res) {
    const docID = req.body.docID;

    Document.findById(docID)
    .then(document => {
      if (document) {
        res.json(document)
        var newDocs = user.documents.slice();
        newDocs.push(document);
        user.save()
      } else {
        res.json({message: 'failed to add'})
      }
    })

  });

  return router;
};
