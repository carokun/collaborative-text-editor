import React from 'react';
import MyEditor from '../components/Editor';

class Document extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                <h2>Edit Document</h2>
                <MyEditor />
            </div>
        )
    }
}

export default Document;