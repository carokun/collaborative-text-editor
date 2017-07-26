import React from 'react';
import ReactDOM from 'react-dom';
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
class TweetEditorExample extends React.Component {
  constructor() {
    super();
    const compositeDecorator = new CompositeDecorator([
      {
        strategy: handleStrategy,
        component: HandleSpan,
      },
      {
        strategy: hashtagStrategy,
        component: HashtagSpan,
      },
    ]);
    this.state = {
      editorState: EditorState.createEmpty(compositeDecorator),
      input: ''
    };
    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => this.setState({editorState});
    this.logState = () => console.log(this.state.editorState.toJS());
  }


  changeRegex(e) {
    this.setState({input: e.target.value})

    const newRegex = new RegExp(e.target.value, 'g')

    const currentContent = this.state.editorState.getCurrentContent();

    const handleStrategy = function(contentBlock, callback, contentState) {
      findWithRegex(newRegex, contentBlock, callback);
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

    this.setState({editorState: EditorState.createWithContent(currentContent, compositeDecorator)});
  }
  render() {
    return (
      <div>
        <div onClick={this.focus}>
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            placeholder="Write a tweet..."
            ref="editor"
            spellCheck={true}
          />
        </div>
        <input
          onClick={this.logState}
          type="button"
          value="Log State"
        />
        <input
          onChange={this.changeRegex.bind(this)}
          type="text"
          value={this.state.input}
        />
      </div>
    );
  }
}
/**
 * Super simple decorators for handles and hashtags, for demonstration
 * purposes only. Don't reuse these regexes.
 */
const HASHTAG_REGEX = /\#[\w\u0590-\u05ff]+/g;


function handleStrategy(contentBlock, callback, contentState) {
  findWithRegex(new RegExp('test', 'g'), contentBlock, callback);
}
function hashtagStrategy(contentBlock, callback, contentState) {
  findWithRegex(HASHTAG_REGEX, contentBlock, callback);
}
function findWithRegex(regex, contentBlock, callback) {
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
const HashtagSpan = (props) => {
  return (
    <span
      style={styles.hashtag}
      data-offset-key={props.offsetKey}
    >
      {props.children}
    </span>
  );
};
const styles = {
  handle: {
    color: 'rgba(98, 177, 254, 1.0)',
    direction: 'ltr',
    unicodeBidi: 'bidi-override',
  },
  hashtag: {
    color: 'rgba(95, 184, 138, 1.0)',
  },
};

export default TweetEditorExample;
