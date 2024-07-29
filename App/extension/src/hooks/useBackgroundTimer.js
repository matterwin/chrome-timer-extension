import { useState, useEffect, useRef } from 'react';

const useBackgroundTimer = () => {
  const [timer, setTimer] = useState('00:00.00');
  const portRef = useRef(null); // Use a ref to keep the port across re-renders

  useEffect(() => {
    const port = chrome.runtime.connect();
    portRef.current = port;

    port.onMessage.addListener((msg) => {
      console.log(msg);
      if (msg.time) {
        setTimer(msg.time);
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

  return { timer, startTimer, stopTimer, resetTimer };
};

export default useBackgroundTimer;

