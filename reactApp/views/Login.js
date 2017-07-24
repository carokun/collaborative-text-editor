import React from 'react';
import axios from 'axios';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    }
  }

  onSubmit(event) {
    event.preventDefault();
    axios.post("http://localhost:3000/login", {username: this.state.username, password: this.state.password})
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
              <input type="submit" value="Log In"/>
          </div>
          <div>
              <button onClick={() => this.props.navigation.navigate('/register')}>Register</button>
          </div>
      </form>
    );
  }
}

export default Login;
