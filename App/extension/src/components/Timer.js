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

import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';

import './Timer.css';
import useTimer from '../hooks/useTimer.js';

const Timer = () => {
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
    countUp,
    countDownFinished, setCountDownFinished
  } = useTimer();

  const [countDownAux, setCountDownAux] = useState('00 00 00');
  const [isCountingUp, setIsCountingUp] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const [idle, setIdle] = useState(false);

  const [tempTimer, setTempTimer] = useState('00 00 00');
  const [tempValue, setTempValue] = useState('00');

  const hourRef = useRef(null);
  const minRef = useRef(null);
  const secRef = useRef(null);

  const handleStart = () => {
    if (currentlyRunning) {
      handleStop();
    } else {
      if (!isCountingUp && !countDownFinished && `${hour} ${min} ${sec}` === '00 00 00') return;

      startTimer();
      setCountDownFinished(false);
      setCurrentlyRunning(true);
    }
  };

  const handleStop = () => {
    stopTimer();
    setCurrentlyRunning(false);
  };

  const handleReset = () => {
    if (!isCountingUp) {
      if (!countDownFinished && `${hour} ${min} ${sec}` === countDownAux) {
        return;
      } 
    }
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

    let updatedValue;
    
    if (numericValue.length > 2) {
      updatedValue = numericValue.slice(-2);
    } else {
      updatedValue = numericValue;
    }

    setter(updatedValue);
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
    handleStop();
    handleMouseEnter();
    setTempValue(valueState);
    setTempTimer(`${hour} ${min} ${sec}`);
    setIsFocused(true);
  };

  const handleInputBlur = (stateValue, setter) => {
    handleMouseLeave();
    setIsFocused(false);
    if (stateValue === "" || stateValue === tempValue) {
      setter(tempValue);
      return;
    }

    if (!isCountingUp) {
      const formattedCurrentTime = `${hour} ${min} ${sec}`;
      if (formattedCurrentTime === tempTimer) return;
    }

    setCountDownAux(`${hour} ${min} ${sec}`);
    switchToSeconds();
  };

  const timeoutFadeId = useRef(null); 

  const handleMouseEnter = () => {
    setIdle(false); 
    if (timeoutFadeId.current) {
      clearTimeout(timeoutFadeId.current); 
    }
  };

  useEffect(() => {
    if (countDownFinished) {
      handleMouseEnter(); 
    }
  },[countDownFinished])

  const handleMouseLeave = () => {
    if (!countDownFinished && !isFocused) {
      timeoutFadeId.current = setTimeout(() => {
        setIdle(true);
      }, 7000); 
    }
  };

  const colors = () => {
    const formattedCurrentTime = `${hour} ${min} ${sec}`;
    const isAtZero = sec === '00' && min === '00' && hour === '00';
    if (isCountingUp) {
      return !isAtZero;
    } else {
      if (countDownFinished) return true;
      return !isAtZero && countDownAux !== formattedCurrentTime;
    }
  };

  const getBackgroundColorStartStop = () => {
    if (!isCountingUp && `${hour} ${min} ${sec}` === '00 00 00')
      return 'grey';
    return currentlyRunning ? 'red' : 'green';
  };

  const getBorderColorStartStop = () => {
    if (!isCountingUp && `${hour} ${min} ${sec}` === '00 00 00') 
      return '#5a5a5a';
    return currentlyRunning ? 'orange' : 'limegreen';
  };

  const getTextColorStartStop = () => {
    if (!isCountingUp && `${hour} ${min} ${sec}` === '00 00 00') 
      return '#2a3439';
    return '#fff';
  };

  return (
    <div className="centerScreenDiv" style={{ backgroundColor: countDownFinished ? 'red' : '#2a3439' }}>
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
        <div 
          className="buttonsDiv" 
          style={{ opacity: idle ? 0.05 : 1 }} 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Fab 
            sx={{ 
              bgcolor: getBackgroundColorStartStop(), 
              border: '2px solid',
              borderColor: getBorderColorStartStop(),
              color: getTextColorStartStop(),
              borderRadius: '50%',
              '&:hover': {
                bgcolor: currentlyRunning ? 'darkred' : 'darkgreen',
              },
              margin: '0 10px',
              minWidth: '50px',
              minHeight: '50px',
              maxWidth: '50px',
              maxHeight: '50px'
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
              bgcolor: 'grey', 
              color: colors() ? '#fff' : '#2a3439',
              borderRadius: '50%',
              border: '2px solid #5a5a5a',
              '&:hover': {
                bgcolor: 'darkgrey',
              },
              margin: '0 10px',
              minWidth: '50px',
              minHeight: '50px',
              maxWidth: '50px',
              maxHeight: '50px'
            }} 
            aria-label='Reset' 
            onClick={handleReset}
          >
            <RestartAltRoundedIcon sx={{ fontSize: '35px' }}/>
          </Fab>
          <CToolTip 
            title={isCountingUp ? "Counting Up" : "Counting Down"} 
            color="#f8f8f8" 
            textColor="black" 
            placement="top"
          >
            <Fab 
              sx={{ 
                bgcolor: 'grey', 
                color: '#2a3439',
                borderRadius: '50%',
                border: '2px solid #5a5a5a',
                '&:hover': {
                  bgcolor: 'darkgrey',
                },
                margin: '0 10px',
                minWidth: '50px',
                minHeight: '50px',
                maxWidth: '50px',
                maxHeight: '50px'
              }} 
              aria-label='Counting Switch' 
              onClick={handleCountingSwitch}
            >
              {isCountingUp ?
                <KeyboardDoubleArrowUpRoundedIcon sx={{ fontSize: '35px' }}/> 
                :
                <KeyboardDoubleArrowDownRoundedIcon sx={{ fontSize: '35px' }}/>
              }
            </Fab>
          </CToolTip>
        </div>
      </div>
    </div>
  );
};

export default Timer;
