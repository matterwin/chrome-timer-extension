import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../redux/auth/authActions.js';

const useAuth = () => {
  const portRef = useRef(null);
  const dispatch = useDispatch();

  const connectPort = () => {
    if (!portRef.current) {
      const port = chrome.runtime.connect({ name: 'auth' });
      portRef.current = port;

      port.onMessage.addListener((msg) => {
        if (msg.action === "setUser" && msg.accessToken !== undefined) {
          dispatch(loginSuccess(msg.accessToken));
        } 
        
      });

      return () => {
        if (portRef.current) {
          portRef.current.disconnect();
        }
      };
    }
  };

  const registerUser = (email, password) => {
    connectPort();
    portRef.current?.postMessage({
      action: 'registerUser',
      email: email,
      password: password
    });
  };

  const signInUser = (email, password) => {
    connectPort();
    portRef.current?.postMessage({
      action: 'signInUser',
      email: email,
      password: password
    });
  };

  const signOutUser = () => {
    connectPort();
    dispatch(logout());
    portRef.current?.postMessage({ action: 'signOutUser' });
  };

  const getUser = () => {
    connectPort();
    portRef.current?.postMessage({ action: 'getUser' });
  };

  return {
    registerUser,
    signInUser,
    signOutUser,
    getUser
  };
};

export default useAuth;

