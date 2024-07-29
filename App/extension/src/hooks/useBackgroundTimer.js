import { useState, useEffect, useRef } from 'react';

const useBackgroundTimer = () => {
  const [timer, setTimer] = useState('00:00.00');
  const [currentlyRunning, setCurrentlyRunning] = useState(false);
  const portRef = useRef(null);

  useEffect(() => {
    const port = chrome.runtime.connect();
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

  return { timer, currentlyRunning, setCurrentlyRunning, startTimer, stopTimer, resetTimer, saveTimer };
};

export default useBackgroundTimer;

