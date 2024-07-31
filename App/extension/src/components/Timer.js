import React from 'react';
import './Timer.css';
import useBackgroundTimer from '../hooks/useBackgroundTimer';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Divider from '@mui/material/Divider';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseTwoToneIcon from '@mui/icons-material/PauseTwoTone';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

const Timer = () => {
  const { 
    timer, 
    currentlyRunning,
    setCurrentlyRunning,
    startTimer, 
    stopTimer, 
    resetTimer,
    saveTimer
  } = useBackgroundTimer();

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

  const handleSave = () => {
    saveTimer();
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
              color: 'white',
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
              : <PlayArrowRoundedIcon sx={{ fontSize: '35px' }}/>
            }
          </Fab>
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
            aria-label='Reset' 
            onClick={handleReset}
          >
            <RestartAltRoundedIcon sx={{ fontSize: '35px' }}/>
          </Fab>
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
            aria-label="Folders" 
            onClick={handleReset}
          >
            <FolderRoundedIcon sx={{ fontSize: '35px' }}/>
          </Fab>
          <Fab 
            sx={{ 
              bgcolor: '#EEE8AA', 
              color: 'grey',
              borderRadius: '100%',
              '&:hover': {
                bgcolor: '#EEE800',
              },
              margin: '0 10px'
            }} 
            aria-label="Save" 
            onClick={handleReset}
          >
            <DownloadRoundedIcon sx={{ fontSize: '35px' }}/>
          </Fab>
        </div>
      </div>
    </div>
  );
};

export default Timer;
