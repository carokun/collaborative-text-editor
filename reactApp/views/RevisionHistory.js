import React from 'react';
import axios from 'axios';
import { Editor, EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import moment from 'moment';

class RevisionHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      revisionhistory: [],
      editorState: EditorState.createEmpty(),
      title: "",
      currVersion: "",
      displayedChanges: []
    }
  }

  componentWillMount() {
    axios.get('http://localhost:3000/document/' + this.props.match.params.docId)
    .then(resp => {
      this.setState({
        revisionhistory: resp.data.revisionhistory,
        title: resp.data.title,
        currVersion: resp.data.text
      });
    })
    .catch(err => {
      console.log("ERROR: Cannot retrieve documents using axios request ", err);
    });
  }

  updateChangesDisplay(prevState) {
    var currVersion = EditorState.createWithContent(convertFromRaw(JSON.parse(this.state.currVersion))).getCurrentContent().getPlainText().split(/\r?\n/);
    var viewedVersion = prevState.getCurrentContent().getPlainText().split(/\r?\n/);

    currVersion = currVersion.filter(function(entry) { return entry.trim() !== ''; });
    viewedVersion = viewedVersion.filter(function(entry) { return entry.trim() !== ''; });    

    console.log("CURRENT VERSION: ", currVersion);
    console.log("EDITOR STATE: ", viewedVersion);

    var changesArray = [];

    let currIndex = 0; // Index to track place in currVersion (current saved version of document)
    let pastIndex = 0; // Index to track place in viewedVersion (previous version of document)

    while (currIndex < currVersion.length || pastIndex < viewedVersion.length) {
      console.log("HERE")
      if (currVersion[currIndex] === viewedVersion[pastIndex]) {
        changesArray.push(<div className="not-changed-line">{currVersion[currIndex]}</div>)
        currIndex++;
        pastIndex++;
      }
      else {
        while (currVersion[currIndex] !== viewedVersion[pastIndex] && currIndex < currVersion.length) {
          changesArray.push(<div className="added-line">{currVersion[currIndex]}</div>);
          currIndex++;
        }
        while (currVersion[currIndex] !== viewedVersion[pastIndex] && pastIndex < viewedVersion.length) {
          changesArray.push(<div className="removed-line">{viewedVersion[pastIndex]}</div>);
          pastIndex++;
        }
      }
    }
    console.log("DISPLAYED CHANGES: ", changesArray);
    this.setState({
      displayedChanges: changesArray
    })
  }

  modifyEditorDisplay(prevEditorState) {
    const prevState = EditorState.createWithContent(convertFromRaw(JSON.parse(prevEditorState.revision)));
    this.setState({
      editorState: prevState
    });
    this.updateChangesDisplay(prevState);
  }

  restore() {
    axios.post('http://localhost:3000/restore', {
      id: this.props.match.params.docId,
      prevState: JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()))
    })
    .then(resp => {
      this.setState({
        currVersion: JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()))
      });
    })
    .catch(err => console.log("ERROR: ", err))
  }

  render() {
    return (
      <div className="revision-history-page">
        <h2>"{this.state.title}" Revision History</h2>
        <h3>View Version</h3>

        <div className="revision-editor"><Editor
          editorState={this.state.editorState}
          readOnly={true}
        />
        </div>

        <h3>Changes</h3>
        <div className="changes-view">
          {
            this.state.displayedChanges.map((line) => (line))
          }
        </div>

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
        <button className="blue-button" onClick={() => this.restore()}>Restore</button>
        <button className="blue-button" onClick={() => this.props.history.push('/document/' + this.props.match.params.docId)}>Return</button>
      </div>
    )
  }
}

export default RevisionHistory;
