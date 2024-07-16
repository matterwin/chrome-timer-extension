console.log("-=-=-=-=-=-=-=-=-=-=-");
console.log("Welcome to Hour Count");
console.log("-=-=-=-=-=-=-=-=-=-=-");

let timeData = {
  startTime: 0,
  currTime: 0,
  stopTime: 0,
  totalPausedDuration: 0,
  runningClockInterval: null
};

function updateDisplayedTime() {
  const currentTime = Date.now();
  timeData.currTime = currentTime;

  const elapsed = (timeData.currTime - timeData.startTime) - timeData.totalPausedDuration;
  const formattedTime = formatTime(elapsed / 1000);
  chrome.runtime.sendMessage({ action: 'updateTime', time: formattedTime });
}

function startTimer() { 
  if (timeData.stopTime) {
    timeData.totalPausedDuration += (Date.now() - timeData.stopTime);
    timeData.stopTime = 0;
  } else {
    timeData.startTime = Date.now();
  }

  timeData.runningClockInterval = setInterval(() => {
    updateDisplayedTime();
  }, 1000);  
}

function stopTimer() {
  timeData.stopTime = Date.now();
  clearInterval(timeData.runningClockInterval);
}

function resetTimer() {
  clearInterval(timeData.runningClockInterval);
  timeData = {
    startTime: 0,
    currTime: 0,
    stopTime: 0,
    totalPausedDuration: 0,
    runningClockInterval: null
  };
  chrome.runtime.sendMessage({ action: 'updateTime', time: '00:00:00' });
}

function padZero(num) {
  return num < 10 ? '0' + num : num;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const sec = Math.floor(seconds % 60);
  return `${padZero(hours)}:${padZero(minutes)}:${padZero(sec)}`;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startTimer') {
    startTimer();
    sendResponse({status: 'started'});
  } else if (message.action === 'stopTimer') {
    stopTimer();
    sendResponse({status: 'stopped'});
  } else if (message.action === 'resetTimer') {
    resetTimer();
    sendResponse({status: 'reset'});
  } else {
    sendResponse({status: 'unknown action'});
  }
  return true; // Indicates that the response is asynchronous
});
