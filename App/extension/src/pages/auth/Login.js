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
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import ForwardRoundedIcon from '@mui/icons-material/ForwardRounded';
import GoogleButton from '../../components/custom/GoogleButton.js';
import TextField from '@mui/material/TextField';
import { useSelector } from 'react-redux';

import toastr from '../../config/toasterConfig.js';
import Timer from '../../components/Timer.js';
import useAuth from '../../hooks/useAuth.js';
import { register } from '../../api/handleAuth.js';

const Login = (isAuthenticated) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerUser, signInUser, signInWithGoogle } = useAuth();
  const token = useSelector(state => state.auth.accessToken);

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
      const res = await registerUser(email, password);
      if (res.status === 201) {
        const result = await register(res.accessToken);
        if (result.status === 201) {
          toastr.success('Welcome to timer');
          popToTop();
        }
      } else {
        setLoading(false);
        toastr.error(res.error);
      }
    } catch (e) {
      setLoading(false);
      toastr.error('There was an error on our end. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      toastr.error('Invalid email structure.');
      return;
    }
    
    signUp();
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
        <div className="center" style={{ width: '350px' }}>
          <div style={{ marginBottom: '15px' }}>
            <h1 style={{ color: 'white' }}>Timer App</h1>
          </div>
          <div>
            <GoogleButton signInWithGoogle={signInWithGoogle} />
          </div>
          <div className="longDashContainer">
            <div class="longdash"></div>
            <h2 style={{ color: 'grey' }}> or </h2>
            <div class="longdash"></div>
          </div>
          <form onSubmit={handleSubmit}>
            <RedditTextField
              label="Email"
              id="reddit-input"
              variant="filled"
              style={{ marginTop: 11, width: '100%' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <RedditTextField
              label="Password"
              type="password"
              id="reddit-input"
              variant="filled"
              style={{ marginTop: 7, marginBottom: 11, width: '100%' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button 
              type="submit"
              variant="outlined"
              sx={{
                height: '50px',
                backgroundColor: 'green',
                color: 'white', 
                fontWeight: '700',
                borderColor: 'limegreen', 
                '&:hover': {
                  borderColor: 'limegreen', 
                  backgroundColor: 'darkgreen' 
                },
                textTransform: 'none'
              }}
            >
              Log in
            </Button>
            <div className="center"><p style={{ color: 'white' }}>Forgot password?</p></div>
            <Button 
              type="submit"
              variant="outlined"
              sx={{
                marginTop: '25px',
                opacity: '0.7',
                height: '50px',
                backgroundColor: 'transparent',
                color: 'grey', 
                border: '1px solid grey', 
                '&:hover': {
                  borderColor: 'limegreen', 
                  backgroundColor: 'darkgreen',
                  color: '#fffff0',
                  opacity: '1.0'
                },
                textTransform: 'none'
              }}
            >
              Create account
            </Button>
          </form>
              <Fab 
                variant="extended"
                sx={{ 
                  bgcolor: 'transparent', 
                  color: 'grey',
                  boxShadow: 'none',
                  borderRadius: '5px',
                  '&:hover': {
                    bgcolor: '#fffff0',
                  },
                  height: '40px',
                }} 
                aria-label='GoBack' 
                onClick={handleBack}
              >
                <ForwardRoundedIcon sx={{ transform: 'scaleX(-1)', fontSize: '30px' }}/>
                Go home
              </Fab>
        </div>
      }
    </div>
  );
};

export default Login;
