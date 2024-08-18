import { useState, useEffect, useRef } from 'react';

const useTimer = () => {
  const [hour, setHour] = useState('00');
  const [min, setMin] = useState('00');
  const [sec, setSec] = useState('00');

  const [currentlyRunning, setCurrentlyRunning] = useState(false);
  
  const portRef = useRef(null);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: 'timer' });
    portRef.current = port;

    port.onMessage.addListener((msg) => {
      if (msg.hours !== undefined) {
        setHour(msg.hours);
      }
      if (msg.minutes !== undefined) {
        setMin(msg.minutes);
      }
      if (msg.seconds !== undefined) {
        setSec(msg.seconds);
      }

      if (msg.currentlyRunning !== undefined) {
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
  const countUp = (seconds) => portRef.current?.postMessage({ action: 'countUp', seconds: seconds });
  const countDown = (seconds) => portRef.current?.postMessage({ action: 'countDown', seconds: seconds });

  return { 
    hour, setHour,
    min, setMin,
    sec, setSec,
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


