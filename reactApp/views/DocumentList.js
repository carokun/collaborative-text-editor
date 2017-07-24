import React from 'react';
import axios from 'axios';

class DocumentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      documents: [],
      sharedDocID: '',
      createDocTitle: ''
    }
  }
  componentDidMount() {
    axios.get('http://localhost:3000/documents')
    .then(documents => {
      this.setState({
        documents: documents
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
      if (resp.status === 200) {
        console.log('success', resp);
      } else {
        console.log('fail', resp);
      }
    })
    this.setState({ sharedDocID: '' })
  }

  createNewDocument() {
    axios.post('http://localhost:3000/createNewDocument', {
      title: this.state.createDocTitle
    })
    .then(resp => {
      if (resp.status === 200) {
        console.log('success', resp);
      } else {
        console.log('fail', resp);
      }
    })
    this.setState({ createDocTitle: '' })
  }

  render() {
    return (
      <div>
        <h2>Documents Portal</h2>
        <input type="text" placeholder="Enter new document title" onChange={(e) => this.setState({createDocTitle: e.target.value})}/>
        <button type="submit" onClick={() => this.createNewDocument()}>Create Document</button>
        <div>
        {
          this.state.documents.map((docObject) => {
            <a href="#">{docObject.title}</a>
          })
        }
        </div>
        <input type="text" placeholder="Enter id of document" onChange={(e) => this.setState({sharedDocID: e.target.value})}/>
        <button type="submit" onClick={() => this.addSharedDocument()}>Add shared document</button>
      </div>
    );
  }
}

export default DocumentList;
