import React from 'react';
import ReactDOM from 'react-dom';
import {RichUtils, Editor, EditorState} from 'draft-js';


const styleMap = {
  'LEFT_ALIGN': {
    'display': 'block',
    'text-align': 'left'
  },
  'CENTER_ALIGN': {
    'display': 'block',
    'text-align': 'center'
  },
  'RIGHT_ALIGN': {
    'display': 'block',
    'text-align': 'right'
  }
}

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty()
    };
    this.onChange = (editorState) => this.setState({editorState});
  }
  componentWillMount() {
    console.log("DOCUMENT ID", this.props.docId);
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

  _onLeftAlignClick() {
    console.log(this.state.editorState);
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'LEFT_ALIGN'));
  }

  _onCenterAlignClick() {
    console.log(this.state.editorState);
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'CENTER_ALIGN'));
  }

  _onRightAlignClick() {
    console.log(this.state.editorState);
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'RIGHT_ALIGN'));
  }


  render() {
    return (
      <div style={editorBoxStyle}>
        <button onClick={this._onBoldClick.bind(this)}>Bold</button>
        <button onClick={this._onItalicClick.bind(this)}>Italics</button>
        <button onClick={this._onCodeClick.bind(this)}>Code</button>
        <button onClick={this._onUnderlineClick.bind(this)}>Underline</button>
        <button onClick={this._onLeftAlignClick.bind(this)}>align-left</button>
        <button onClick={this._onCenterAlignClick.bind(this)}>align-center</button>
        <button onClick={this._onRightAlignClick.bind(this)}>align-right</button>
        <Editor
          editorState={this.state.editorState}
          handleKeyCommand={this.handleKeyCommand}
          onChange={this.onChange}
          customStyleMap={styleMap}
        />
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
