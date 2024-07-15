console.log("-=-=-=-=-=-=-=-=-=-=-");
console.log("Welcome to Hour Count");
console.log("-=-=-=-=-=-=-=-=-=-=-");

let runningClockInterval;
let timeData = {
  startTime: 0,
  stopTime: 0,
  currTime: 0,
  runningClock: false,
  runningClockInterval: null
};

function padZero(num) {
  return num < 10 ? '0' + num : num;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const sec = Math.floor(seconds % 60);
  return `${padZero(hours)}:${padZero(minutes)}:${padZero(sec)}`;
}

function updateDisplayedTime() {
  const currentTime = Date.now();
  timeData.currTime = currentTime;

  const elapsed = timeData.currTime - timeData.startTime;
  formatTime(elapsed / 1000);
}

function startTimer() { 
  timeData.startTime = new Date();
  timeData.runningClockInterval = setInterval(() => {
    console.log(updateDisplayedTime);
  }, 1000);  
}

function stopTimer() {
  clearInterval(timeData.runningClockInterval);
}

function resetTimer() {
  console.log('00:00:00');
  clearInterval(timeData.runningClockInterval);
  timeData = {
    startTime: 0,
    stopTime: 0,
    currTime: 0,
    runningClockInterval: null
  };
}

