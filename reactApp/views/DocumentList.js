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

  componentWillMount() {
    axios.get('http://localhost:3000/documents')
    .then(resp => {
      console.log(resp);
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
      } else {
        console.log('fail', resp);
      }
    })
  }

  createNewDocument() {
    console.log('here');
    axios.post('http://localhost:3000/createNewDocument', {
      title: this.state.createDocTitle
    })
    .then(resp => {
      this.setState({ createDocTitle: '' })
      if (resp.status === 200) {
        console.log('success', resp);
        this.setState({ createDocTitle: '', documents: resp.data })
      } else {
        console.log('fail', resp);
      }
    })
    .catch(err => {
      console.log('err', err);
    })
  }

  render() {
    return (
      <div>
        <h2>Documents Portal</h2>
        <input value={this.state.createDocTitle} type="text" placeholder="Enter new document title" onChange={(e) => this.setState({createDocTitle: e.target.value})}/>
        <button onClick={() => this.createNewDocument()}>Create Document</button>
        <div>
        {
          this.state.documents.map((docObject) =>
            <a href="#">{docObject.title}</a>
          )
        }
        </div>
        <input value={this.state.sharedDocID} type="text" placeholder="Enter id of document" onChange={(e) => this.setState({sharedDocID: e.target.value})}/>
        <button onClick={() => this.addSharedDocument()}>Add shared document</button>
      </div>
    );
  }
}

export default DocumentList;
