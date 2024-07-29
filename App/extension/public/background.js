console.log("-=-=-=-=-=-=-=-=-=-=-");
console.log("Welcome to Hour Count");
console.log("-=-=-=-=-=-=-=-=-=-=-");

let port = null;

chrome.runtime.onConnect.addListener((connectedPort) => {
  console.log("Port connected");
  port = connectedPort;
  port.onMessage.addListener(handleMessage);
  port.onDisconnect.addListener(handleDisconnect);
  if (port) port.postMessage({ time: timeData.formattedTime });
});

function handleMessage(msg) {
  console.log(msg);
  if (msg.action === "startTimer") {
    startTimer();
  } else if (msg.action === "stopTimer") {
    stopTimer();
  } else if (msg.action === "resetTimer") {
    resetTimer();
  }
}

function handleDisconnect() {
  console.log('Port disconnected');
  port = null;
}

let timeData = {
  startTime: 0,
  currTime: 0,
  stopTime: 0,
  totalPausedDuration: 0,
  runningClockInterval: null,
  formattedTime: '00:00:00',
  currentlyRunning: false
};

function updateDisplayedTime() {
  console.log("Current time: ", timeData.formattedTime);
  const currentTime = Date.now();
  timeData.currTime = currentTime;

  const elapsed = (timeData.currTime - timeData.startTime) - timeData.totalPausedDuration;
  timeData.formattedTime = formatTime(elapsed / 1000);
  if (port) port.postMessage({ time: timeData.formattedTime });
}

function startTimer() {
  if (!timeData.currentlyRunning) {
    timeData.currentlyRunning = true;

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
}

function stopTimer() {
  if (timeData.currentlyRunning) {
    timeData.currentlyRunning = false;
    console.log("Stopped time: ", timeData.formattedTime);
    timeData.stopTime = Date.now();
    clearInterval(timeData.runningClockInterval);
  }
  if (port != null) port.postMessage({ time: timeData.formattedTime });
}

function resetTimer() {
  clearInterval(timeData.runningClockInterval);
  timeData = {
    startTime: 0,
    currTime: 0,
    stopTime: 0,
    totalPausedDuration: 0,
    runningClockInterval: null,
    formattedTime: '00:00:00',
    currentlyRunning: false
  };
  if (port) port.postMessage({ time: timeData.formattedTime });
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


