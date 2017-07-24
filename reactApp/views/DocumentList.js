import React from 'react';
import axios from 'axios';

class DocumentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      documents: []
    }
  }
  componentDidMount() {
    axios.get(process.env.DOMAIN + '/documents')
    .then(documents => {
      this.setState({
        documents: documents
      });
    })
    .catch(err => {
      console.log("ERROR: Cannot retrieve documents using axios request ", err);
    });
  }
  render() {
    return (
      <div>
        <h2>Documents Portal</h2>
        <input type="text" placeholder="Enter new document title"/>
        <button type="submit">Create Document</button>
        <div>
        {
          this.state.documents.map((docObject) => {
            <a href="#">{docObject.title}</a>
          })
        }
        </div>
        <input type="text" placeholder="Enter id of document"/>
        <button type="submit">Add shared document</button>
      </div>
    );
  }
}

export default DocumentList;
