import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'

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
      if(resp.status === 200) {
        console.log('success', resp);
      } else {
        console.log('fail', resp);
      }
    })
    .catch(function (error) {
      console.log(error);
    });

    this.setState({ username: '', password: '' })
  }

  render() {
    return (
      <div className="login-page">
        <h2>Login</h2>
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
              <Link to='/register'>
                <button>Register</button>
              </Link>
            </div>
        </form>
      </div>
    );
  }
}

export default Login;
