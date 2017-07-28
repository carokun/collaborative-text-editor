import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import 'draft-js/dist/Draft.css';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/flip.css';
import {RichUtils,
        Editor,
        EditorState,
        convertToRaw,
        DefaultDraftBlockRenderMap,
        convertFromRaw,
        getDefaultKeyBinding,
        KeyBindingUtil,
        Modifier,
        CompositeDecorator } from 'draft-js';
const { blockRenderMap,
        styleMap,
        sizes,
        fonts,
        colors } = require('./stylingConsts');
const { hasCommandModifier } = KeyBindingUtil;
const { myKeyBindingFn } = require('./keyBindingFn');
import { Map } from 'immutable';
import copy from 'copy-to-clipboard';
import io from 'socket.io-client';
import Alert from 'react-s-alert';


const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);


class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io('http://localhost:3000'),
      editorState: EditorState.createEmpty(),
      interval: () => '',
      searchInput: '',
      changingRegex: false,
      color: ''
    };
    this.onTab = (e) => this._onTab(e);
    this._onStyleClick = this._onStyleClick.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);

    this._onHighlight = this._onHighlight.bind(this);

    this.state.socket.on('connect', () => {
      console.log("connected on the client side");

      this.state.socket.emit('join', {doc: this.props.id});

      this.state.socket.on('helloback', () => {
        console.log('hello back');
      })
      this.state.socket.on('userJoined', () => {
        console.log('user joined with color '+ this.state.color);
      })
      this.state.socket.on('colorAssigned', (color) => {
        console.log("ASSIGNED COLOR: ", color);
        this.setState({
          color: color
        })
      })
      this.state.socket.on('documentChange', (currentContent) => {
        this.setState({editorState: EditorState.createWithContent(convertFromRaw(currentContent))});
      })

      this.state.socket.on('highlight', (currentContent) => {
        this.setState({editorState: EditorState.createWithContent(convertFromRaw(currentContent))});
      })

      this.state.socket.on('userLeft', () => {
        console.log('user left');
      })

      this.state.socket.on('curser', ({start, anchorKey, color}) => {
        console.log('here');
        this.trackMouse(start, anchorKey, color);
        // this.setState({editorState: EditorState.createWithContent(this.state.editorState.getCurrentContent(), compositeDecorator)});
      })

    })
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
    if (type === 'terminal') {
      return 'terminal';
    }
    if (type === 'code') {
      return 'code';
    }
    return null;
  }


  componentDidMount() {
    this.onChange = (editorState) => {
      if (this.state.changingRegex) {
        this.setState({changingRegex: false});
        return;
      }
      let selectionState = editorState.getSelection();
      let start = selectionState.getStartOffset();
      let end = selectionState.getEndOffset();
      let anchorKey = selectionState.anchorKey;
      if (start - end === 0) {
        // editorState.push(this.addEmoji())
        this.setState({editorState: editorState})
        // this.addEmoji();
        this.state.socket.emit('documentChange', convertToRaw(editorState.getCurrentContent()))
        const newState = this._onHighlight(editorState);
        this.state.socket.emit('documentChange', convertToRaw(newState.getCurrentContent()))
        this.state.socket.emit('curser', {start, anchorKey, color: this.state.color});
        // this.trackMouse(start);
      } else {
        this.setState({editorState: editorState})
        this.state.socket.emit('documentChange', convertToRaw(editorState.getCurrentContent()))
        const newState = this._onHighlight(editorState);
        this.state.socket.emit('documentChange', convertToRaw(newState.getCurrentContent()))
        // console.log("COLOR: ", this.state.color);
        // const newState = RichUtils.toggleInlineStyle(this.state.editorState, 'highlight' + this.state.color);
        // this.state.socket.emit('highlight', convertToRaw(newState.getCurrentContent()));
      }
    };

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
    console.log('clearing');
    clearInterval(this.state.interval);
    this.state.socket.emit('unmounting', this.state.color);
    this.state.socket.disconnect();
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
     return RichUtils.toggleInlineStyle(editorState, 'highlight' + this.state.color);
 }

  handleKeyCommand(command: string): DraftHandleValue {
    if (command === 'myeditor-save') {
      this.props.saveDocument(convertToRaw(this.state.editorState.getCurrentContent()))
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
    } else if (command === 'myeditor-terminal') {
      this._onClick('block', 'terminal')
      return 'handled';
    }
    return 'not-handled';
  }

  changeRegex(e) {
    const self = this;
    this.setState({searchInput: e.target.value})
    const newRegex = new RegExp(e.target.value || 'djkfjskjdfkjasdjkfksdjfaksjdfkjsdfkjsdf', 'g')

    const currentContent = this.state.editorState.getCurrentContent();


    const styles = {
      handle: {
        color: 'rgba(98, 177, 254, 1.0)',
        direction: 'ltr',
        unicodeBidi: 'bidi-override',
      }
    };

    const handleStrategy = function(contentBlock, callback, contentState) {
      findWithRegex(newRegex, contentBlock, callback);
    }

    const findWithRegex = function(regex, contentBlock, callback) {
      const text = contentBlock.getText();
      let matchArr, start;
      while ((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index;
        callback(start, start + matchArr[0].length);
      }

    }

    const HandleSpan = (props) => {
      return (
        <span
          style={styles.handle}
          data-offset-key={props.offsetKey}
        >
          {props.children}
        </span>
      );
    };

    const compositeDecorator = new CompositeDecorator([
      {
        strategy: handleStrategy,
        component: HandleSpan,
      }
    ]);
    this.setState({changeRegex: true});
    this.setState({editorState: EditorState.createWithContent(currentContent, compositeDecorator)});
  }


  trackMouse(pos, anchorKey, color) {
    const self = this;
    const newRegex = new RegExp('test', 'g')

    const currentContent = this.state.editorState.getCurrentContent();

    let styles = {
      handle: {
        borderLeft: '1px solid ' + color,
        direction: 'ltr',
        unicodeBidi: 'bidi-override',
      }
    };

    const handleStrategy = function(contentBlock, callback, contentState) {
      findWithRegex(newRegex, contentBlock, callback);
    }

    const findWithRegex = function(regex, contentBlock, callback) {
      const text = contentBlock.getText();
      const key = contentBlock.getKey();
      let matchArr, start;

      if (text.length > pos && key === anchorKey) {
        callback(pos, pos + 1);
      }

    }
    const HandleSpan = (props) => {
      return (
        <span
          style={styles.handle}
          data-offset-key={props.offsetKey}
        >
          {props.children}
        </span>
      );
    };
    const compositeDecorator = new CompositeDecorator([
      {
        strategy: handleStrategy,
        component: HandleSpan,
      }
    ]);
    this.setState({changeRegex: true});

    this.setState({editorState: EditorState.createWithContent(currentContent, compositeDecorator)});
  }

  render() {
    let counter = 0;
    return (
      <div className="editor-container">
        <span className="fa fa-bars fa-2x document-return" onClick={this.props.documentReturnHandler}> </span>
        <span className="document-title">{this.props.documentTitle}</span>
        <div className="search">
          <span>Search</span>
          <input
            className="search-input"
            onChange={this.changeRegex.bind(this)}
            type="text"
            value={this.state.searchInput}
          />
        </div>
        <div className="toolbar">
          <span className="toolbar-item" onClick={() => {
            console.log('hi');
            copy(this.props.documentId);
            Alert.info("document id copied to clipboard!", {
              position: 'top',
              effect: 'flip',
              timeout: 10000,
              offset: 100
            })
          }}><i className="fa fa-clipboard fa-lg" aria-hidden></i></span>
          <span className="toolbar-divider"> | </span>
          <select className="toolbar-selector" id="fontColor" onChange={() => this._onFontColorClick()}>
              {colors.map(color => (<option key={counter++} value={color}> {color} </option>))}
          </select>
          <span className="toolbar-divider"> | </span>
          <select className="toolbar-selector" id="fontStyle" onChange={() => this._onFontStyleClick()}>
              {fonts.map(font => (<option className="toolbar-selector-content" key={counter++} value={font}> {font} </option>))}
          </select>
          <select className="toolbar-selector" id="fontSize" onChange={() => this._onFontSizeClick()}>
              {sizes.map(size => (<option className="toolbar-selector-content" key={counter++} value={size}> {size} </option>))}
          </select>
          <span className="toolbar-divider"> | </span>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'inline', 'BOLD')}><i className="fa fa-bold fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'inline', 'ITALIC')}><i className="fa fa-italic fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'inline', 'UNDERLINE')}><i className="fa fa-underline fa-lg" aria-hidden="true"></i></button>
          <span className="toolbar-divider"> | </span>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'block', 'unordered-list-item')}><i className="fa fa-list-ul fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'block', 'ordered-list-item')}><i className="fa fa-list-ol fa-lg" aria-hidden="true"></i></button>
          <span className="toolbar-divider"> | </span>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'block', 'align-left')}><i className="fa fa-align-left fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'block', 'align-center')}><i className="fa fa-align-center fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'block', 'align-right')}><i className="fa fa-align-right fa-lg" aria-hidden="true"></i></button>
          <span className="toolbar-divider"> | </span>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'block', 'code')}><i className="fa fa-code fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={this._onClick.bind(this, 'block', 'terminal')}><i className="fa fa-terminal fa-lg" aria-hidden="true"></i></button>
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
        <div className="editor-footer">-v1.0</div>
        <Alert stack={{limit: 2}} />
      </div>

    )
  }
}

export default MyEditor;
