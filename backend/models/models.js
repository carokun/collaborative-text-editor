var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema ({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  documents: [
      {
        type: Schema.ObjectId,
        ref: 'Document'
      }
  ]
})

var DocumentSchema = new Schema ({
  owner: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  text: {
    type: String
  },
  revisionhistory: {
    type: Array,
    default: []
  }
});


var User = mongoose.model('User', UserSchema)
var Document = mongoose.model('Document', DocumentSchema)

module.exports = {
  User: User,
  Document: Document
};
