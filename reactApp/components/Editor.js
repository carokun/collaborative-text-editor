import React from 'react';
import ReactDOM from 'react-dom';
import {RichUtils, Editor, EditorState} from 'draft-js';
import axios from 'axios';

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.onChange = (editorState) => this.setState({editorState});
  }

  _onBoldClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
  }

  _onItalicClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'));
  }

  _onCodeClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'CODE'));
  }

  _onUnderlineClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'UNDERLINE'));
  }

  componentWillMount() {
    const self = this;
    axios.get('http://localhost:3000/document/' + this.props.id)
    .then(resp => {
      console.log(this.state.editorState);
      console.log(JSON.parse(resp.data.text));
      self.onChange(JSON.parse(resp.data.text));
    })
    .catch(err => {
      console.log("ERROR:", err);
    });
  }

  render() {
    return (
      <div>
        <div style={editorBoxStyle}>
          <button onClick={this._onBoldClick.bind(this)}>Bold</button>
          <button onClick={this._onItalicClick.bind(this)}>Italics</button>
          <button onClick={this._onCodeClick.bind(this)}>Code</button>
          <button onClick={this._onUnderlineClick.bind(this)}>Underline</button>
          <Editor
            editorState={this.state.editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
          />
        </div>
        <button onClick={() => this.props.saveDocument(this.state.editorState)}>Save</button>
      </div>

    )
  }
}

var editorBoxStyle = {
  borderRadius: 4,
  borderWidth: 0.5,
  backgroundColor: '#E9F7FD',
  height: 200
}

export default MyEditor;
