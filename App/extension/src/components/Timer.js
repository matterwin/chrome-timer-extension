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
    hour, setHour,
    min, setMin,
    sec, setSec,
    currentlyRunning,
    setCurrentlyRunning,
    startTimer, 
    stopTimer, 
    resetTimer,
    saveTimer,
    countDown,
    countUp
  } = useTimer();

  const [countDownAux, setCountDownAux] = useState(null);
  const [isCountingUp, setIsCountingUp] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const [tempValue, setTempValue] = useState('00');
  // tmp hold and onblur set it
  const hourRef = useRef(null);
  const minRef = useRef(null);
  const secRef = useRef(null);

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
    resetTimer();
    setCurrentlyRunning(false);
  };

  const switchToSeconds = () => {
    const hours = parseInt(hour, 10); 
    const minutes = parseInt(min, 10); 
    const seconds = parseInt(sec, 10); 

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (isCountingUp) {
      countUp(totalSeconds);
    } else {
      countDown(totalSeconds);
    }

    return totalSeconds;
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
    if (isCountingUp) {
      setIsCountingUp(false);
      secRef.current.focus();
    } else {
      countUp();
      setIsCountingUp(true);
    }
    handleReset();
  };

  const handleTimeChange = (event, setter) => {
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, "");
    let twoDigitValue = numericValue.slice(0, 2);

    setter(twoDigitValue);
  };

  const handleKeyDown = (event, refPrev, refNext) => {
    const cursorPosition = event.target.selectionStart;
    const inputLength = event.target.value.length;

    if (event.key === 'ArrowLeft' && cursorPosition === 0 && refPrev) {
      refPrev.current.focus();
    } else if (event.key === 'ArrowRight' && cursorPosition === inputLength && refNext) {
      refNext.current.focus();
    }
  };

  const handleInputFocus = (valueState) => {
    setCountDownAux(`${hour} ${min} ${sec}`);
    handleStop();
    setTempValue(valueState);
  };

  const handleInputBlur = (stateValue, setter) => {
    if (stateValue === "") {
      setter(tempValue);
      return;
    }


    if (!isCountingUp) {
      const formattedCurrentTime = `${hour} ${min} ${sec}`;
      if (formattedCurrentTime === countDownAux) return;
    }

    setCountDownAux(`${hour} ${min} ${sec}`);
    switchToSeconds();
  };

  const colors = () => {
    const formattedCurrentTime = `${hour} ${min} ${sec}`;
    if (isCountingUp) {
      return formattedCurrentTime !== '00 00 00';
    } else {
      return formattedCurrentTime !== countDownAux;
    }
  };

  return (
    <div className="centerScreenDiv">
      <div className="centerContent">
        <div className="timerRow">
          <div className="timerCol">
            <input
              ref={hourRef}
              className="timerId"
              type="text"
              value={hour}
              onChange={(e) => handleTimeChange(e, setHour)}
              onKeyDown={(e) => handleKeyDown(e, null, minRef)}
              style={{
                opacity: currentlyRunning ? 1 : 0.7, 
              }}
              onFocus={() => handleInputFocus(hour)}  
              onBlur={() => handleInputBlur(hour, setHour)}
            />
            <p className="timerIdentifer">hr</p>
          </div>
          <div className="timerCol">
            <input
              ref={minRef}
              className="timerId"
              type="text"
              value={min}
              onChange={(e) => handleTimeChange(e, setMin)}
              onKeyDown={(e) => handleKeyDown(e, hourRef, secRef)}
              style={{
                opacity: currentlyRunning ? 1 : 0.7, 
              }}
              onFocus={() => handleInputFocus(min)}  
              onBlur={() => handleInputBlur(min, setMin)}
            />
            <p className="timerIdentifer">min</p>
          </div>
          <div className="timerCol">
            <input
              ref={secRef}
              className="timerId"
              type="text"
              value={sec}
              onChange={(e) => handleTimeChange(e, setSec)}
              onKeyDown={(e) => handleKeyDown(e, minRef, null)}
              style={{
                opacity: currentlyRunning ? 1 : 0.7, 
              }}
              onFocus={() => handleInputFocus(sec)}  
              onBlur={() => handleInputBlur(sec, setSec)}
            />
            <p className="timerIdentifer">sec</p>
          </div>
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
              bgcolor: colors() ? '#EEE8AA' : 'grey', 
              color: colors() ? 'grey' : '#2a3439',
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
                    bgcolor: hour !== '00' && min !== '00' && sec !== '00' ? '#EEE8AA' : 'grey', 
                    color: hour !== '00' && min !== '00' && sec !== '00' ? 'grey' : '#2a3439',
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
                  {hour === '00' && min === '00' && sec === '00' ? 
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
