import React, { useEffect, useState, useRef } from 'react';
import { Router, getComponentStack } from 'react-chrome-extension-router';
import { Provider, useSelector } from 'react-redux';

import '../src/assets/fonts/fonts.css';
import './App.css';
import Timer from './components/Timer.js';
import store from './redux/store.js';

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

const App = () => {
  return (
    <div>
      <Router>
        <Timer />
      </Router>
    </div>
  );
};

export default AppWrapper;
