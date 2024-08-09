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
        if (msg.action === 'signInUserResponse') {
          if (msg.status === 200) {
            dispatch(loginSuccess(msg.accessToken));
            return { status: msg.status, accessToken: msg.accessToken };
          } else {
            return { status: msg.status, error: msg.error };
          }
        }

        if (msg.action === 'registerUserResponse') {
          if (msg.status === 201) {
            dispatch(loginSuccess(msg.accessToken));
            return { status: msg.status, accessToken: msg.accessToken};
          } else {
            return { status: msg.status, error: msg.error };
          }
        }

        if (msg.action === 'setUser') {
          if (msg.status === 200) {
            dispatch(loginSuccess(msg.accessToken));
          }
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
    return new Promise((resolve) => {
      portRef.current.onMessage.addListener((msg) => {
        if (msg.action === 'registerUserResponse') {
          resolve(msg);
        }
      });
    });
  };

  const signInUser = (email, password) => {
    connectPort();
    portRef.current?.postMessage({
      action: 'signInUser',
      email: email,
      password: password
    });
    return new Promise((resolve) => {
      portRef.current.onMessage.addListener((msg) => {
        if (msg.action === 'signInUserResponse') {
          resolve(msg);
        }
      });
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

  const signInWithGoogle = () => {
    connectPort();
    portRef.current?.postMessage({ action: 'signInWithGoogle' });
  };

  return {
    registerUser,
    signInUser,
    signOutUser,
    getUser,
    signInWithGoogle
  };
};

export default useAuth;

