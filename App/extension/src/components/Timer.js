import React from 'react';
import './Timer.css';
import useBackgroundTimer from '../hooks/useBackgroundTimer';

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
    startTimer();
    setCurrentlyRunning(true);
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
    <div>
      <h2 id="timerId">{timer}</h2>
      {!currentlyRunning && <button onClick={handleStart}>Start</button>}
      {currentlyRunning && <button onClick={handleStop}>Stop</button>}
      <button onClick={handleReset}>Reset</button> 
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default Timer;
