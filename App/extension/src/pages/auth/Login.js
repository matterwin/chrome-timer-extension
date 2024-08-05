import React, { useState } from 'react';
import './auth.css';
import {
  goBack,
  goTo,
  popToTop,
  Link,
  Router,
  getCurrent,
  getComponentStack,
} from 'react-chrome-extension-router';

import Timer from '../../components/Timer.js';
import useAuth from '../../hooks/useAuth.js';

const Login = (isAuthenticated) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerUser, signInUser } = useAuth();

  const [choseSignIn, setChoseSignIn] = useState(true);

  const signIn = async () => {
    setLoading(true);
    try {
      const res = await signInUser(email, password);
      if (res.status === 200) {
        popToTop(); 
      } else {
        setLoading(false);
        alert(res.error);
      }
    } catch (e) {
      console.log(e);
      alert('Invalid creds');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    setLoading(true);
    try {
      await registerUser(email, password);
    } catch (e) {
      console.log(e);
      alert('Sign up failed')
    } finally {
      setLoading(false);
      goTo(Timer, { isAuthenticated });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (choseSignIn) signIn();
    else signUp();
  };

  const handleBack = () => {
    goBack();
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{loading ? 'Loading...' : 'Sign In'}</button>
        <button onClick={() => setChoseSignIn(false)} type="submit">Register</button>
        <button onClick={handleBack} type="button">Go back</button>
        <div><p>Forgot password?</p></div>
      </form>
    </div>
  );
};

export default Login;
