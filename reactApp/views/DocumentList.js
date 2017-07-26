import React from 'react';
import axios from 'axios';
import {EditorState, convertFromRaw} from 'draft-js';

import '../assets/stylesheets/documentlist.less';
import '../assets/stylesheets/editor.less';

class DocumentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      documents: [],
      sharedDocID: '',
      createDocTitle: ''
    }
  }

  componentWillMount() {
    axios.get('http://localhost:3000/documents')
    .then(resp => {
      this.setState({
        documents: resp.data
      });
    })
    .catch(err => {
      console.log("ERROR: Cannot retrieve documents using axios request ", err);
    });
  }

  addSharedDocument() {
    axios.post('http://localhost:3000/addSharedDocument', {
      docID: this.state.sharedDocID
    })
    .then(resp => {
      this.setState({ sharedDocID: '' })
      if (resp.status === 200) {
        console.log('success', resp);
        var documents = this.state.documents;
        documents.push(resp.data);
        this.setState({ createDocTitle: '', documents: documents })
      }
    })
  }

  createNewDocument() {
    axios.post('http://localhost:3000/createNewDocument', {
      title: this.state.createDocTitle
    })
    .then(resp => {
      this.setState({ createDocTitle: '' })
      if (resp.status === 200) {
        var documents = this.state.documents;
        documents.push(resp.data);
        this.setState({ createDocTitle: '', documents: documents })
      }
    })
    .catch(err => {
      console.log('err', err);
    })
  }

  render() {
    return (
      <div className="document-list-page">
        <div className="document-list-header">
          <h2>Documents</h2>
          <div className="document-list-options">
            <input value={this.state.createDocTitle} type="text" placeholder="Enter new document title" onChange={(e) => this.setState({createDocTitle: e.target.value})}/>
            <button onClick={() => this.createNewDocument()}><i className="fa fa-file-text" aria-hidden="true"></i></button>
            <input value={this.state.sharedDocID} type="text" placeholder="Enter id of document" onChange={(e) => this.setState({sharedDocID: e.target.value})}/>
            <button onClick={() => this.addSharedDocument()}><i className="fa fa-share-square-o" aria-hidden="true"></i></button>
          </div>
        </div>
        <div className='list'>
        {
          this.state.documents.map((docObject) => {
            return (
              <div key={docObject._id} className="list-item" onClick={() => this.props.history.push('/document/' + docObject._id)}>
                <div className="list-header">{docObject.title}
                </div>{
                  convertFromRaw(JSON.parse(docObject.text)).getPlainText().match(/^.{120}\w*/) + ' ...'
                }
              </div>
            )
          })
        }
        </div>
      </div>
    );
  }
}

export default DocumentList;
