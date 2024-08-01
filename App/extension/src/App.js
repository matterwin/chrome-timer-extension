import React, { useEffect, useState } from 'react';
import { Router, getComponentStack } from 'react-chrome-extension-router';

import './App.css';
import Timer from './components/Timer.js';

const renderDefaultComponent = (showTimer) => {
  const components = getComponentStack();
  if (components.length === 0 && showTimer) {
    return <Timer />;
  }
  return null;
};

const App = () => {
  const [showTimer, setShowTimer] = useState(true);

  return (
    <div>
      <div>
        <Router>
          {renderDefaultComponent(showTimer)}
        </Router>
      </div>
    </div>
  );
};

export default App;
