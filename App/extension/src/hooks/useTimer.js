import { useState, useEffect, useRef } from 'react';

const useTimer = () => {
  const [timer, setTimer] = useState('00 00 00');
  const [currentlyRunning, setCurrentlyRunning] = useState(false);
  const portRef = useRef(null);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: 'timer' });
    portRef.current = port;

    port.onMessage.addListener((msg) => {
      console.log(msg);
      if (msg.time) {
        setTimer(msg.time);
      }
      if (msg.currentlyRunning) {
        setCurrentlyRunning(msg.currentlyRunning);
      }
    });

    return () => {
      if (portRef.current) {
        portRef.current.disconnect();
      }
    };
  }, []); 

  const startTimer = () => portRef.current?.postMessage({ action: 'startTimer' });
  const stopTimer = () => portRef.current?.postMessage({ action: 'stopTimer' });
  const resetTimer = () => portRef.current?.postMessage({ action: 'resetTimer' });
  const saveTimer = () => portRef.current?.postMessage({ action: 'saveTime' });
  const countUp = () => portRef.current?.postMessage({ action: 'countUp' });
  const countDown = (seconds) => portRef.current?.postMessage({ action: 'countDown', seconds: seconds });

  return { 
    timer, 
    currentlyRunning, 
    setCurrentlyRunning, 
    startTimer, 
    stopTimer, 
    resetTimer, 
    saveTimer,
    countUp,
    countDown
  };
};

export default useTimer;


