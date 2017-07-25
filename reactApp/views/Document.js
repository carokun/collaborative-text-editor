import React from 'react';
import MyEditor from '../components/Editor';
import { Link } from 'react-router-dom';

class Document extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="editor-page">
                <h2>Edit Document</h2>
                <MyEditor />
                <Link to='/documentlist'>
                    <button className="blue-button">Register</button>
                </Link>
            </div>
        )
    }
}

export default Document;