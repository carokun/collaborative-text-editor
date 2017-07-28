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
      createDocTitle: '',
      searchInput: ''
    }
  }

  componentWillMount() {
    axios.get('https://morning-badlands-13664.herokuapp.com/documents')
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
    axios.post('https://morning-badlands-13664.herokuapp.com/addSharedDocument', {
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
    axios.post('https://morning-badlands-13664.herokuapp.com/createNewDocument', {
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
  signOutUser() {
    this.props.history.push('/');
    axios.get('https://morning-badlands-13664.herokuapp.com/logout')
    .then(res => {
      if(res.data.success) {
        console.log('logged out');
      }
    })
  }

  filterDocuments() {
    axios.get('https://morning-badlands-13664.herokuapp.com/documents')
    .then(resp => {
      const docs = resp.data;
      const filteredDocs = [];
      docs.forEach(doc => {
        const text = convertFromRaw(JSON.parse(doc.text)).getPlainText();
        const title = doc.title;
        if (title.indexOf(this.state.searchInput) !== -1 || text.indexOf(this.state.searchInput) !== -1) {
          filteredDocs.push(doc);
        }
      })
      this.setState({
        documents: filteredDocs,
        searchInput: ''
      });
    })
    .catch(err => {
      console.log("ERROR: Cannot retrieve documents using axios request ", err);
    });
  }

  showAll() {
    axios.get('https://morning-badlands-13664.herokuapp.com/documents')
    .then(resp => {
      this.setState({
        documents: resp.data
      });
    })
    .catch(err => {
      console.log("ERROR: Cannot retrieve documents using axios request ", err);
    });
  }

  render() {
    return (
      <div className="document-list-page">
        <div className="document-list-header">
          <h2>Documents</h2>
          <button className="log-out" onClick={() => this.signOutUser()}>Log Out</button>
          <div className="labels">
            <h5>Create new document</h5>
            <h5>Add shared document</h5>
            <h5>Filter documents</h5>
            <div className="space"></div>
          </div>
          <div className="document-list-options">
            <input value={this.state.createDocTitle} type="text" placeholder="Enter new document title" onChange={(e) => this.setState({createDocTitle: e.target.value})}/>
            <button onClick={() => this.createNewDocument()}><i className="fa fa-file-text" aria-hidden="true"></i></button>
            <input value={this.state.sharedDocID} type="text" placeholder="Enter id of document" onChange={(e) => this.setState({sharedDocID: e.target.value})}/>
            <button onClick={() => this.addSharedDocument()}><i className="fa fa-share-square-o" aria-hidden="true"></i></button>
            <input value={this.state.searchInput} type="text" placeholder="Search keywords" onChange={(e) => this.setState({searchInput: e.target.value})}/>
            <button onClick={() => this.filterDocuments()}><i className="fa fa-share-square-o" aria-hidden="true"></i></button>
            <button onClick={() => this.showAll()} style={{fontSize: '12px'}}>Show All</button>
          </div>
        </div>
        <div className='list'>
        {
          this.state.documents.map((docObject) => {
            return (
              <div key={docObject._id} className="list-item" onClick={() => this.props.history.push('/document/' + docObject._id)}>
                <div className="list-header">{docObject.title}
                </div>{
                  convertFromRaw(JSON.parse(docObject.text)).getPlainText().length > 120 ? convertFromRaw(JSON.parse(docObject.text)).getPlainText().match(/^.{120}\w*/) + ' ...' : convertFromRaw(JSON.parse(docObject.text)).getPlainText()
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
