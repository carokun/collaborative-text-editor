var express = require('express');
var router = express.Router();
var models = require('../models/models');
var User = models.User;
var Document = models.Document;
var EditorState = require('draft-js').EditorState;
var convertToRaw = require('draft-js').convertToRaw;

module.exports = function(passport) {

  router.get('/documents', function(req, res) {
    var userID = req.user._id;

    User.findById(userID)
    .then(user => {
      res.json(user.documents);
    })
    .catch(err => {
      console.log('err', err);
    })
  });

  router.get('/document/:id', function(req, res) {
    console.log(req.params.id);
    Document.findById(req.params.id)
    .then(doc => {
      res.json(doc);
    })
    .catch(err => {
      console.log('err', err);
    })
  });

  router.post('/createNewDocument', function(req, res) {
    console.log(JSON.stringify(convertToRaw(EditorState.createEmpty().getCurrentContent())));
    const title = req.body.title;
    const newDoc = new Document({
      owner: req.user._id,
      title: title,
      text: JSON.stringify(convertToRaw(EditorState.createEmpty().getCurrentContent()))
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
        var newDocs = req.user.documents.slice();
        newDocs.push(document);
        req.user.documents = newDocs;
        req.user.save()
        res.json(document)
      } else {
        res.json({message: 'failed to add'})
      }
    })

  });

  router.post('/saveDocument', function(req, res) {
    const docID = req.body.id;
    const newRevision = req.body.newRevision;

    Document.findById(docID)
    .then(document => {
      if (document) {
        let newRevisionHistory = [...document.revisionhistory]
        newRevisionHistory.push(newRevision);
        document.revisionhistory = newRevisionHistory;
        document.text = JSON.stringify(req.body.text);
        document.save()
        .then(doc => {
          console.log(doc);
          res.json(doc)
        })
      } else {
        res.json({message: 'failed to add'})
      }
    })
    .catch(err => {console.log('errrrr', err)})
  });

  return router;
};
