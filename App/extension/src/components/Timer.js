import React, { useEffect, useState, useRef } from 'react';
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
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import Tooltip from '@mui/material/Tooltip';
import CToolTip from './CToolTip.js';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded';

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
    saveTimer,
    countDown,
    countUp
  } = useTimer();

  const [timerInput, setTimerInput] = useState(timer);
  const [userWantsToEditTimer, setUserWantsToEditTimer] = useState(false);
  const [isCountingUp, setIsCountingUp] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const {
    signOutUser
  } = useAuth();

  const handleStart = () => {
    if (currentlyRunning) {
      // maybe check if timerinput is also satifised and just call update time or some shit in backgroundjs
      if (isCountingUp) {
        // send back timer or some shit
      } else {

      }

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
    handleStop(); 
    // saveTimer();
  };

  const handleFolders = () => {
    goTo(FileSystem);
  };

  const handleAuth = () => {
    goTo(Login, { isAuthenticated })
  };

  const handleCountingSwitch = () => {
    setIsCountingUp(!isCountingUp);
    handleReset();
    if (isCountingUp) {
      countDown(3600);
      // inputRef.current.focus();
      // handleCountDown
    } else {
      countUp();
      // handleCountUp
    }
  };

  const handleTimeChange = (event) => {
    setTimerInput(event.target.value); 
  };

  const handleTimerEditClicked = () => {
    handleStop();
    setTimerInput(timer);
    setUserWantsToEditTimer(true);
    inputRef.current.focus();
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false); 
  };

  return (
    <div className="centerScreenDiv">
      <div className="centerContent" style={{ padding: '150px' }}>
        <div>
          <CToolTip 
            title={isCountingUp ? "Count Down" : "Count Up"} 
            color="#f8f8f8" 
            textColor="black" 
            placement="top"
          >
            <input
              ref={inputRef}
              className="timerId"
              type="text"
              value={isFocused ? timerInput : timer}
              onChange={handleTimeChange}
              onClick={handleTimerEditClicked}
              style={{
                opacity: currentlyRunning ? 1 : 0.7, 
                background: 'none', 
                border: 'none', 
                outline: 'none', 
                textAlign: 'center', 
                width: '100%' 
              }}
              onFocus={handleInputFocus}  
              onBlur={handleInputBlur}
            />
          </CToolTip>
        </div>
        <div className="buttonsDiv">
          <Fab 
            sx={{ 
              bgcolor: currentlyRunning ? 'red' : 'green', 
              border: '2px solid',
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
              border: '2px solid #5a5a5a',
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
          <CToolTip 
            title={isCountingUp ? "Count Down" : "Count Up"} 
            color="#f8f8f8" 
            textColor="black" 
            placement="top"
          >
            <Fab 
              sx={{ 
                bgcolor: 'grey', 
                color: '#2a3439',
                borderRadius: '100%',
                border: '2px solid #5a5a5a',
                '&:hover': {
                  bgcolor: '#EEE800',
                },
                margin: '0 10px'
              }} 
              aria-label='Counting Switch' 
              onClick={handleCountingSwitch}
            >
              {isCountingUp ?
                <KeyboardDoubleArrowDownRoundedIcon sx={{ fontSize: '35px' }}/> 
                :
                <KeyboardDoubleArrowUpRoundedIcon sx={{ fontSize: '35px' }}/>
              }
            </Fab>
          </CToolTip>
          {isAuthenticated &&
            <>
              <CToolTip title="File System" color="#f8f8f8" textColor="black" placement="top">
                <Fab 
                  sx={{ 
                    bgcolor: 'grey', 
                    color: '#2a3439',
                    borderRadius: '100%',
                    border: '2px solid #5a5a5a',
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
              </CToolTip>
              <CToolTip title="Save time" color="#f8f8f8" textColor="black" placement="top">
                <Fab 
                  sx={{ 
                    bgcolor: timer !== '00 00 00' ? '#EEE8AA' : 'grey', 
                    color: timer !== '00 00 00' ? 'grey' : '#2a3439',
                    borderRadius: '100%',
                    border: '2px solid #5a5a5a',
                    '&:hover': {
                      bgcolor: '#EEE800',
                    },
                    margin: '0 10px'
                  }} 
                  aria-label="Save" 
                  onClick={handleSave}
                >
                  {timer === '00 00 00' ? 
                    <FileDownloadOffRoundedIcon sx={{ fontSize: '35px' }}/>
                  : <FileDownloadRoundedIcon sx={{ fontSize: '35px' }}/>
                  }
                </Fab>
              </CToolTip>
            </>
          }
          {!isAuthenticated && 
            <Fab 
              sx={{ 
                bgcolor: 'grey', 
                color: '#2a3439',
                borderRadius: '100%',
                border: '2px solid #5a5a5a',
                '&:hover': {
                  bgcolor: '#EEE800',
                  color: 'grey'
                },
                margin: '0 10px',
                textTransform: 'none'
              }} 
              aria-label="Login" 
              onClick={handleAuth}
            >
              Login              
            </Fab>
          }
        </div>
        {isAuthenticated && 
          <CToolTip title="Sign out" color="#f8f8f8" textColor="black" placement="bottom">
            <Fab 
              sx={{ 
                bgcolor: 'transparent', 
                color: 'grey',
                borderRadius: '100%',
                '&:hover': {
                  bgcolor: '#EEE800',
                },
                margin: '0 10px'
              }} 
              aria-label="Sign out" 
              onClick={() => signOutUser()}
            >
              <LogoutOutlinedIcon sx={{ fontSize: '35px' }}/>
            </Fab>
          </CToolTip>
        }
      </div>
    </div>
  );
};

export default Timer;
