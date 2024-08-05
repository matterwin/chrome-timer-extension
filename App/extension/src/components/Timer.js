import React, { useEffect } from 'react';
import { goTo } from 'react-chrome-extension-router';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Divider from '@mui/material/Divider';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseTwoToneIcon from '@mui/icons-material/PauseTwoTone';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import FileDownloadOffRoundedIcon from '@mui/icons-material/FileDownloadOffRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';

import './Timer.css';
import useTimer from '../hooks/useTimer.js';
import useAuth from '../hooks/useAuth.js';
import FileSystem from '../pages/filesys/FileSystem.js';
import Login from '../pages/auth/Login.js';

const Timer = ({ isAuthenticated }) => {
  const { 
    timer, 
    currentlyRunning,
    setCurrentlyRunning,
    startTimer, 
    stopTimer, 
    resetTimer,
    saveTimer
  } = useTimer();

  const {
    signOutUser
  } = useAuth();

  const handleStart = () => {
    if (currentlyRunning) {
      handleStop();
    } else {
      startTimer();
      setCurrentlyRunning(true);
    }
  };

  const handleStop = () => {
    stopTimer();
    setCurrentlyRunning(false);
  };

  const handleReset = () => {
    if (timer !== '00 00 00') {
      resetTimer();
      setCurrentlyRunning(false);
    }
  };

  const handleSave = () => {
    saveTimer();
  };

  const handleFolders = () => {
    goTo(FileSystem);
  };

  const handleAuth = () => {
    goTo(Login, { isAuthenticated })
  };

  return (
    <div className="centerScreenDiv">
      <div className="centerContent">
        <h2 className="timerId" style={{ opacity: currentlyRunning ? 1 : 0.7 }}>{timer}</h2>
        <div className="buttonsDiv">
          <Fab 
            sx={{ 
              bgcolor: currentlyRunning ? 'red' : 'green', 
              border: '1px solid',
              borderColor: currentlyRunning ? 'orange' : 'limegreen',
              color: '#ffffff',
              borderRadius: '100%',
              '&:hover': {
                bgcolor: currentlyRunning ? 'darkred' : 'darkgreen',
              },
              margin: '0 10px'
            }} 
            aria-label={currentlyRunning ? 'Stop' : 'Start'} 
            onClick={handleStart}
          >
            {currentlyRunning ? 
              <PauseTwoToneIcon sx={{ fontSize: '35px' }}/> 
              : <PlayArrowRoundedIcon sx={{ fontSize: '40px' }}/>
            }
          </Fab>
          <Fab 
            sx={{ 
              bgcolor: timer !== '00 00 00' ? '#EEE8AA' : 'grey', 
              color: timer !== '00 00 00' ? 'grey' : '#2a3439',
              borderRadius: '100%',
              '&:hover': {
                bgcolor: '#EEE800',
              },
              margin: '0 10px'
            }} 
            aria-label='Reset' 
            onClick={handleReset}
          >
            <RestartAltRoundedIcon sx={{ fontSize: '35px' }}/>
          </Fab>
          {isAuthenticated ?  
            (<>
              <Fab 
                sx={{ 
                  bgcolor: 'grey', 
                  color: '#2a3439',
                  borderRadius: '100%',
                  '&:hover': {
                    bgcolor: '#EEE800',
                  },
                  margin: '0 10px'
                }} 
                aria-label="Folders" 
                onClick={handleFolders}
              >
                <FolderRoundedIcon sx={{ fontSize: '35px' }}/>
              </Fab>
              <Fab 
                sx={{ 
                  bgcolor: timer !== '00 00 00' ? '#EEE8AA' : 'grey', 
                  color: timer !== '00 00 00' ? 'grey' : '#2a3439',
                  borderRadius: '100%',
                  '&:hover': {
                    bgcolor: '#EEE800',
                  },
                  margin: '0 10px'
                }} 
                aria-label="Save" 
                onClick={handleReset}
              >
                {timer === '00 00 00' ? 
                  <FileDownloadOffRoundedIcon sx={{ fontSize: '35px' }}/>
                : <FileDownloadRoundedIcon sx={{ fontSize: '35px' }}/>
                }
              </Fab>
              <Fab 
                variant="extended"
                sx={{ 
                  bgcolor: timer !== '00 00 00' ? '#EEE8AA' : 'grey', 
                  color: timer !== '00 00 00' ? 'grey' : '#2a3439',
                  borderRadius: '100%',
                  '&:hover': {
                    bgcolor: '#EEE800',
                  },
                  margin: '0 10px'
                }} 
                aria-label="Save" 
                onClick={() => signOutUser()}
              >
                signout
              </Fab>
            </>) :
            (
              <Fab 
                sx={{ 
                  bgcolor: 'grey', 
                  color: '#2a3439',
                  borderRadius: '100%',
                  '&:hover': {
                    bgcolor: '#EEE800',
                  },
                  margin: '0 10px',
                  textTransform: 'none'
                }} 
                aria-label="Login" 
                onClick={handleAuth}
              >
                <svg
                  viewBox="-10 -50 500 500"
                  style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    width: '100%', 
                    height: '100%',
                    pointerEvents: 'none'
                  }}
                >
                  <path 
                    id="curve" 
                    fill="transparent"
                    d="M73.2,148.6c4-6.1,65.5-96.8,178.6-95.6c111.3,1.2,170.8,90.3,175.1,97" 
                  />
                  <text 
                    width="500" 
                    className="curvedText"
                    fill="#2a3439"
                  >
                    <textPath 
                      alignmentBaseline="top" 
                      xlinkHref="#curve"
                    >
                      Login
                    </textPath>
                  </text>
                </svg>
                <LoginRoundedIcon sx={{ fontSize: '35px' }}/>              
              </Fab>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default Timer;
