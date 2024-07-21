console.log("-=-=-=-=-=-=-=-=-=-=-");
console.log("Welcome to Hour Count");
console.log("-=-=-=-=-=-=-=-=-=-=-");

var port = null;
chrome.runtime.onConnect.addListener(function(connectedPort) {
  port = connectedPort;

  port.onMessage.addListener(function(msg) {
    console.log(msg)
    if (msg.action === "startTimer")
      startTimer();
    else if (msg.action === "stopTimer")
      stopTimer();
    else if (msg.action === "resetTimer")
      resetTimer();
  });
});

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
  port.postMessage({ time: formattedTime });
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
  port.postMessage({ time: '00:00:00' });
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


