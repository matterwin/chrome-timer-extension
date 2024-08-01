import React, { useState } from 'react';
import {
  goBack,
  goTo,
  popToTop,
  Link,
  Router,
  getCurrent,
  getComponentStack,
} from 'react-chrome-extension-router';
import Fab from '@mui/material/Fab';
import ForwardRoundedIcon from '@mui/icons-material/ForwardRounded';

import useBackgroundTimer from '../../hooks/useBackgroundTimer.js';
import './FileSystem.css';

const Header = ({ path, setPath }) => {
  const { 
    timer,
    currentlyRunning
  } = useBackgroundTimer();

  const handleBackward = () => {
    goBack();
  };

  const handleGoToTimer = () => {
    popToTop();
  };

  return (
    <div className="headerDiv">
      <Fab 
        sx={{ 
          bgcolor: 'transparent', 
          color: '#2a3439',
          boxShadow: 'none',
          borderRadius: '100%',
          '&:hover': {
            bgcolor: 'grey',
          },
          margin: '0 10px'
        }} 
        aria-label='GoBack' 
        onClick={handleBackward}
      >
        <ForwardRoundedIcon sx={{ transform: 'scaleX(-1)', fontSize: '35px' }}/>
      </Fab> 
      <div style={{ paddingLeft: 5, paddingRight: 5, paddingTop: 2, paddingBottom: 2, backgroundColor: 'lightgrey', borderRadius: '5px' }}>
        <h3>{path}</h3>
      </div>
      <Fab 
        variant="extended"
        sx={{ 
          borderRadius: '5px',
          bgcolor: 'transparent', 
          color: '#2a3439',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: 'grey',
          },
          margin: '0 10px'
        }} 
        aria-label='Timer' 
        onClick={handleGoToTimer}
      >
        <p className="timerInFileSystem" style={{ opacity: currentlyRunning ? 1 : 0.7 }}>{timer}</p>
      </Fab>
    </div>
  );
};

const FileSystem = ({ timer }) => {
  const [path, setPath] = useState('root');

  return (
    <div>
      <Header path={path} />
      <h2>File System</h2>
    </div>
  );
};

export default FileSystem;
