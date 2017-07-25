import React from 'react';
import axios from 'axios';
import {Editor, EditorState, convertToRaw, convertFromRaw} from 'draft-js';


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
      this.setState({
        revisionhistory: resp.data.revisionhistory
      });
    })
    .catch(err => {
      console.log("ERROR: Cannot retrieve documents using axios request ", err);
    });
  }

  modifyEditorDisplay(prevEditorState) {
    const prevState = EditorState.createWithContent(convertFromRaw(JSON.parse(prevEditorState)));
    this.setState({
      editorState: prevState
    })
  }

  render() {
    return (
      <div>
        <h2>Revision History</h2>

        <Editor
          editorState={this.state.editorState}
          readOnly={true}
        />
        <h3>History</h3>
        <div>
          {
            this.state.revisionhistory.map((prevEditorState) => {
              return <div onClick={() => this.modifyEditorDisplay(prevEditorState)}>Click me!</div>
            })
          }
        </div>
        <button>Restore</button>
        <button onClick={() => this.props.history.push('/document/' + this.props.match.params.docId)}>Return</button>
      </div>
    )
  }
}

export default RevisionHistory;