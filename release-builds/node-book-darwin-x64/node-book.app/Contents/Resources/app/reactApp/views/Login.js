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
    axios.post("https://morning-badlands-13664.herokuapp.com/login", {username: this.state.username, password: this.state.password})
    .then(resp => {
      if(resp.status === 200) {
        console.log('success', resp);
        this.props.history.push('/documentlist')
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
        <div className="login-wrapper">
        <img src='./img/nodebook-logo.svg'/>
        <h2>NodeBook</h2>
          <form action="/login" method="post" onSubmit={(event) => this.onSubmit(event)}>
            <p>Username</p>
            <input type="text" name="username" value={this.state.username} onChange={(e) => this.setState({username: e.target.value})}/>
            <p>Password</p>
            <input type="password" name="password" value={this.state.password} onChange={(e) => this.setState({password: e.target.value})}/>
            <button className="green-button" type="submit" value="Log In">Login</button>
            <Link to='/register'>
              <button className="blue-button">Register</button>
            </Link>
          </form>
        </div>
      </div>
    );
  }
}

export default Login;
