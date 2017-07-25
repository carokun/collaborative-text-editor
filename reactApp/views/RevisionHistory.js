import React from 'react';
import axios from 'axios';
import {Editor, EditorState, convertToRaw, convertFromRaw} from 'draft-js';
import moment from 'moment';


class RevisionHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      revisionhistory: [],
      editorState: EditorState.createEmpty()
    }
  }

  componentWillMount() {
    axios.get('http://localhost:3000/document/' + this.props.match.params.docId)
    .then(resp => {
      console.log("RESPON", resp.data.revisionhistory);
      this.setState({
        revisionhistory: resp.data.revisionhistory
      });
    })
    .catch(err => {
      console.log("ERROR: Cannot retrieve documents using axios request ", err);
    });
  }

  modifyEditorDisplay(prevEditorState) {
    const prevState = EditorState.createWithContent(convertFromRaw(JSON.parse(prevEditorState.revision)));
    this.setState({
      editorState: prevState
    })
  }

  render() {
    return (
      <div className="revision-history-page">
        <h2>Revision History</h2>

        <Editor
          editorState={this.state.editorState}
          readOnly={true}
        />
        <h3>History</h3>
        <h5>Least Recent</h5>
        <div className="history-list">
          {
            this.state.revisionhistory.map((prevEditorState) => {
              return <div onClick={() => this.modifyEditorDisplay(prevEditorState)}>{moment(prevEditorState.date).format('MMMM Do YYYY, h:mm:ss a')}</div>
            })
          }
        </div>
        <h5>Most Recent</h5>
        <button>Restore</button>
        <button onClick={() => this.props.history.push('/document/' + this.props.match.params.docId)}>Return</button>
      </div>
    )
  }
}

export default RevisionHistory;