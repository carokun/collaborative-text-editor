import React from 'react';
import MyEditor from '../components/Editor';
import axios from 'axios';
import Alert from 'react-s-alert';
import { Link } from 'react-router-dom';
import { Editor, EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/flip.css';


class DocumentPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          title: 'Loading...',
        }
    }
    componentWillMount() {
      axios.get('https://morning-badlands-13664.herokuapp.com//document/' + this.props.match.params.id)
      .then(resp => {
        console.log(this.props.match.params.id);
        this.setState({
          title: resp.data.title
        });
      })
      .catch(err => {
        console.log("ERROR: Cannot retrieve document using axios request ", err);
      });
    }

    saveDocument(newState) {
      axios.post('https://morning-badlands-13664.herokuapp.com//saveDocument', {
        text: newState,
        id: this.props.match.params.id,
        newRevision: {
          revision: JSON.stringify(newState),
          date: new Date()
        }
      })
      .then(resp => {
        if (resp.status === 200) {
          console.log('success');
          Alert.info("document has been saved!", {
            position: 'top',
            effect: 'flip',
            timeout: 10000,
            offset: 100
          })
        }
      })
      .catch(err => {
        console.log("ERROR: Cannot retrieve document using axios request ", err);
      });
    }

    autoSaveDocument(newState) {
      axios.post('https://morning-badlands-13664.herokuapp.com//saveDocument', {
        text: newState,
        id: this.props.match.params.id
      })
      .then(resp => {
        if (resp.status === 200) {
          console.log('success');
        }
      })
      .catch(err => {
        console.log("ERROR: Cannot retrieve document using axios request ", err);
      });
    }

    render() {
        return (
            <div className="editor-page">
                  <MyEditor
                    id={this.props.match.params.id}
                    editorState={this.state.editorState}
                    saveDocument={this.saveDocument.bind(this)}
                    autoSaveDocument={this.autoSaveDocument.bind(this)}
                    history={this.props.history}
                    documentReturnHandler={() => this.props.history.push('/documentlist')}
                    documentTitle={this.state.title}
                    documentId={this.props.match.params.id}
                  />
                  <Alert stack={{limit: 1}} />
            </div>
        )
    }
}

export default DocumentPage;
