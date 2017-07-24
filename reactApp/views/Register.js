import React from 'react';
import axios from 'axios';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      repeatPassword: ''
    }
  }

  onSubmit(event) {
    event.preventDefault();
    console.log('dpfdlkfjsdlf', process.env);
    axios.post("http://localhost:3000/register", {username: this.state.username, password: this.state.password, repeatPassword: password: this.state.repeatPassword})
    .then(resp => {
      if(resp.success) {
        this.props.navigation.navigate('/documentlist');
      }
    })
    .catch(function (error) {
      console.log(error);
    });

    this.setState({ username: '', password: '' })
  }

  render() {
    return (
      <form action="/login" method="post" onSubmit={(event) => this.onSubmit(event)}>
          <div>
              <label>Username:</label>
              <input type="text" name="username" value={this.state.username} onChange={(e) => this.setState({username: e.target.value})}/>
          </div>
          <div>
              <label>Password:</label>
              <input type="password" name="password" value={this.state.password} onChange={(e) => this.setState({password: e.target.value})}/>
          </div>
          <div>
              <label>Repeat Password:</label>
              <input type="password" name="repeatPassword" value={this.state.repeatPassword} onChange={(e) => this.setState({repeatPassword: e.target.value})}/>
          </div>
          <div>
              <input type="submit" value="Register"/>
          </div>
      </form>
    );
  }
}

export default Register;
