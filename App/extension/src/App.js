import React, { useEffect, useState, useRef } from 'react';
import { Router, getComponentStack } from 'react-chrome-extension-router';
import { Provider, useSelector } from 'react-redux';

import './App.css';
import Timer from './components/Timer.js';
import useAuth from './hooks/useAuth.js';
import store from './redux/store.js';

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

const App = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const { getUser } = useAuth();

  useEffect(() => {
    getUser()
  },[]);

  return (
    <div>
      <Router>
        <Timer isAuthenticated={isAuthenticated} />
      </Router>
    </div>
  );
};

export default AppWrapper;
