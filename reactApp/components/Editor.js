import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import 'draft-js/dist/Draft.css';
import {RichUtils,
        Editor,
        EditorState,
        convertToRaw,
        DefaultDraftBlockRenderMap,
        convertFromRaw,
        getDefaultKeyBinding,
        KeyBindingUtil,
        Modifier } from 'draft-js';
const { editorBoxStyle,
        blockRenderMap,
        styleMap,
        sizes,
        fonts,
        colors } = require('./stylingConsts');
const { hasCommandModifier } = KeyBindingUtil;
const { myKeyBindingFn } = require('./keyBindingFn');
import io from 'socket.io-client'

const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);


class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io('http://localhost:3000'),
      editorState: EditorState.createEmpty(),
      interval: () => ''
    };
    this.onTab = (e) => this._onTab(e);
    this._onStyleClick = this._onStyleClick.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.onChange = (editorState) => {
      this.setState({editorState: editorState})
      this.state.socket.emit('documentChange', convertToRaw(editorState.getCurrentContent()))
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
        this.setState({editorState: EditorState.createWithContent(convertFromRaw(currentContent))});
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

  _onTab(e) {
      const maxDepth = 4;
      this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
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
        <i className="fa fa-bold" aria-hidden="true" onClick={this._onClick.bind(this, 'inline', 'BOLD')}></i>
        <i className="fa fa-italic" aria-hidden="true" onClick={this._onClick.bind(this, 'inline', 'ITALIC')}></i>
        <i className="fa fa-code" aria-hidden="true" onClick={this._onClick.bind(this, 'inline', 'CODE')}></i>
        <i className="fa fa-underline" aria-hidden="true" onClick={this._onClick.bind(this, 'inline', 'UNDERLINE')}></i>
        <i className="fa fa-list-ul" aria-hidden="true" onClick={this._onClick.bind(this, 'block', 'unordered-list-item')}></i>
        <i className="fa fa-list-ol" aria-hidden="true" onClick={this._onClick.bind(this, 'block', 'ordered-list-item')}></i>
        <i className="fa fa-align-left" aria-hidden="true" onClick={this._onClick.bind(this, 'block', 'align-left')}></i>
        <i className="fa fa-align-center" aria-hidden="true" onClick={this._onClick.bind(this, 'block', 'align-center')}></i>
        <i className="fa fa-align-right" aria-hidden="true" onClick={this._onClick.bind(this, 'block', 'align-right')}></i>
        <Editor
          editorState={this.state.editorState}
          handleKeyCommand={this.handleKeyCommand}
          keyBindingFn={myKeyBindingFn}
          onChange={this.onChange}
          blockRenderMap={extendedBlockRenderMap}
          blockStyleFn={this._blockRenderMapFn}
          customStyleMap={styleMap}
          onTab={this.onTab}
        />
        <button onClick={() => this.props.saveDocument(convertToRaw(this.state.editorState.getCurrentContent()))}>Save</button>
      </div>

    )
  }
}

export default MyEditor;
