import React from 'react';
import ReactDOM from 'react-dom';
import {RichUtils, Editor, EditorState, DefaultDraftBlockRenderMap} from 'draft-js';
import { Map } from 'immutable';

import 'draft-js/dist/Draft.css';
import './myStyle.scss';

const blockRenderMap = Map({
  'align-left': {
    element: 'div'
  },
  'align-center': {
    element: 'div'
  },
  'align-right': {
    element: 'div'
  }
});

const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      align: null,
      alignment: 'left'
    };
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

  _onLeftAlignClick() {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'align-left'));
  }

  _onCenterAlignClick() {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'align-center'));
  }

  _onRightAlignClick() {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'align-right'));
  }

  _blockRenderMapFn(contentBlock) {
    const type = contentBlock.getType();
    if (type === 'align-left') {
      return 'align-left';
    }
    if (type === 'align-center') {
      return 'align-center';
    }
    if (type === 'align-right') {
      return 'alignRight';
    }
    return null;
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
          blockRenderMap={extendedBlockRenderMap}
          blockStyleFn={this._blockRenderMapFn}
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
