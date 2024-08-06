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
import { MutatingDots } from 'react-loader-spinner'
import RedditTextField from '../../components/custom/RedditTextField.js';
import FormControl from '@mui/material/FormControl';

import toastr from '../../config/toasterConfig.js';
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
        toastr.success('Signed in successfully!');
        popToTop(); 
      } else {
        setLoading(false);
        toastr.error(res.error);
      }
    } catch (e) {
      setLoading(false);
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
      {loading && 
        <MutatingDots
        visible={true}
        height="100"
        width="100"
        color="red"
        secondaryColor="green"
        radius="12.5"
        ariaLabel="mutating-dots-loading"
        wrapperStyle={{}}
        wrapperClass=""
        />
      }
      {!loading &&
        <div className="center">
          <form onSubmit={handleSubmit} className="login-form">
            <h2 style={{ color: 'white' }}>Login</h2>
            <RedditTextField
              label="Email"
              id="reddit-input"
              variant="filled"
              style={{ marginTop: 11 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <RedditTextField
              label="Password"
              type="password"
              id="reddit-input"
              variant="filled"
              style={{ marginTop: 7, marginBottom: 11 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign In</button>
            <button onClick={() => setChoseSignIn(false)} type="submit">Register</button>
            <button onClick={handleBack} type="button">Go back</button>
            <div><p>Forgot password?</p></div>
            <div><p>Create account</p></div>
          </form>
          <div><p>Login with Google</p></div>
        </div>
      }
    </div>
  );
};

export default Login;
