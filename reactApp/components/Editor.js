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
import io from 'socket.io-client'

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
      socket: io('http://localhost:3000'),
      editorState: EditorState.createEmpty(),
      interval: () => ''
    };

    this.onChange = (editorState) => {
      this.setState({editorState: editorState})
      this.state.socket.emit('documentChange', convertToRaw(editorState.getCurrentContent()))


      //when a user highlights something have it come up on everyone else's screen
      this.state.socket.emit('highlight', editorState.getSelection())

    };
  }

  _onClick(toggleType, style) {
    console.log('toggleType:', toggleType, 'style:', style);
    if (toggleType === 'inline') {
      this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, style));
    } else {
      this.onChange(RichUtils.toggleBlockType(this.state.editorState, style));
    }

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

  componentDidMount() {
    this.state.socket.on('connect', () => {
      console.log("connected on the client side");
      this.state.socket.on('documentChange', (currentContent) => {
        this.setState({editorState: EditorState.moveSelectionToEnd(EditorState.createWithContent(convertFromRaw(currentContent)))});
      })

      this.state.socket.on('highlight', (selection) => {
        //handle user highlighting something here
      })
    })
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
      this._onClick('inline', 'BOLD')
      return 'handled';
    } else if (command === 'myeditor-italic') {
      console.log('ITALIC!!')
      this._onClick('inline', 'ITALIC')
      return 'handled';
    } else if (command === 'myeditor-underline') {
      console.log('UNDERLINE!!');
      this._onClick('inline', 'UNDERLINE')
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
        <button onClick={this._onClick.bind(this, 'inline', 'BOLD')}>Bold</button>
        <button onClick={this._onClick.bind(this, 'inline', 'ITALIC')}>Italics</button>
        <button onClick={this._onClick.bind(this, 'inline', 'CODE')}>Code</button>
        <button onClick={this._onClick.bind(this, 'inline', 'UNDERLINE')}>Underline</button>
        <button onClick={this._onClick.bind(this, 'block', 'unordered-list-item')}>UL</button>
        <button onClick={this._onClick.bind(this, 'block', 'ordered-list-item')}>OL</button>
        <button onClick={this._onClick.bind(this, 'block', 'align-left')}>align-left</button>
        <button onClick={this._onClick.bind(this, 'block', 'align-center')}>align-center</button>
        <button onClick={this._onClick.bind(this, 'block', 'align-right')}>align-right</button>
        <Editor
          editorState={this.state.editorState}
          handleKeyCommand={this.handleKeyCommand}
          keyBindingFn={myKeyBindingFn}
          onChange={this.onChange}
          blockRenderMap={extendedBlockRenderMap}
          blockStyleFn={this._blockRenderMapFn}
          customStyleMap={styleMap}
        />
        <button onClick={() => this.props.saveDocument(convertToRaw(this.state.editorState.getCurrentContent()))}>Save</button>
        <button onClick={() => this.props.history.push('/revisionhistory/' + this.props.id)}>Revision History</button>
      </div>

    )
  }
}

export default MyEditor;
