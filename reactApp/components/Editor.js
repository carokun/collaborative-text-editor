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
const { blockRenderMap,
        styleMap,
        sizes,
        fonts,
        colors } = require('./stylingConsts');
const { hasCommandModifier } = KeyBindingUtil;
const { myKeyBindingFn } = require('./keyBindingFn');

import { Map } from 'immutable';

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
      let selectionState = editorState.getSelection();
      let start = selectionState.getStartOffset();
      let end = selectionState.getEndOffset();
      console.log(start, end);
      if (start - end === 0) {
        this.setState({editorState: editorState})
        this.state.socket.emit('documentChange', convertToRaw(editorState.getCurrentContent()))
      } else {
        // const newcontent = Modifier.replaceText({
        //   contentState: editorState.getCurrentContent(),
        //   rangeToReplace: editorState.getSelection(),
        //   text: "yo",
        // })
        // this.setState({editorState: EditorState.createWithContent(newcontent)})
        this.setState({editorState: editorState})
        editorState
        .getCurrentContent()
        .getBlockMap()
        .map(block => console.log(block))
        const newState = this._onHighlight(editorState);
        // this.setState({editorState: newState})
        this.state.socket.emit('documentChange', convertToRaw(newState.getCurrentContent()))
        this.state.socket.emit('highlight', convertToRaw(newState.getCurrentContent()))
        // this.state.socket.emit('documentChange', convertToRaw(newState.getCurrentContent()))
      }
      //when a user highlights something have it come up on everyone else's screen

    };
    this._onHighlight = this._onHighlight.bind(this);
  }

  _onClick(toggleType, style) {
    console.log('toggleType:', toggleType, 'style:', style);
    if (toggleType === 'inline') {
      this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, style));
    } else {
      this.onChange(RichUtils.toggleBlockType(this.state.editorState, style));
    }

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


  componentDidMount() {
    this.state.socket.on('connect', () => {
      console.log("connected on the client side");
      this.state.socket.on('documentChange', (currentContent) => {
        this.setState({editorState: EditorState.createWithContent(convertFromRaw(currentContent))});
      })

      this.state.socket.on('highlight', (currentContent) => {
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

  _onHighlight(editorState) {
     return RichUtils.toggleInlineStyle(editorState, 'highlight');
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
    let counter = 0;
    return (
      <div>
        <div className="toolbar">
          <select className="toolbar-selector toolbar-first" id="fontColor" onChange={() => this._onFontColorClick()}>
              {colors.map(color => (<option key={counter++} value={color}> {color} </option>))}
          </select>
          <span className="toolbar-divider"> | </span>
          <select className="toolbar-selector" id="fontStyle" onChange={() => this._onFontStyleClick()}>
              {fonts.map(font => (<option key={counter++} value={font}> {font} </option>))}
          </select>
          <select className="toolbar-selector" id="fontSize" onChange={() => this._onFontSizeClick()}>
              {sizes.map(size => (<option key={counter++} value={size}> {size} </option>))}
          </select>
          <span className="toolbar-divider"> | </span>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'inline', 'BOLD')}><i className="fa fa-bold fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'inline', 'ITALIC')}><i className="fa fa-italic fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'block', 'UNDERLINE')}><i className="fa fa-underline fa-lg" aria-hidden="true"></i></button>
          <span className="toolbar-divider"> | </span>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'block', 'unordered-list-item')}><i className="fa fa-list-ul fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'block', 'ordered-list-item')}><i className="fa fa-list-ol fa-lg" aria-hidden="true"></i></button>
          <span className="toolbar-divider"> | </span>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'block', 'align-left')}><i className="fa fa-align-left fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'block', 'align-center')}><i className="fa fa-align-center fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'block', 'align-right')}><i className="fa fa-align-right fa-lg" aria-hidden="true"></i></button>
          <span className="toolbar-divider"> | </span>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'inline', 'CODE')}><i className="fa fa-code fa-lg" aria-hidden="true"></i></button>
          <span className="toolbar-divider"> | </span>
          <button className="toolbar-item toolbar-button" onClick={() => this.props.saveDocument(convertToRaw(this.state.editorState.getCurrentContent()))}>Save</button>
          <button className="toolbar-item toolbar-button" onClick={() => this.props.history.push('/revisionhistory/' + this.props.id)}>Revision History</button>
        </div>
        <div className="document-editor">
          <div className="editor-padding">
            <div className="editor-text">
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
            </div>
          </div>
        </div>
        <div className="document-footer">v1.0</div>
      </div>

    )
  }
}

export default MyEditor;
