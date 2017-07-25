import React from 'react';
import ReactDOM from 'react-dom';

import {RichUtils, Editor, EditorState, convertToRaw, DefaultDraftBlockRenderMap, convertFromRaw, getDefaultKeyBinding,
KeyBindingUtil,
Modifier } from 'draft-js';
const { editorBoxStyle,
        styleMap,
        sizes,
        fonts,
        colors } = require('./stylingConsts');
const { hasCommandModifier } = KeyBindingUtil;
const { myKeyBindingFn } = require('./keyBindingFn');
import { Map } from 'immutable';
import axios from 'axios';
import 'draft-js/dist/Draft.css';

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
      interval: () => ''
    };
    this.onChange = (editorState) => this.setState({editorState});
    this._onStyleClick = this._onStyleClick.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
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

  _onULClick() {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'unordered-list-item'));
  }

  _onOLClick() {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'ordered-list-item'));
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

  componentWillMount() {
    const self = this;
    axios.get('http://localhost:3000/document/' + this.props.id)
    .then(resp => {
      const parsed = EditorState.createWithContent(convertFromRaw(JSON.parse(resp.data.text)));
      self.onChange(parsed);
      this.setState({ interval: setInterval(() => this.props.saveDocument(convertToRaw(this.state.editorState.getCurrentContent())), 30000)})
    })
    .catch(err => {
      console.log("ERROR:", err);
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.interval);
  }

  _onFontSizeClick() {
    this._onStyleClick("fontSize", sizes);
  }

  _onFontStyleClick() {
    this._onStyleClick("fontStyle", fonts);
  }

  _onFontColorClick() {
    this._onStyleClick("fontColor", colors);
  }

  _onStyleClick(docId, arr) {
    let e = document.getElementById(docId);
    let toggledStyle = e.options[e.selectedIndex].value;
    const { editorState } = this.state;
    const selection = editorState.getSelection();
    // remove current related styling (other colors || sizes || fonts)
    const nextContentState = arr.reduce((contentState, style) => {
        return Modifier.removeInlineStyle(contentState, selection, style)
      }, editorState.getCurrentContent());

    let nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      'change-inline-style'
    );
    const currentStyle = editorState.getCurrentInlineStyle();
    // Unset style override for current style.
    if (selection.isCollapsed()) {
      nextEditorState = currentStyle.reduce((state, style) => {
        return RichUtils.toggleInlineStyle(state, style);
      }, nextEditorState);
    }
    // If the style is being toggled on, apply it.
    if (!currentStyle.has(toggledStyle)) {
      nextEditorState = RichUtils.toggleInlineStyle(
        nextEditorState,
        toggledStyle
      );
    }

    this.onChange(nextEditorState);
  }

  handleKeyCommand(command: string): DraftHandleValue {
    if (command === 'myeditor-save') {
      console.log('SAVED!!')
      return 'handled';
    } else if (command === 'myeditor-bold') {
      console.log('BOLD!!')
      this._onBoldClick();
      return 'handled';
    } else if (command === 'myeditor-italic') {
      console.log('ITALIC!!')
      this._onItalicClick();
      return 'handled';
    } else if (command === 'myeditor-underline') {
      console.log('UNDERLINE!!');
      this._onUnderlineClick();
      return 'handled';
    }
    return 'not-handled';
  }

  render() {
    return (
      <div style={editorBoxStyle}>
        <select id="fontColor" onChange={() => this._onFontColorClick()}>
            {colors.map(color => (<option value={color}> {color} </option>))}
        </select>
        <select id="fontStyle" onChange={() => this._onFontStyleClick()}>
            {fonts.map(font => (<option value={font}> {font} </option>))}
        </select>
        <select id="fontSize" onChange={() => this._onFontSizeClick()}>
            {sizes.map(size => (<option value={size}> {size} </option>))}
        </select>
        <button onClick={this._onBoldClick.bind(this)}>Bold</button>
        <button onClick={this._onItalicClick.bind(this)}>Italics</button>
        <button onClick={this._onCodeClick.bind(this)}>Code</button>
        <button onClick={this._onUnderlineClick.bind(this)}>Underline</button>
        <button onClick={this._onLeftAlignClick.bind(this)}>align-left</button>
        <button onClick={this._onCenterAlignClick.bind(this)}>align-center</button>
        <button onClick={this._onRightAlignClick.bind(this)}>align-right</button>
        <button onClick={this._onULClick.bind(this)}>UL</button>
        <button onClick={this._onOLClick.bind(this)}>OL</button>
        <Editor
          editorState={this.state.editorState}
          handleKeyCommand={this.handleKeyCommand}
          keyBindingFn={myKeyBindingFn}
          onChange={this.onChange}
          blockRenderMap={extendedBlockRenderMap}
          blockStyleFn={this._blockRenderMapFn}
        />
        <button onClick={() => this.props.saveDocument(convertToRaw(this.state.editorState.getCurrentContent()))}>Save</button>
      </div>

    )
  }
}

export default MyEditor;
