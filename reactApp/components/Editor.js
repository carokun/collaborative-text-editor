import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import copy from 'copy-to-clipboard';
import io from 'socket.io-client';
import Alert from 'react-s-alert';

import 'draft-js/dist/Draft.css';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/flip.css';

import {CompositeDecorator,
        convertToRaw,
        convertFromRaw,
        Editor,
        EditorState,
        getDefaultKeyBinding,
        KeyBindingUtil,
        Modifier,
        RichUtils } from 'draft-js';
// these are custom styling constants & functions
const { extendedBlockRenderMap,
        blockRenderMapFn,
        styleMap,
        sizes,
        fonts,
        colors,
        paragraphs } = require('./stylingConsts');

const { hasCommandModifier } = KeyBindingUtil;
// import custom key binding function
const { myKeyBindingFn } = require('./keyBindingFn');


class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io('https://morning-badlands-13664.herokuapp.com/'),
      editorState: EditorState.createEmpty(),
      interval: () => '',
      searchInput: '',
      changingRegex: false,
      color: ''
    };
    this._onFontStyleClick = this._onFontStyleClick.bind(this);
    this._onHighlight = this._onHighlight.bind(this);
    this.onTab = (e) => this._onTab(e);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);

//////////////////////////////////// SOCKETS ////////////////////////////////////

  // client-side sockets, for easy collaboration between users
    this.state.socket.on('connect', () => {
      console.log("connected on the client side");
      // joins the room for the document
      this.state.socket.emit('join', {doc: this.props.id});
      // alerts that another user is viewing the document
      this.state.socket.on('userJoined', () => {
        console.log('user joined with color '+ this.state.color);
      });
      // alerts that another user stopped viewing the document
      this.state.socket.on('userLeft', () => {
        console.log('user left');
      });
      // assigns a color for this user's highlights and cursor
      this.state.socket.on('colorAssigned', (color) => {
        this.setState({ color: color });
      });
      // displays another user's selected text
      this.state.socket.on('highlight', (currentContent) => {
        this.setState({editorState: EditorState.createWithContent(convertFromRaw(currentContent))});
      });
      // displays another user's cursor
      this.state.socket.on('cursor', ({start, anchorKey, color}) => {
        console.log('here');
        this.trackMouse(start, anchorKey, color);
      });
      // updates document in realtime when changes are made by a collaborator
      this.state.socket.on('documentChange', (currentContent) => {
        this.setState({editorState: EditorState.createWithContent(convertFromRaw(currentContent))});
      });
    });

  }

////////////////////// COMPONENT MOUNT & UNMOUNT FUNCTIONS //////////////////////

  componentDidMount() {
    // onChange is triggered if something changes in the document
    // cursor tracking and highlighting handled here
    this.onChange = (editorState) => {
      // prevent going through entire onChange function if something is changing in Regex
      if (this.state.changingRegex) {
        this.setState({changingRegex: false});
        return;
      }

      // check out what is selected
      let selectionState = editorState.getSelection();
      // start of the selection
      let start = selectionState.getStartOffset();
      // end of the selection
      let end = selectionState.getEndOffset();
      // the block where the cursor is
      let anchorKey = selectionState.anchorKey;

      // if start & end of selection are the same, no text is selected
      if (start === end) {
        // update state
        this.setState({ editorState })
        this.state.socket.emit('documentChange', convertToRaw(editorState.getCurrentContent()))
        // untoggle the highlighting that was applied previously
        const newState = this._onHighlight(editorState);
        this.state.socket.emit('documentChange', convertToRaw(newState.getCurrentContent()))
        // track cursor in other windows
        this.state.socket.emit('cursor', {start, anchorKey, color: this.state.color});
      }
      // else text is selected
      else {
        // update state
        this.setState({ editorState })
        this.state.socket.emit('documentChange', convertToRaw(editorState.getCurrentContent()))
        // make selected text highlighted on other user's documents
        const newState = this._onHighlight(editorState);
        this.state.socket.emit('documentChange', convertToRaw(newState.getCurrentContent()))
      }
    };

    // autosave and update document
    const self = this;
    axios.get('https://morning-badlands-13664.herokuapp.com//document/' + this.props.id)
    .then(resp => {
      const parsed = EditorState.createWithContent(convertFromRaw(JSON.parse(resp.data.text)));
      self.onChange(parsed);
      // sets interval to autosave every 30s
      this.setState({ interval: setInterval(() => this.props.autoSaveDocument(convertToRaw(this.state.editorState.getCurrentContent())), 30000)})
    })
    .catch(err => {
      console.log("ERROR:", err);
    });

  }

  componentWillUnmount() {
    // stops auto-saving every 30s
    console.log('clearing');
    clearInterval(this.state.interval);
    // frees up the color for other users in room
    this.state.socket.emit('unmounting', this.state.color);
    // disconnects user from socket
    this.state.socket.disconnect();
  }

/////////////////////////////// STYLING FUNCTIONS ///////////////////////////////

/*  _onTab implements tab functionality for ordered & unordered lists
**  tab indents 4 spaces, shift + tab outdents 4 spaces
*/
  _onTab(e) {
      // sets tab to be 4 spaces
      const maxDepth = 4;
      this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
    }

/*
**  _onHighlight toggles the inline style to highlight in this user's assigned color
*/
  _onHighlight(editorState) {
     return RichUtils.toggleInlineStyle(editorState, 'highlight' + this.state.color);
  }

/*  _onClick toggles custom & supported block styles and supported inline styles
**  toggleType: 'block' or 'inline'
**  style: name of style to be applied, either supported by draft-js or defined in a custom style map
*/
  _onClick(toggleType, style) {
    if (toggleType === 'inline') {
      this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, style));
    } else {
      this.onChange(RichUtils.toggleBlockType(this.state.editorState, style));
    }
  }

/*
**  _onHeaderStyleClick implements heading block styling (h1 through h6)
*/
  _onHeaderStyleClick() {
    // get value currently selected in dropdown menu
    let e = document.getElementById('header');
    let style = e.options[e.selectedIndex].value;
    // calls _onClick to toggle style
    this._onClick('block', style);
  }

/*  _onFontStyleClick toggles custom inline styles (font color, size, and family)
**  selectId: id of the selection dropdown menu
**  arr: array of inline styles of a given category (color, size, family);
*/
  _onFontStyleClick(selectId, arr) {
    // get value currently selected in dropdown menu
    let e = document.getElementById(selectId);
    let toggledStyle = e.options[e.selectedIndex].value;
    // get editor state and selection state
    const { editorState } = this.state;
    const selection = editorState.getSelection();
    // remove all other inline styling of this type to avoid toggling conflicts
    const nextContentState = arr.reduce((contentState, style) => {
        return Modifier.removeInlineStyle(contentState, selection, style)
      }, editorState.getCurrentContent());
    let nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      'change-inline-style'
    );
    const currentStyle = editorState.getCurrentInlineStyle();
    // unset style override for current style
    if (selection.isCollapsed()) {
      nextEditorState = currentStyle.reduce((state, style) => {
        return RichUtils.toggleInlineStyle(state, style);
      }, nextEditorState);
    }
    // if this style is being toggled on, apply it
    if (!currentStyle.has(toggledStyle)) {
      nextEditorState = RichUtils.toggleInlineStyle(
        nextEditorState,
        toggledStyle
      );
    }
    // updates editor state
    this.onChange(nextEditorState);
  }

///////////////////////////////// KEY COMMANDS /////////////////////////////////

/*  handleKeyCommand handles keyboard commands
**  commands are returned by keyBindingFn, which is triggered by set key combinations
**  this then calls the functions associated with those key combos
*/
  handleKeyCommand(command: string): DraftHandleValue {
    if (command === 'myeditor-save') {
      this.props.saveDocument(convertToRaw(this.state.editorState.getCurrentContent()))
      console.log('SAVED!!')
      return 'handled';
    } else if (command === 'myeditor-bold') {
      this._onClick('inline', 'BOLD')
      return 'handled';
    } else if (command === 'myeditor-italic') {
      this._onClick('inline', 'ITALIC')
      return 'handled';
    } else if (command === 'myeditor-underline') {
      this._onClick('inline', 'UNDERLINE')
      return 'handled';
    } else if (command === 'myeditor-terminal') {
      this._onClick('block', 'terminal')
      return 'handled';
    }
    return 'not-handled';
  }

//////////////////// COMPOSITE DECORATORS (search & cursor) ////////////////////

/*
**  changeRegex enables search functionality within the document
*/
  changeRegex(e) {
    // bind this
    const self = this;
    // get current content
    const currentContent = this.state.editorState.getCurrentContent();
    // get the text of the search
    this.setState({searchInput: e.target.value});
    // set the default regex value to gibberish so it won't match anything by accident (since an empty string errors)
    // makes a regex for the search text
    const newRegex = new RegExp(e.target.value || 'djkfjskjdfkjasdjkfksdjfaksjdfkjsdfkjsdf', 'g');
    // the search decoration styling is defined here; this turns the matching text light blue
    const styles = {
      search: {
        color: 'rgba(98, 177, 254, 1.0)',
        direction: 'ltr',
        unicodeBidi: 'bidi-override',
      }
    };
    // wrap the matching text in a span and style it
    const SearchSpan = (props) => {
      return (
        <span style={styles.search} data-offset-key={props.offsetKey}>
          {props.children}
        </span>
      );
    };
    // define strategy for seaching through the document text to find matches to the regex
    const findWithRegex = function(regex, contentBlock, callback) {
      const text = contentBlock.getText();
      let matchArr, start;
      while ((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index;
        callback(start, start + matchArr[0].length);
      }
    }
    // calls the findWithRegex function with the regex of search text defined above as 'newRegex'
    const searchStrategy = function(contentBlock, callback, contentState) {
      findWithRegex(newRegex, contentBlock, callback);
    }
    // CompositeDecorator is built into draft-js and enables us to find & decorate strings
    // stragegy: searches through the document to find text that matches the search input
    // component: dictates how to wrap and style the pieces of text that match
    const searchDecorator = new CompositeDecorator([{
        strategy: searchStrategy,
        component: SearchSpan,
    }]);
    // ensures we don't go through the entire onChange function during this process
    this.setState({changeRegex: true});
    // updates editor state to include search decorator
    this.setState({editorState: EditorState.createWithContent(currentContent, searchDecorator)});
  }

/*  trackMouse displays the mouse position of collaborators as colored lines in the document, a la google docs
**  pos: position of cursor
**  anchorKey: block containing the cursor
**  color: this user's assigned color
**  similar method as search
*/
  trackMouse(pos, anchorKey, color) {
    // bind this
    const self = this;
    // get current content
    const currentContent = this.state.editorState.getCurrentContent();
    const newRegex = new RegExp('test', 'g')
    // the cursor decoration styling is defined here; this creates a 1px line in this user's color
    let styles = {
      cursor: {
        borderLeft: '1px solid ' + color,
        direction: 'ltr',
        unicodeBidi: 'bidi-override',
      }
    };
    // same as search; define search strategy and cursor decoration
    const cursorStrategy = function(contentBlock, callback, contentState) {
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
    const CursorSpan = (props) => {
      return (
        <span style={styles.cursor} data-offset-key={props.offsetKey}>
          {props.children}
        </span>
      );
    };
    // iterates through the document, finds the cursor, and decorates where the cursor is
    const cursorDecorator = new CompositeDecorator([{
        strategy: cursorStrategy,
        component: CursorSpan,
      }]);
    // ensures we don't go through the entire onChange function during this process
    this.setState({changeRegex: true});
    // updates editor state to contain the cursor decorator
    this.setState({editorState: EditorState.createWithContent(currentContent, cursorDecorator)});
  }

//////////////////////////////////// RENDER ////////////////////////////////////

  render() {
    let counter = 0;
    return (
      <div className="editor-container">
        <span className="fa fa-bars fa-2x document-return" onClick={this.props.documentReturnHandler}> </span>
        <span className="document-title">{this.props.documentTitle}</span>

        <span className="headerBar">
          <button className="toolbar-item toolbar-button" onClick={() => this.props.saveDocument(convertToRaw(this.state.editorState.getCurrentContent()))}>
            Save
          </button>
          <button className="toolbar-item toolbar-button" onClick={() => this.props.history.push('/revisionhistory/' + this.props.id)}>
            Revision History
          </button>
          <span className="toolbar-divider"> | </span>
          <input
            className='search'
            onChange={this.changeRegex.bind(this)}
            type="text"
            value={this.state.searchInput}
            placeholder="Search document"/>
          <i className="search-icon fa fa-search" aria-hidden="true"></i>
        </span>

        <div className="toolbar">
          <span className="toolbar-item" onClick={() => {
            copy(this.props.documentId);
            Alert.info("document id copied to clipboard!", {
              position: 'top',
              effect: 'flip',
              timeout: 10000,
              offset: 100
            });
          }}><i className="fa fa-clipboard fa-lg" aria-hidden="true"></i></span>

          <span className="toolbar-divider"> | </span>
          <select className="toolbar-selector" id="fontColor" onChange={() => this._onFontStyleClick("fontColor", colors)}>
              {colors.map(color => (<option key={counter++} value={color}> {color} </option>))}
          </select>

          <span className="toolbar-divider"> | </span>
          <select className="toolbar-selector" id="fontFamily" onChange={() => this._onFontStyleClick("fontFamily", fonts)}>
              {fonts.map(font => (<option className="toolbar-selector-content" key={counter++} value={font}> {font} </option>))}
          </select>
          <select className="toolbar-selector" id="fontSize" onChange={() => this._onFontStyleClick("fontSize", sizes)}>
              {sizes.map(size => (<option className="toolbar-selector-content" key={counter++} value={size}> {size} </option>))}
          </select>

          <span className="toolbar-divider"> | </span>
          <select className="toolbar-selector" id="header" onChange={() => this._onHeaderStyleClick()}>
              {paragraphs.map(p => (<option className="toolbar-selector-content" key={counter++} value={p}> {p} </option>))}
          </select>

          <span className="toolbar-divider"> | </span>
          <button className="toolbar-item" onClick={() => this._onClick('inline', 'BOLD')}><i className="fa fa-bold fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={() => this._onClick('inline', 'ITALIC')}><i className="fa fa-italic fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={() => this._onClick('inline', 'UNDERLINE')}><i className="fa fa-underline fa-lg" aria-hidden="true"></i></button>

          <span className="toolbar-divider"> | </span>
          <button className="toolbar-item" onClick={() => this._onClick('block', 'unordered-list-item')}><i className="fa fa-list-ul fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={() => this._onClick('block', 'ordered-list-item')}><i className="fa fa-list-ol fa-lg" aria-hidden="true"></i></button>

          <span className="toolbar-divider"> | </span>
          <button className="toolbar-item" onClick={() => this._onClick('block', 'align-left')}><i className="fa fa-align-left fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={() => this._onClick('block', 'align-center')}><i className="fa fa-align-center fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={() => this._onClick('block', 'align-right')}><i className="fa fa-align-right fa-lg" aria-hidden="true"></i></button>

          <span className="toolbar-divider"> | </span>
          <button className="toolbar-item" onClick={() => this._onClick('block', 'code')}><i className="fa fa-code fa-lg" aria-hidden="true"></i></button>
          <button className="toolbar-item" onClick={() => this._onClick('block', 'terminal')}><i className="fa fa-terminal fa-lg" aria-hidden="true"></i></button>
        </div>

        <div className="document-editor">
          <div className="editor-padding">
            <div className="editor-text">
              <Editor
                blockRenderMap={extendedBlockRenderMap}
                blockStyleFn={blockRenderMapFn}
                customStyleMap={styleMap}
                editorState={this.state.editorState}
                handleKeyCommand={this.handleKeyCommand}
                keyBindingFn={myKeyBindingFn}
                onChange={this.onChange}
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
